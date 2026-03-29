import { NextRequest, NextResponse } from "next/server";

// Configurable Ollama URL - point to your self-hosted instance in production
const OLLAMA_BASE = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_URL = `${OLLAMA_BASE}/api/generate`;
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "codellama:latest";
const REQUEST_TIMEOUT = 120_000;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

function buildEnhancePrompt(userMessage: string, fileContext?: string): string {
  let prompt = `You are a prompt enhancement assistant for coding tasks. Refine the following user request into a clear, specific, and actionable coding prompt. Keep it concise but add any useful technical detail that would help produce better code.

User request: "${userMessage}"`;

  if (fileContext) {
    prompt += `\n\nRelevant file context:\n\`\`\`\n${fileContext}\n\`\`\``;
  }

  prompt += `\n\nProvide ONLY the enhanced prompt text. No explanations or meta-commentary.`;
  return prompt;
}

function buildChatPrompt(
  messages: Array<{ role: string; content: string }>,
  fileContext?: string
): string {
  const systemMessage = `You are an expert coding assistant integrated into a code editor. Provide clear, concise, and accurate help with coding tasks. When providing code, use proper formatting. When explaining concepts, be thorough but not verbose.`;

  const recentMessages = messages.slice(-10);

  let prompt = `${systemMessage}\n\n`;

  if (fileContext) {
    prompt += `Current file context:\n\`\`\`\n${fileContext}\n\`\`\`\n\n`;
  }

  for (const msg of recentMessages) {
    const role = msg.role === "user" ? "User" : "Assistant";
    prompt += `${role}: ${msg.content}\n\n`;
  }

  prompt += "Assistant: ";
  return prompt;
}

function buildGroqMessages(
  messages: Array<{ role: string; content: string }>,
  fileContext?: string,
  isEnhance?: boolean
): Array<{ role: string; content: string }> {
  const groqMessages: Array<{ role: string; content: string }> = [];

  if (isEnhance) {
    const lastMessage = messages[messages.length - 1];
    let systemContent = `You are a prompt enhancement assistant for coding tasks. Refine the user request into a clear, specific, and actionable coding prompt. Keep it concise but add any useful technical detail that would help produce better code. Provide ONLY the enhanced prompt text. No explanations or meta-commentary.`;
    if (fileContext) {
      systemContent += `\n\nRelevant file context:\n\`\`\`\n${fileContext}\n\`\`\``;
    }
    groqMessages.push({ role: "system", content: systemContent });
    groqMessages.push({ role: "user", content: lastMessage.content });
  } else {
    let systemContent = `You are an expert coding assistant integrated into a code editor. Provide clear, concise, and accurate help with coding tasks. When providing code, use proper formatting. When explaining concepts, be thorough but not verbose.`;
    if (fileContext) {
      systemContent += `\n\nCurrent file context:\n\`\`\`\n${fileContext}\n\`\`\``;
    }
    groqMessages.push({ role: "system", content: systemContent });

    const recentMessages = messages.slice(-10);
    for (const msg of recentMessages) {
      groqMessages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }
  }

  return groqMessages;
}

async function checkOllamaHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function callGroq(
  messages: Array<{ role: string; content: string }>,
  temperature: number
): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Groq API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return (data.choices?.[0]?.message?.content || "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      action,
      fileContext,
      model,
    }: {
      messages: Array<{ role: string; content: string }>;
      action?: string;
      fileContext?: string;
      model?: string;
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required and must not be empty" },
        { status: 400 }
      );
    }

    const isEnhance = action === "enhance";
    const temperature = isEnhance ? 0.3 : 0.7;

    // Quick health check before making the real request
    const isHealthy = await checkOllamaHealth();

    if (!isHealthy) {
      // Try Groq fallback if available
      if (process.env.GROQ_API_KEY) {
        try {
          const groqMessages = buildGroqMessages(
            messages,
            fileContext,
            isEnhance
          );
          const responseText = await callGroq(groqMessages, temperature);
          return NextResponse.json({ response: responseText, provider: "groq" });
        } catch (groqError) {
          console.error("Groq fallback error:", groqError);
          return NextResponse.json(
            {
              response:
                "Both Ollama and Groq are unavailable. Start Ollama with the desktop app or run `ollama serve`, or set a valid GROQ_API_KEY.",
              error: "all_providers_offline",
            },
            { status: 503 }
          );
        }
      }

      return NextResponse.json(
        {
          response:
            "Ollama is not running. Start it with the Ollama desktop app or run `ollama serve` in your terminal. Alternatively, set a GROQ_API_KEY environment variable for cloud AI fallback.",
          error: "ollama_offline",
        },
        { status: 503 }
      );
    }

    const selectedModel = model || DEFAULT_MODEL;

    let prompt: string;

    if (isEnhance) {
      const lastMessage = messages[messages.length - 1];
      prompt = buildEnhancePrompt(lastMessage.content, fileContext);
    } else {
      prompt = buildChatPrompt(messages, fileContext);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt,
          stream: false,
          options: {
            temperature,
            num_ctx: 4096,
            num_predict: 2000,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Ollama returned status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      const responseText = (data.response || "").trim();

      return NextResponse.json({ response: responseText, provider: "ollama" });
    } catch (fetchError: unknown) {
      clearTimeout(timeout);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          {
            response:
              "The request timed out after 2 minutes. The model may still be loading — try again in a moment.",
            error: "timeout",
          },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    let userMessage = `An error occurred: ${message}`;
    if (message.includes("ECONNREFUSED") || message.includes("fetch failed")) {
      userMessage =
        "Could not connect to Ollama. Make sure Ollama is running locally. Start it with the Ollama desktop app or run: ollama serve";
    } else if (message.includes("model")) {
      userMessage = `Model error: ${message}. Pull the model with: ollama pull codellama:latest`;
    }

    return NextResponse.json(
      { response: userMessage, error: message },
      { status: 500 }
    );
  }
}
