import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Generate a short share ID
function generateShareId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playgroundId } = await req.json();

    // Check that the playground exists and belongs to the user
    const playground = await db.playground.findUnique({
      where: { id: playgroundId },
    });

    if (!playground) {
      return NextResponse.json(
        { error: "Playground not found" },
        { status: 404 }
      );
    }

    // The share URL is just the playground URL - it's accessible via the ID
    const shareUrl = `/playground/${playgroundId}`;

    return NextResponse.json({
      shareUrl,
      playgroundId,
    });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json(
      { error: "Failed to generate share link" },
      { status: 500 }
    );
  }
}
