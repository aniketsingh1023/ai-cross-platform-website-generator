import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const OLLAMA_BASE = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_URL = `${OLLAMA_BASE}/api/generate`;
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "codellama:latest";

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "Qwen/Qwen2.5-Coder-32B-Instruct";

const FRAMEWORK_PROMPTS: Record<string, { system: string; user: (desc: string) => string }> = {
  html: {
    system: `You are an expert web developer. Generate a modern responsive website using ONLY HTML and Tailwind CSS (via CDN).

Rules:
- Include a navbar, hero section, features section, and footer
- Use Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- Clean, modern UI with good color scheme
- Mobile responsive
- No explanations, no markdown fences
- Return ONLY the complete HTML document starting with <!DOCTYPE html>`,
    user: (desc: string) => `Create a complete responsive HTML website: ${desc}`,
  },
  nextjs: {
    system: `You are an expert Next.js developer. Generate a Next.js page component using Tailwind CSS.

Rules:
- Single page component (export default function Page)
- Use Tailwind CSS classes only (no external imports)
- Clean, modern UI
- No external dependencies beyond what Next.js provides
- No explanations, no markdown fences
- Return ONLY the TypeScript/JavaScript component code`,
    user: (desc: string) => `Create a Next.js page component: ${desc}`,
  },
  vue: {
    system: `You are an expert Vue.js developer. Generate a Vue 3 single-file component using Tailwind CSS.

Rules:
- Single .vue component with <template>, <script setup>, and <style scoped>
- Use Tailwind CSS classes
- Clean, modern UI
- No explanations, no markdown fences
- Return ONLY the Vue component code`,
    user: (desc: string) => `Create a Vue 3 component: ${desc}`,
  },
};

const HTML_PREVIEW_PROMPT = (desc: string, framework: string) => ({
  system: `You are an expert web developer. Generate a modern responsive website using ONLY HTML and Tailwind CSS (via CDN).
This is a preview for a ${framework} website.

Rules:
- Include navbar, hero, features, footer
- Use Tailwind CSS CDN: <script src="https://cdn.tailwindcss.com"></script>
- Clean, modern UI
- Mobile responsive
- No explanations, no markdown fences
- Return ONLY the complete HTML document starting with <!DOCTYPE html>`,
  user: `Create a preview HTML page for: ${desc}`,
});

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

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const ollamaHealthy = await checkOllamaHealth();

  if (ollamaHealthy) {
    const prompt = `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`;
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.7, num_ctx: 8192, num_predict: 4000 },
      }),
      signal: AbortSignal.timeout(90_000),
    });

    if (response.ok) {
      const data = await response.json();
      return (data.response || "").trim();
    }
  }

  // Fallback: HuggingFace
  const token = process.env.HF_TOKEN;
  if (!token) throw new Error("No AI provider available. Run Ollama locally or set HF_TOKEN.");

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "Unknown error");
    throw new Error(`AI API returned ${response.status}: ${err}`);
  }

  const data = await response.json();
  return (data.choices?.[0]?.message?.content || "").trim();
}

function cleanCode(raw: string): string {
  return raw
    .replace(/^```[\w]*\n?/gm, "")
    .replace(/```$/gm, "")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, framework } = await request.json() as {
      prompt: string;
      framework: "html" | "nextjs" | "vue";
    };

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const fw = (framework || "html").toLowerCase() as "html" | "nextjs" | "vue";
    const config = FRAMEWORK_PROMPTS[fw] || FRAMEWORK_PROMPTS.html;

    // Generate framework code
    const frameworkCode = cleanCode(
      await callAI(config.system, config.user(prompt))
    );

    let previewHtml: string;

    if (fw === "html") {
      previewHtml = frameworkCode;
    } else {
      // Generate HTML preview for non-HTML frameworks
      const previewConfig = HTML_PREVIEW_PROMPT(prompt, fw);
      previewHtml = cleanCode(
        await callAI(previewConfig.system, previewConfig.user)
      );
    }

    return NextResponse.json({
      code: frameworkCode,
      previewHtml,
      framework: fw,
    });
  } catch (error: any) {
    console.error("Website generation error:", error);
    return NextResponse.json(
      { error: error.message || "Generation failed" },
      { status: 500 }
    );
  }
}
