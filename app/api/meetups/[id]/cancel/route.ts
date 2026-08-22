import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 만든 동행 취소 — 작성자 본인만 가능. status를 cancelled로 바꾸고 시각을 기록한다.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const uid = (await cookies()).get("uid")?.value;
    if (!uid) {
      return NextResponse.json({ error: "no session" }, { status: 401 });
    }

    const meetup = await prisma.meetup.findUnique({ where: { id } });
    if (!meetup) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    if (meetup.creatorId !== uid) {
      return NextResponse.json({ error: "not the creator" }, { status: 403 });
    }
    if (meetup.status === "cancelled") {
      return NextResponse.json(meetup); // 이미 취소됨 — 멱등 처리
    }

    const updated = await prisma.meetup.update({
      where: { id },
      data: { status: "cancelled", cancelledAt: new Date() },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error cancelling meetup:", error);
    return NextResponse.json({ error: "Failed to cancel" }, { status: 500 });
  }
}
