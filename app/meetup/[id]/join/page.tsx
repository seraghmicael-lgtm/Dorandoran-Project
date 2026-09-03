import { prisma } from "@/lib/prisma";
import JoinConfirm from "./JoinConfirm";

// UI디자인 jn-03 (1084:5205) — 참여할까요?
export default async function JoinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let meetup: {
    activity: string;
    startTime: string;
    locationName: string | null;
    duration: string | null;
  } | null = null;
  try {
    meetup = await prisma.meetup.findUnique({
      where: { id },
      select: { activity: true, startTime: true, locationName: true, duration: true },
    });
  } catch (e) {
    console.error("동행 조회 실패:", e);
  }

  return (
    <JoinConfirm
      id={id}
      activity={meetup?.activity ?? "뜨개질 같이 해요"}
      startTime={meetup?.startTime ?? "오늘 오후 3시 ~ 4시"}
      locationName={meetup?.locationName ?? "동사무소 시민 회의실 · 걸어서 8분"}
      duration={meetup?.duration ?? null}
    />
  );
}
