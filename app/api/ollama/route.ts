import { NextResponse } from "next/server";

const OLLAMA_BASE = process.env.OLLAMA_URL || "http://localhost:11434";

export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) throw new Error("Ollama not ok");

    const data = await res.json();
    const models = data.models?.map((m: any) => m.name) || [];

    return NextResponse.json({ status: "connected", models, provider: "ollama" });
  } catch {
    // Ollama unavailable - check if HF_TOKEN is set as fallback
    if (process.env.HF_TOKEN) {
      return NextResponse.json({
        status: "connected",
        models: ["Qwen2.5-Coder-1.5B (HuggingFace)"],
        provider: "huggingface",
      });
    }
    return NextResponse.json({ status: "disconnected", models: [] });
  }
}
