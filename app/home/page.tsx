import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import MeetupCard from "@/components/ds/MeetupCard";
import { BrandHeaderLogo, Illust } from "@/components/ds/BrandMark";
import AdBanner from "@/components/ds/AdBanner";
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
    duration: string | null;
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
        duration: true,
        maxPeople: true,
        _count: { select: { participants: true } },
      },
    });
  } catch (e) {
    console.error("동행 목록 조회 실패:", e);
  }

  // 카드 세 장이 한 묶음(list). 묶음과 묶음 사이에 동네광고가 들어간다.
  const groups: (typeof meetups)[] = [];
  for (let i = 0; i < meetups.length; i += 3) groups.push(meetups.slice(i, i + 3));

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      {/* ds_navigation_top(1084:1336) — 60px. 왼쪽 20, 오른쪽은 8 안에 48 짜리 아이콘 버튼. */}
      <header className="h-[60px] shrink-0 pl-5 pr-2 flex items-center justify-between border-b border-[#E5E5E5] bg-white">
        <BrandHeaderLogo width={95} />
        <span aria-hidden="true" className="size-12 flex items-center justify-center">
          <Image src="/illust/notice.svg" alt="" width={24} height={24} />
        </span>
      </header>

      {meetups.length > 0 ? (
        /* content(1083:652) — 연둣빛 바탕 위에 카드 목록. 위 28 · 아래 40 */
        <div className="grow bg-page-brand pt-7 pb-10">
          {/* title(1083:355) — 좌우 16, 20px 볼드. 동네 이름만 진한 색 */}
          <div className="flex items-center gap-1 px-4 text-[20px] font-bold leading-[1.3]">
            <span className="text-sub">오늘</span>
            <span className="flex items-center px-1 py-0.5">
              <Image src="/illust/fill-gps-dark.svg" alt="" width={20} height={20} />
              <span className="text-ink">{neighborhood}</span>
            </span>
            <span className="text-sub">마실 어떠세요?</span>
          </div>

          {/* card-list-wrap(1083:651) — 카드 묶음 사이에 동네광고가 통째로 낀다 */}
          <div className="mt-4 flex flex-col gap-5">
            {groups.map((group, gi) => (
              <div key={gi} className="contents">
                <div className="flex flex-col gap-5 px-4">
                  {group.map((m) => (
                    <MeetupCard
                      key={m.id}
                      id={m.id}
                      startTime={m.startTime}
                      activity={m.activity}
                      locationName={m.locationName}
                      duration={m.duration}
                      joined={m._count.participants}
                      maxPeople={m.maxPeople}
                    />
                  ))}
                </div>
                {gi < groups.length - 1 && <AdBanner />}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* on-06_2 빈 상태 — 프레임 기준 그림 205 · 글자 391 · 버튼 516.
           헤더(60)가 끝난 자리에서 145 를 띄우면 그림이 205 에 온다.
           이 화면에는 "오늘 …마실 어떠세요?" 인사말이 없다. */
        <div className="flex-1 flex flex-col items-center pt-[145px]">
          <Illust name="empty" box={156} />

          <div className="mt-[30px] w-[328px] flex flex-col gap-4 text-center">
            <p className="text-[28px] font-bold leading-[1.3] tracking-[-0.28px] text-[#171717]">
              아직 열린 동행이 없어요
            </p>
            <p className="text-[18px] font-medium leading-[1.5] text-[#777777]">
              먼저 하나 열어보실래요?
            </p>
          </div>

          <Link
            href="/create/activity?new=1"
            className="mt-[46px] w-[328px] h-12 rounded-xl bg-[#32952D] text-white flex items-center justify-center text-[18px] font-medium"
          >
            동행 만들기
          </Link>
        </div>
      )}
    </WireframeLayout>
  );
}
