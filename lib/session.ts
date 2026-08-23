import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export const UID_COOKIE = "uid";

/** uid 쿠키 공통 속성 — 데모 로그인·모임 생성 양쪽이 같은 값을 쓴다 */
export const UID_COOKIE_ATTRS = {
  httpOnly: true,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax",
} as const;

export async function getSessionUid(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(UID_COOKIE)?.value;
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
