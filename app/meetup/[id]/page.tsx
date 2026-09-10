import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import WireframeLayout from "@/components/WireframeLayout";
import Field from "@/components/ds/Field";
import { footerButtonClass } from "@/components/ds/StepFooter";
import { prisma } from "@/lib/prisma";
import { directionsUrl } from "@/lib/places";
import { UID_COOKIE } from "@/lib/session";
import { formatClockWithColons } from "@/lib/koreanTime";
import LeaveMeetupButton from "@/components/LeaveMeetupButton";
import CancelCreatedButton from "@/components/CancelCreatedButton";

// UI디자인 JN-02 갱신분(1235:3022 · MY-01-01 · MY-02-01) — 자세히 보기
// 상단 바 60 · 제목 블록 y88 · 카드 목록 y185(카드 사이 20) · 하단 버튼 pb 40.
// 필드마다 "라벨(+보조정보) → 값" 두 줄, 라벨 앞 아이콘은 없다.
// 참여자 아바타는 Figma 내보내기 그대로(색만 돌려 쓴다 — 역할과는 무관한 장식).
const AVATARS = ["/illust/avatar-1.svg", "/illust/avatar-2.svg", "/illust/avatar-3.svg"];

// ds_card(1235:3031 · 1235:3070) — 흰 바탕 · 12 라운드 · 안쪽 16 · card 이펙트(0 2px 6px #00000014)
const CARD = "rounded-xl bg-white p-4 shadow-[0_2px_6px_rgba(0,0,0,0.08)] flex flex-col gap-4";

/** 자리·시간 상태 — 문구는 UI디자인의 상태 변형에서, 색은 ds_tag 토큰에서 가져왔다 */
function statusOf(count: number, max: number, joined: boolean) {
  if (joined) return { label: "나 포함", tone: "bg-brand-alpha-15 text-brand" };
  if (count >= max) return { label: "다 찼어요", tone: "bg-count-full-bg text-count-full-ink" };
  if (count === max - 1) return { label: "한 자리 남았어요", tone: "bg-tag-soon-bg text-tag-soon-ink" };
  return { label: "참여 가능", tone: "bg-brand-alpha-15 text-brand" };
}

