import { NextRequest, NextResponse } from "next/server";

const OLLAMA_BASE = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_URL = `${OLLAMA_BASE}/api/generate`;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

function detectLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript (react)",
    js: "javascript",
    jsx: "javascript (react)",
    py: "python",
    rs: "rust",
    go: "go",
    java: "java",
    cpp: "c++",
    c: "c",
    rb: "ruby",
    php: "php",
    swift: "swift",
    kt: "kotlin",
    cs: "c#",
    html: "html",
    css: "css",
    scss: "scss",
    vue: "vue",
    svelte: "svelte",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    sql: "sql",
    sh: "bash",
    bash: "bash",
    zsh: "zsh",
  };
  return languageMap[ext] || ext || "plaintext";
}

function detectFramework(code: string): string {
  const patterns: [RegExp, string][] = [
    [/import\s+.*from\s+['"]react['"]|import\s+React/m, "react"],
    [/import\s+.*from\s+['"]next\//m, "next"],
    [/import\s+.*from\s+['"]vue['"]|from\s+['"]@vue\//m, "vue"],
    [/import\s+.*from\s+['"]@angular\//m, "angular"],
    [/import\s+.*from\s+['"]express['"]/m, "express"],
    [/import\s+.*from\s+['"]hono['"]/m, "hono"],
  ];

  for (const [regex, framework] of patterns) {
    if (regex.test(code)) return framework;
  }
  return "unknown";
}

function detectIncompleteConstructs(lines: string[], cursorLine: number): string[] {
  const hints: string[] = [];
  const contextStart = Math.max(0, cursorLine - 5);
  const contextEnd = Math.min(lines.length, cursorLine + 1);
  const nearby = lines.slice(contextStart, contextEnd).join("\n");

  if (/\b(if|for|while|switch)\s*\([^)]*\)\s*\{?\s*$/.test(nearby)) {
    hints.push("incomplete control flow statement — complete the block body");
  }
  if (/\bfunction\s+\w+\s*\([^)]*\)\s*\{?\s*$/.test(nearby) || /=>\s*\{?\s*$/.test(nearby)) {
    hints.push("incomplete function definition — complete the function body");
  }

  const openBraces = (nearby.match(/\{/g) || []).length;
  const closeBraces = (nearby.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    hints.push("unclosed curly brace — close the block");
  }

  const openBrackets = (nearby.match(/\[/g) || []).length;
  const closeBrackets = (nearby.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    hints.push("unclosed array literal — complete the array");
  }

  if (/(?:const|let|var)\s+\w+\s*=\s*$/.test(nearby)) {
    hints.push("incomplete variable assignment — provide the value");
  }

  return hints;
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

async function callGroqCodeSuggestion(prompt: string): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert code completion assistant. Provide ONLY the code that should be inserted at the cursor position. Do NOT include any explanation, comments about the completion, or markdown formatting. Just raw code.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
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
      code,
      cursorLine,
      cursorColumn,
      suggestionType,
      filename,
    }: {
      code: string;
      cursorLine: number;
      cursorColumn: number;
      suggestionType: string;
      filename: string;
    } = body;

    const lines = code.split("\n");
    const contextStart = Math.max(0, cursorLine - 10);
    const contextEnd = Math.min(lines.length, cursorLine + 10);
    const beforeCursor = lines.slice(contextStart, cursorLine).join("\n");
    const afterCursor = lines.slice(cursorLine, contextEnd).join("\n");
    const currentLine = lines[cursorLine] || "";

    const language = detectLanguage(filename);
    const framework = detectFramework(code);
    const incompleteHints = detectIncompleteConstructs(lines, cursorLine);

    let prompt = `Language: ${language}
${framework !== "unknown" ? `Framework: ${framework}` : ""}
File: ${filename}
Suggestion type: ${suggestionType || "completion"}
Cursor position: line ${cursorLine}, column ${cursorColumn}

Code before cursor:
\`\`\`
${beforeCursor}
\`\`\`

Current line: ${currentLine}

Code after cursor:
\`\`\`
${afterCursor}
\`\`\`
`;

    if (incompleteHints.length > 0) {
      prompt += `\nDetected patterns:\n${incompleteHints.map((h) => `- ${h}`).join("\n")}\n`;
    }

    prompt += `\nProvide ONLY the code completion. No markdown, no explanations, no backticks. Just the raw code to insert.`;

    // Check Ollama health first
    const isHealthy = await checkOllamaHealth();

    if (!isHealthy) {
      // Try Groq fallback
      if (process.env.GROQ_API_KEY) {
        try {
          let suggestion = await callGroqCodeSuggestion(prompt);
          suggestion = suggestion
            .replace(/^```[\w]*\n?/gm, "")
            .replace(/```$/gm, "")
            .trim();
          return NextResponse.json({
            suggestion,
            language,
            framework,
            provider: "groq",
          });
        } catch (groqError) {
          console.error("Groq code suggestion fallback error:", groqError);
          return NextResponse.json(
            {
              suggestion: "",
              language,
              framework,
              error: "Both Ollama and Groq are unavailable.",
            },
            { status: 503 }
          );
        }
      }

      return NextResponse.json(
        {
          suggestion: "",
          language,
          framework,
          error: "Ollama is not running. Set GROQ_API_KEY for cloud fallback.",
        },
        { status: 503 }
      );
    }

    const ollamaPrompt = `You are an expert code completion assistant. Provide ONLY the code that should be inserted at the cursor position. Do NOT include any explanation, comments about the completion, or markdown formatting.\n\n${prompt}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s for code suggestions

    try {
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "codellama:latest",
          prompt: ollamaPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            num_predict: 300,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const data = await response.json();
      let suggestion = (data.response || "").trim();

      // Strip markdown code fences if present
      suggestion = suggestion
        .replace(/^```[\w]*\n?/gm, "")
        .replace(/```$/gm, "")
        .trim();

      return NextResponse.json({
        suggestion,
        language,
        framework,
        provider: "ollama",
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeout);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        return NextResponse.json(
          { suggestion: "", language, framework, error: "Request timed out" },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    console.error("Code suggestion error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate suggestion";
    return NextResponse.json(
      { suggestion: "", language: "unknown", framework: "unknown", error: message },
      { status: 500 }
    );
  }
}
