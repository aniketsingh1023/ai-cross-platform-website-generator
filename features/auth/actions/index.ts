"use server";
import { auth, signIn } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        id,
      },
      include: {
        accounts: true,
      },
    });

    return user;
  } catch (error) {
    logger.error({ error, userId: id }, "Error fetching user by ID");
    return null;
  }
};

export const getAccountByUserId = async (userId: string) => {
  try {
    const account = await db.account.findFirst({
      where: {
        userId,
      },
    });
    return account;
  } catch (error) {
    logger.error({ error, userId }, "Error fetching account by user ID");
    return null;
  }
};

export const getCurrentUser = async () => {
  const user = await auth();
  return user?.user;
};

export const handleSignIn = async (provider: "google" | "github") => {
  await signIn(provider, { redirectTo: "/dashboard" });
};

