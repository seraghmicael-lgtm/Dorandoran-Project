import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UID_COOKIE } from "@/lib/session";

// 참여 취소 — JN-02 의 "참여 취소하기".
// 개설자는 여기로 못 나간다(동행 자체를 취소하는 것과 다르다 — 그건 /cancel).
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const uid = (await cookies()).get(UID_COOKIE)?.value;
    if (!uid) return NextResponse.json({ error: "no session" }, { status: 401 });

    const meetup = await prisma.meetup.findUnique({
      where: { id },
      select: { creatorId: true },
    });
    if (!meetup) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (meetup.creatorId === uid) {
      // 개설자가 빠지면 남은 사람들의 동행이 주인 없이 남는다
      return NextResponse.json({ error: "creator" }, { status: 409 });
    }

    // 이미 빠진 뒤 다시 눌러도 조용히 성공 — 결과가 같다
    await prisma.participant.deleteMany({ where: { meetupId: id, userId: uid } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in /api/meetups/[id]/leave:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
