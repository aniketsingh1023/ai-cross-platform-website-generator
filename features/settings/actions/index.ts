"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function updateProfile(data: { name: string; image?: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        image: data.image || undefined,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { error: "Failed to update profile" };
  }
}

export async function deleteAccount() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Not authenticated" };
    }

    const userId = session.user.id;

    // Delete all related data - Prisma cascade should handle most of this
    // but we explicitly delete to be thorough
    await db.chatMessage.deleteMany({ where: { userId } });
    await db.starmark.deleteMany({ where: { userId } });

    // Delete template files for user's playgrounds
    const playgrounds = await db.playground.findMany({
      where: { userId },
      select: { id: true },
    });
    const playgroundIds = playgrounds.map((p) => p.id);

    if (playgroundIds.length > 0) {
      await db.templateFile.deleteMany({
        where: { playgroundId: { in: playgroundIds } },
      });
    }

    await db.playground.deleteMany({ where: { userId } });
    await db.account.deleteMany({ where: { userId } });
    await db.user.delete({ where: { id: userId } });
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { error: "Failed to delete account" };
  }

  redirect("/auth/sign-in");
}
