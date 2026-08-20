import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export async function getSessionUid(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("uid")?.value;
}

export async function getCurrentUser(): Promise<User | null> {
  const uid = await getSessionUid();
  if (!uid) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: uid },
    });
    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}
