import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UID_COOKIE, UID_COOKIE_ATTRS } from "@/lib/session";

// 동행 참여 — jn-03 의 "참여할게요".
// 자리가 남아 있을 때만 받는다. 같은 사람이 두 번 눌러도 한 번만 들어간다.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const store = await cookies();
    let uid = store.get(UID_COOKIE)?.value;

    // 로그인 전이면 데모 사용자를 만들어 붙인다(둘러보다 참여하는 흐름)
    if (!uid || !(await prisma.user.findUnique({ where: { id: uid } }))) {
      const demo = await prisma.user.create({ data: { nickname: "동네주민" } });
      uid = demo.id;
      store.set(UID_COOKIE, uid, UID_COOKIE_ATTRS);
    }

    const meetup = await prisma.meetup.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!meetup) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (meetup.status === "cancelled") {
      return NextResponse.json({ error: "cancelled" }, { status: 409 });
    }

    const already = meetup.participants.some((p) => p.userId === uid);
    if (!already && meetup.participants.length >= meetup.maxPeople) {
      return NextResponse.json({ error: "full" }, { status: 409 });
    }

    if (!already) {
      // 유니크 제약이 있으니 동시에 눌러도 한 줄만 남는다
      await prisma.participant.create({ data: { meetupId: id, userId: uid } });
    }

    return NextResponse.json({ ok: true, already });
  } catch (error) {
    console.error("Error in /api/meetups/[id]/join:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
