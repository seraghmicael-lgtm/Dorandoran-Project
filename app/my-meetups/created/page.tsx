import { cookies } from "next/headers";
import WireframeLayout from "@/components/WireframeLayout";
import MeetupCard from "@/components/ds/MeetupCard";
import MyMeetupTabs from "@/components/ds/MyMeetupTabs";
import AdBanner from "@/components/ds/AdBanner";
import PastCard from "@/components/ds/PastCard";
import PushDemo from "@/components/ds/PushDemo";
import { prisma } from "@/lib/prisma";
import { UID_COOKIE } from "@/lib/session";

// UI디자인 MY-02 (1123:3153) — 만든 동행
export const dynamic = "force-dynamic";

const fmtCancelDate = (d: Date | null) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d ?? new Date());

export default async function MyMeetupsCreatedPage() {
  const uid = (await cookies()).get(UID_COOKIE)?.value;

  let rows: {
    id: string;
    startTime: string;
    activity: string;
    locationName: string | null;
    maxPeople: number;
    status: string;
    cancelledAt: Date | null;
    _count: { participants: number };
  }[] = [];
  try {
    if (uid) {
      rows = await prisma.meetup.findMany({
        where: { creatorId: uid },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          startTime: true,
          activity: true,
          locationName: true,
          maxPeople: true,
          status: true,
          cancelledAt: true,
          _count: { select: { participants: true } },
        },
      });
    }
  } catch (e) {
    console.error("만든 동행 조회 실패:", e);
  }

  const open = rows.filter((m) => m.status === "open");
  const closed = rows.filter((m) => m.status !== "open");

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      {/* 프로토타입 — 알림 팝업(PUSH-01~03) 트리거. Figma 목업의 배경 화면이 이 화면이다 */}
      <PushDemo />
      <MyMeetupTabs active="created" />

      <div className="flex-1 px-5 pt-5 flex flex-col gap-6 pb-6">
        <section className="flex flex-col gap-3">
          <h2 className="text-[17px] font-bold text-black">진행중</h2>
          {open.length > 0 ? (
            open.map((m) => (
              <MeetupCard
                key={m.id}
                id={m.id}
                startTime={m.startTime}
                activity={m.activity}
                locationName={m.locationName}
                joined={m._count.participants}
                maxPeople={m.maxPeople}
              />
            ))
          ) : (
            <p className="text-[15px] text-muted">아직 올린 동행이 없어요.</p>
          )}
        </section>

        <AdBanner />

        {closed.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[17px] font-bold text-black">지난 동행</h2>
            {closed.map((m) => (
              <PastCard
                key={m.id}
                id={m.id}
                activity={m.activity}
                note={`${fmtCancelDate(m.cancelledAt)} 취소하셨어요`}
              />
            ))}
          </section>
        )}
      </div>
    </WireframeLayout>
  );
}
