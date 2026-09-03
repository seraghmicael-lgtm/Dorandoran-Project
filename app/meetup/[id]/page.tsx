import Link from "next/link";
import { cookies } from "next/headers";
import WireframeLayout from "@/components/WireframeLayout";
import Field from "@/components/ds/Field";
import { prisma } from "@/lib/prisma";
import { directionsUrl } from "@/lib/places";
import { UID_COOKIE } from "@/lib/session";
import LeaveMeetupButton from "@/components/LeaveMeetupButton";
import CancelCreatedButton from "@/components/CancelCreatedButton";

// UI디자인 JN-02 갱신분(1220:2291) — 자세히 보기
// 라벨-값 한 줄 표 대신, 필드마다 "아이콘+라벨(+보조정보) → 굵은 값" 두 줄.
// 한 회색 상자 안에 구분선으로 필드를 나눈다(검토 화면은 필드마다 상자가 따로다).
const ICON_CLASS = "w-[15px] h-[15px] shrink-0";

const CLOCK = (
  <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const PIN = (
  <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const PEOPLE = (
  <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="2" />
    <path d="M5 19c.8-3.5 3.5-5.4 7-5.4s6.2 1.9 7 5.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const SPEECH = (
  <svg className={ICON_CLASS} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M20 12a7 7 0 0 1-7 7H8l-4 3v-4.6A7 7 0 0 1 4 12a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

/** 자리·시간 상태 — 문구는 UI디자인의 상태 변형에서 가져왔다 */
function statusOf(count: number, max: number, joined: boolean) {
  if (joined) return { label: "나 포함", tone: "bg-accent-soft text-accent" };
  if (count >= max) return { label: "다 찼어요", tone: "bg-gray-100 text-gray-500" };
  if (count === max - 1) return { label: "한 자리 남았어요", tone: "bg-chip text-[#8A6D1F]" };
  return { label: "참여 가능", tone: "bg-accent-soft text-accent" };
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

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <header className="h-[60px] px-5 flex items-center border-b border-gray-100 bg-white relative">
        <Link href="/home" aria-label="뒤로" className="text-2xl text-black leading-none">
          ‹
        </Link>
        <span className="absolute inset-x-0 text-center text-[17px] font-bold text-black pointer-events-none">
          자세히 보기
        </span>
      </header>

      <div className="flex-1 px-5 pt-7 flex flex-col">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[17px] font-bold text-black">{startClock}</span>
          <span className={`px-2.5 py-1 rounded-full text-[13px] font-bold ${status.tone}`}>
            {status.label}
          </span>
        </div>
        <h1 className="mt-1 text-[24px] font-bold text-black">{activity}</h1>

        <div className="mt-6 rounded-2xl bg-surface px-4 py-3 flex flex-col divide-y divide-gray-200">
          <div className="py-2.5">
            <Field icon={CLOCK} label="걸리는 시간" meta={startTime} value={meetup?.duration ?? "미정"} />
          </div>

          <div className="py-2.5">
            <Field icon={PIN} label="만나는 곳" meta={walk} value={placeName}>
              <Link
                href={directionsUrl({ lat: meetup?.lat, lng: meetup?.lng, name: placeName })}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 px-3 h-8 rounded-lg bg-white border border-gray-200 text-[14px] font-bold text-black w-fit"
              >
                길찾기 ›
              </Link>
            </Field>
          </div>

          <div className="py-2.5">
            <Field
              icon={PEOPLE}
              label="모임인원"
              meta={goAnyway ? "모두 안 모여도 함께해요" : "다 모여야 함께해요"}
              value={`${maxPeople}명`}
            />
          </div>

          {meetup?.message && (
            <div className="py-2.5">
              <Field icon={SPEECH} label="한마디" value={meetup.message} />
            </div>
          )}
        </div>

        <div className="mt-3 rounded-2xl bg-surface px-4 py-4">
          <p className="text-[17px] font-bold text-black">
            참여자 <span className="text-accent">{people.length}</span>
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {people.length === 0 && (
              <li className="text-[15px] text-muted">아직 아무도 없어요. 첫 번째가 되어 주세요.</li>
            )}
            {people.map((p) => (
              <li key={p.userId} className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-accent-soft" aria-hidden="true" />
                <span className="text-[16px] text-black">{p.user.nickname}</span>
                {meetup?.creatorId === p.userId && (
                  <span className="px-2 py-0.5 rounded bg-accent-soft text-accent text-[12px] font-bold">
                    개설자
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-5 pt-5 pb-4 flex flex-col gap-2.5">
        {joined ? (
          // 개설자는 여기서 못 빠진다 — 동행 자체를 취소하는 것과 다르다
          meetup?.creatorId === uid ? (
            // 목록 카드에서 취소 링크가 빠졌으니(새 디자인) 개설자의 취소는 여기가 유일한 길이다
            <CancelCreatedButton meetupId={id} />
          ) : (
            <LeaveMeetupButton meetupId={id} />
          )
        ) : people.length >= maxPeople ? (
          <span className="w-full h-[54px] rounded-lg bg-gray-200 text-gray-500 flex items-center justify-center text-[17px] font-bold">
            자리가 다 찼어요
          </span>
        ) : (
          <>
            <Link
              href={`/meetup/${id}/join`}
              className="w-full h-[54px] rounded-lg bg-brand text-white flex items-center justify-center text-[17px] font-bold"
            >
              참여하기
            </Link>
            <Link
              href="/home"
              className="w-full h-[54px] rounded-lg border border-gray-300 bg-white text-black flex items-center justify-center text-[17px] font-medium"
            >
              이전
            </Link>
          </>
        )}
      </div>

    </WireframeLayout>
  );
}
