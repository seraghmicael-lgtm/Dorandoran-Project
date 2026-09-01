import { cookies } from "next/headers";
import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import MeetupCard from "@/components/ds/MeetupCard";
import BrandMark from "@/components/ds/BrandMark";
import { prisma } from "@/lib/prisma";
import { UID_COOKIE } from "@/lib/session";

// UI디자인 on-06 (1089:7978) — 홈. 오늘 열린 동행을 카드로 늘어놓는다.
// 지금까지 고정 카드였는데, 실제로 올린 동행을 읽어 온다.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const uid = (await cookies()).get(UID_COOKIE)?.value;

  let neighborhood = "우리 동네";
  let meetups: {
    id: string;
    startTime: string;
    activity: string;
    locationName: string | null;
    maxPeople: number;
    _count: { participants: number };
  }[] = [];

  try {
    if (uid) {
      const me = await prisma.user.findUnique({ where: { id: uid }, select: { neighborhood: true } });
      if (me?.neighborhood) neighborhood = me.neighborhood;
    }
    meetups = await prisma.meetup.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        startTime: true,
        activity: true,
        locationName: true,
        maxPeople: true,
        _count: { select: { participants: true } },
      },
    });
  } catch (e) {
    console.error("동행 목록 조회 실패:", e);
  }

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <header className="h-[60px] px-5 flex items-center justify-between border-b border-gray-100 bg-white">
        <span className="flex items-center gap-1.5">
          <BrandMark size={26} />
          <span className="text-[19px] font-bold text-brand-light">오늘마실</span>
        </span>
        <span aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 16V11a6 6 0 1 0-12 0v5l-1.5 2.5h15L18 16Z"
              stroke="#171717"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path d="M10 19.5a2 2 0 0 0 4 0" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </header>

      <div className="flex-1 px-5 pt-6 flex flex-col">
        <p className="text-[19px] font-bold text-black flex items-center gap-1">
          오늘
          <span className="inline-flex items-center gap-0.5 text-accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
            </svg>
            {neighborhood}
          </span>
          마실 어떠세요?
        </p>

        {meetups.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3 pb-6">
            {meetups.map((m) => (
              <MeetupCard
                key={m.id}
                id={m.id}
                startTime={m.startTime}
                activity={m.activity}
                locationName={m.locationName}
                joined={m._count.participants}
                maxPeople={m.maxPeople}
              />
            ))}
          </div>
        ) : (
          /* on-06_2 빈 상태 */
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 pb-16">
            <BrandMark size={120} />
            <div className="flex flex-col gap-2">
              <p className="text-[20px] font-bold text-black">아직 열린 동행이 없어요</p>
              <p className="text-[15px] text-muted">먼저 하나 열어보실래요?</p>
            </div>
            <Link
              href="/create/activity?new=1"
              className="w-full h-[54px] rounded-lg bg-brand text-white flex items-center justify-center text-[17px] font-bold"
            >
              동행 만들기
            </Link>
          </div>
        )}
      </div>
    </WireframeLayout>
  );
}