export default async function MeetupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const uid = (await cookies()).get(UID_COOKIE)?.value;

  interface Detail {
    activity: string;
    startTime: string;
    locationName: string | null;
    maxPeople: number;
    duration: string | null;
    goAnyway: boolean;
    message: string | null;
    lat: number | null;
    lng: number | null;
    creatorId: string;
    participants: { userId: string; user: { nickname: string } }[];
  }

  let meetup: Detail | null = null;
  try {
    meetup = await prisma.meetup.findUnique({
      where: { id },
      select: {
        activity: true,
        startTime: true,
        locationName: true,
        maxPeople: true,
        duration: true,
        goAnyway: true,
        message: true,
        lat: true,
        lng: true,
        creatorId: true,
        participants: {
          select: { userId: true, user: { select: { nickname: true } } },
          orderBy: { joinedAt: "asc" },
        },
      },
    });
  } catch (e) {
    console.error("동행 조회 실패:", e);
  }

  const activity = meetup?.activity ?? "뜨개질 같이 해요";
  const startTime = meetup?.startTime ?? "오늘 오후 3시 ~ 4시";
  const [placeName, walk] = (meetup?.locationName ?? "동사무소 시민 회의실 · 걸어서 8분").split(" · ");
  const maxPeople = meetup?.maxPeople ?? 3;
  const goAnyway = meetup?.goAnyway ?? true;
  const people = meetup?.participants ?? [];
  const joined = Boolean(uid && people.some((p) => p.userId === uid));
  const status = statusOf(people.length, maxPeople, joined);
  const startClock = startTime.replace(/^오늘\s*/, "").split(" ~ ")[0];

  const backLink = joined
    ? meetup?.creatorId === uid
      ? "/my-meetups/created"
      : "/my-meetups"
    : "/home";

  // 한 장짜리 카드 안의 줄들 — 마지막 줄만 아래 구분선이 없다(Figma Frame 249)
  const rows = [
    <Field
      key="duration"
      label="걸리는 시간(소요시간)"
      meta={formatClockWithColons(startTime)}
      value={meetup?.duration ?? "미정"}
    />,
    <Field
      key="place"
      label="만나는 곳"
      meta={walk}
      value={placeName}
      trailing={
        <Link
          href={directionsUrl({ lat: meetup?.lat, lng: meetup?.lng, name: placeName })}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 px-3 h-9 min-w-[90px] justify-center rounded-lg bg-white border border-line text-[14px] font-bold leading-[1.4] text-[#5b5b5b]"
        >
          길찾기
          <Image src="/illust/chevron-right.svg" alt="" width={16} height={16} />
        </Link>
      }
    />,
    <Field
      key="people"
      label="모임인원"
      meta={goAnyway ? "모두 안 모여도 함께 해요" : "다 모여야 함께해요"}
      value={`${maxPeople}명`}
    />,
    ...(meetup?.message ? [<Field key="message" label="한마디" value={meetup.message} />] : []),
  ];

  return (
    <WireframeLayout justify="start" className="flex flex-col bg-accent-faint">
      {/* ds_navigation_top(1235:3023) — 높이 60 · 좌우 8 · 뒤로 버튼 48×48 안에 아이콘 24 */}
      <header className="shrink-0 h-[60px] px-2 flex items-center border-b border-line bg-white relative">
        <Link href={backLink} aria-label="뒤로" className="size-12 flex items-center justify-center">
          <Image src="/illust/arrow-back-ios-new.svg" alt="" width={24} height={24} />
        </Link>
        <span className="absolute inset-x-0 text-center text-[18px] font-medium leading-[1.5] text-ink pointer-events-none">
          자세히 보기
        </span>
      </header>

      <div className="flex-1 px-4 pt-7 flex flex-col">
        {/* Frame 241(1235:3024) — 시각·상태 태그, 그 아래 제목. 두 줄 다 title-m-700(24) */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <p className="flex-1 text-[24px] font-bold leading-[1.3] tracking-[-0.24px] text-ink">
              {startClock}
            </p>
            <span
              className={`shrink-0 rounded p-2 text-[16px] font-medium leading-[1.5] ${status.tone}`}
            >
              {status.label}
            </span>
          </div>
          <h1 className="text-[24px] font-bold leading-[1.3] tracking-[-0.24px] text-ink">
            {activity}
          </h1>
        </div>

        {/* card-list(1235:3030) — 제목 아래 24, 카드 사이 20 */}
        <div className="mt-6 flex flex-col gap-5">
          <div className={CARD}>
            {rows.map((row, i) => (
              <div
                key={row.key}
                className={`pb-3 ${i < rows.length - 1 ? "border-b border-line" : ""}`}
              >
                {row}
              </div>
            ))}
          </div>

          <div className={CARD}>
            <p className="flex items-baseline gap-1 text-[18px] leading-[1.5]">
              <span className="font-medium text-ink">참여자</span>
              <span className="font-bold text-brand">{people.length}</span>
            </p>
            <ul className="flex flex-col gap-3">
              {people.map((p, i) => (
                <li key={p.userId} className="flex items-center gap-2">
                  <Image
                    src={AVATARS[i % AVATARS.length]}
                    alt=""
                    width={24}
                    height={24}
                    className="shrink-0 rounded-full"
                  />
                  <span className="text-[16px] font-medium leading-[1.5] text-sub">
                    {p.user.nickname}
                  </span>
                  {meetup?.creatorId === p.userId && (
                    <span className="px-1.5 py-1 rounded bg-brand-alpha-15 text-brand text-[12px] font-medium leading-none">
                      개설자
                    </span>
                  )}
                </li>
              ))}
              {/* UI디자인 Frame 179(1331:3431) — 아직 안 찬 자리는 빈 아바타 + "–" 로 표시 */}
              {Array.from({ length: Math.max(0, maxPeople - people.length) }).map((_, i) => (
                <li key={`empty-${i}`} className="flex items-center gap-2">
                  <Image
                    src="/illust/avatar-empty.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="shrink-0 rounded-full"
                  />
                  <span className="text-[16px] font-medium leading-[1.5] text-unselected">–</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ds_step_footer(1235:3029) — 목록 아래 24 · 좌우 16 · 아래 40 · 버튼 48, 사이 12 */}
      <div className="shrink-0 px-4 pt-6 pb-10 flex flex-col gap-3">
        {joined ? (
          // 개설자는 여기서 못 빠진다 — 동행 자체를 취소하는 것과 다르다
          meetup?.creatorId === uid ? (
            // 목록 카드에서 취소 링크가 빠졌으니(새 디자인) 개설자의 취소는 여기가 유일한 길이다
            <CancelCreatedButton
              meetupId={id}
              participants={people.map((p) => ({
                nickname: p.user.nickname,
                isCreator: meetup?.creatorId === p.userId,
              }))}
            />
          ) : (
            <LeaveMeetupButton meetupId={id} />
          )
        ) : people.length >= maxPeople ? (
          <span className="w-full h-12 rounded-xl bg-count-full-bg text-count-full-ink flex items-center justify-center text-[18px] font-medium leading-[1.5]">
            자리가 다 찼어요
          </span>
        ) : (
          <>
            <Link href={`/meetup/${id}/join`} className={footerButtonClass("brand")}>
              참여하기
            </Link>
            <Link href={backLink} className={footerButtonClass("ghost")}>
              이전
            </Link>
          </>
        )}
      </div>
    </WireframeLayout>
  );
}
