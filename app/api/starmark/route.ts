import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { playgroundId, isMarked } = await req.json();
    const userId = (session.user as any).id;

    const starmark = await db.starmark.upsert({
      where: {
        userId_playgroundId: {
          userId,
          playgroundId,
        },
      },
      update: { isMarked },
      create: {
        userId,
        playgroundId,
        isMarked,
      },
    });

    return NextResponse.json(starmark);
  } catch (error) {
    console.error("Starmark error:", error);
    return NextResponse.json(
      { error: "Failed to update starmark" },
      { status: 500 }
    );
  }
}
