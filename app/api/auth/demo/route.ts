import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADJECTIVES = [
  "즐거운",
  "신나는",
  "친절한",
  "행복한",
  "다정한",
  "따뜻한",
  "부지런한",
  "용감한",
  "지혜로운",
  "밝은",
];

const ANIMALS = [
  "다람쥐",
  "호랑이",
  "토끼",
  "사슴",
  "곰",
  "여우",
  "너구리",
  "강아지",
  "고양이",
  "펭귄",
];

function getRandomNickname(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj}${animal}`;
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const uid = cookieStore.get("uid")?.value;

    let user = null;
    if (uid) {
      user = await prisma.user.findUnique({
        where: { id: uid },
      });
    }

    if (!user) {
      const nickname = getRandomNickname();
      user = await prisma.user.create({
        data: {
          nickname,
        },
      });
    }

    cookieStore.set("uid", user.id, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
