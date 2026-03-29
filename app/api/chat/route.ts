import { NextRequest, NextResponse } from "next/server";

// Ollama (local dev)
const OLLAMA_BASE = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_URL = `${OLLAMA_BASE}/api/generate`;
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "codellama:latest";
const REQUEST_TIMEOUT = 120_000;

// HuggingFace Inference API (free production fallback)
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "Qwen/Qwen2.5-Coder-32B-Instruct";

function buildChatMessages(
  messages: Array<{ role: string; content: string }>,
  fileContext?: string,
  isEnhance?: boolean
): Array<{ role: string; content: string }> {
  const result: Array<{ role: string; content: string }> = [];

  if (isEnhance) {
    const lastMessage = messages[messages.length - 1];
    let sys = `You are a prompt enhancement assistant for coding tasks. Refine the user request into a clear, specific, actionable coding prompt. Provide ONLY the enhanced prompt text.`;
    if (fileContext) sys += `\n\nFile context:\n\`\`\`\n${fileContext}\n\`\`\``;
    result.push({ role: "system", content: sys });
    result.push({ role: "user", content: lastMessage.content });
  } else {
    let sys = `You are an expert coding assistant in a code editor. Provide clear, concise help. Use proper code formatting.`;
    if (fileContext) sys += `\n\nCurrent file:\n\`\`\`\n${fileContext}\n\`\`\``;
    result.push({ role: "system", content: sys });
    for (const msg of messages.slice(-10)) {
      result.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }
  }

  return result;
}

function buildOllamaPrompt(
  messages: Array<{ role: string; content: string }>,
  fileContext?: string,
  isEnhance?: boolean
): string {
  if (isEnhance) {
    const lastMessage = messages[messages.length - 1];
    let p = `You are a prompt enhancement assistant. Refine this request into a clear coding prompt.\n\nUser request: "${lastMessage.content}"`;
    if (fileContext) p += `\n\nFile context:\n\`\`\`\n${fileContext}\n\`\`\``;
    p += `\n\nProvide ONLY the enhanced prompt:`;
    return p;
  }

  let p = `You are an expert coding assistant. Be concise and use code formatting.\n\n`;
  if (fileContext) p += `Current file:\n\`\`\`\n${fileContext}\n\`\`\`\n\n`;
  for (const msg of messages.slice(-10)) {
    p += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n\n`;
  }
  p += "Assistant: ";
  return p;
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

async function callHuggingFace(
  messages: Array<{ role: string; content: string }>,
  temperature: number
): Promise<string> {
  const token = process.env.HF_TOKEN;
  if (!token) throw new Error("HF_TOKEN not set");

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages,
      temperature,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`HF API returned ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return (data.choices?.[0]?.message?.content || "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, action, fileContext, model } = body as {
      messages: Array<{ role: string; content: string }>;
      action?: string;
      fileContext?: string;
      model?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const isEnhance = action === "enhance";
    const temperature = isEnhance ? 0.3 : 0.7;

    // Try Ollama first (local dev or self-hosted)
    const ollamaHealthy = await checkOllamaHealth();

    if (ollamaHealthy) {
      const selectedModel = model || DEFAULT_MODEL;
      const prompt = buildOllamaPrompt(messages, fileContext, isEnhance);

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
            options: { temperature, num_ctx: 4096, num_predict: 2000 },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            response: (data.response || "").trim(),
            provider: "ollama",
          });
        }
      } catch (e: any) {
        clearTimeout(timeout);
        if (e?.name === "AbortError") {
          return NextResponse.json(
            { response: "Request timed out. Try again.", error: "timeout" },
            { status: 504 }
          );
        }
      }
    }

    // Fallback: HuggingFace Inference API (free)
    if (process.env.HF_TOKEN) {
      try {
        const hfMessages = buildChatMessages(messages, fileContext, isEnhance);
        const responseText = await callHuggingFace(hfMessages, temperature);
        return NextResponse.json({ response: responseText, provider: "huggingface" });
      } catch (hfError: any) {
        console.error("HF fallback error:", hfError);
        return NextResponse.json(
          {
            response: `AI service error: ${hfError.message}. Make sure Ollama is running locally, or check your HF_TOKEN.`,
            error: "provider_error",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        response:
          "No AI provider available. Run Ollama locally (`ollama serve`) or set HF_TOKEN for cloud AI.",
        error: "no_provider",
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { response: `Error: ${error.message}`, error: error.message },
      { status: 500 }
    );
  }
}
