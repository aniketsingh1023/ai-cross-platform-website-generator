import { NextResponse } from "next/server";

const OLLAMA_BASE = process.env.OLLAMA_URL || "http://localhost:11434";

export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ status: "disconnected", models: [] });
    }

    const data = await res.json();
    const models = data.models?.map((m: any) => m.name) || [];

    return NextResponse.json({ status: "connected", models });
  } catch {
    // Check if GROQ_API_KEY is available as fallback
    if (process.env.GROQ_API_KEY) {
      return NextResponse.json({
        status: "connected",
        models: ["llama-3.1-8b-instant (Groq Cloud)"],
        provider: "groq",
      });
    }
    return NextResponse.json({ status: "disconnected", models: [] });
  }
}
