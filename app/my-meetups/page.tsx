import { cookies } from "next/headers";
import WireframeLayout from "@/components/WireframeLayout";
import MeetupCard from "@/components/ds/MeetupCard";
import MyMeetupTabs from "@/components/ds/MyMeetupTabs";
import AdBanner from "@/components/ds/AdBanner";
import PastCard from "@/components/ds/PastCard";
import { prisma } from "@/lib/prisma";
import { UID_COOKIE } from "@/lib/session";

// UI디자인 MY-01 (1123:2189) — 참여한 동행
export const dynamic = "force-dynamic";

export default async function MyMeetupsPage() {
  const uid = (await cookies()).get(UID_COOKIE)?.value;

  let rows: {
    id: string;
    startTime: string;
    activity: string;
    locationName: string | null;
    maxPeople: number;
    status: string;
    _count: { participants: number };
  }[] = [];
  try {
    if (uid) {
      rows = await prisma.meetup.findMany({
        // 내가 참여자로 들어가 있는 동행 — 내가 만든 것은 "만든 동행" 탭이 맡는다
        where: { participants: { some: { userId: uid } }, creatorId: { not: uid } },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          startTime: true,
          activity: true,
          locationName: true,
          maxPeople: true,
          status: true,
          _count: { select: { participants: true } },
        },
      });
    }
  } catch (e) {
    console.error("참여한 동행 조회 실패:", e);
  }

  const open = rows.filter((m) => m.status === "open");
  const past = rows.filter((m) => m.status !== "open");

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <MyMeetupTabs active="joined" />

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
            <p className="text-[15px] text-muted">아직 참여한 동행이 없어요.</p>
          )}
        </section>

        <AdBanner />

        {past.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[17px] font-bold text-black">지난 동행</h2>
            {past.map((m) => (
              <PastCard key={m.id} id={m.id} activity={m.activity} note="다녀오셨어요" />
            ))}
          </section>
        )}
      </div>
    </WireframeLayout>
  );
}
