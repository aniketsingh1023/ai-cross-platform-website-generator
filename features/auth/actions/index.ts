"use server";
import { auth, signIn } from "@/auth";
import { db } from "@/lib/db";

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
    console.error("Error fetching user by ID:", error);
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
    console.log(error);
    return null;
  }
};

export const getCurrentUser = async () => {
  const user = await auth();
  return user?.user;
};

export const handleSignIn = async (provider: "google" | "github") => {
  await signIn(provider, { redirectTo: "/" });
};
