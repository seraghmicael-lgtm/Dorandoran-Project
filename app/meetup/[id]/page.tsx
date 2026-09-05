import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import WireframeLayout from "@/components/WireframeLayout";
import Field from "@/components/ds/Field";
import { prisma } from "@/lib/prisma";
import { directionsUrl } from "@/lib/places";
import { UID_COOKIE } from "@/lib/session";
import LeaveMeetupButton from "@/components/LeaveMeetupButton";
import CancelCreatedButton from "@/components/CancelCreatedButton";

// UI디자인 JN-02 갱신분(1235:3022 · MY-01-01 · MY-02-01) — 자세히 보기
// 필드마다 "라벨(+보조정보) → 굵은 값" 두 줄, 라벨 앞 아이콘은 없다.
// 참여자 아바타는 Figma 내보내기 그대로(색만 돌려 쓴다 — 역할과는 무관한 장식).
const AVATARS = ["/illust/avatar-1.svg", "/illust/avatar-2.svg", "/illust/avatar-3.svg"];

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
            <Field label="걸리는 시간(소요시간)" meta={startTime} value={meetup?.duration ?? "미정"} />
          </div>

          <div className="py-2.5">
            <Field
              label="만나는 곳"
              meta={walk}
              value={placeName}
              trailing={
                <Link
                  href={directionsUrl({ lat: meetup?.lat, lng: meetup?.lng, name: placeName })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 px-3 h-9 min-w-[90px] justify-center rounded-lg bg-white border border-gray-200 text-[14px] font-bold text-[#5b5b5b]"
                >
                  길찾기
                  <Image src="/illust/chevron-right.svg" alt="" width={16} height={16} />
                </Link>
              }
            />
          </div>

          <div className="py-2.5">
            <Field
              label="모임인원"
              meta={goAnyway ? "모두 안 모여도 함께 해요." : "다 모여야 함께해요"}
              value={`${maxPeople}명`}
            />
          </div>

          {meetup?.message && (
            <div className="py-2.5">
              <Field label="한마디" value={meetup.message} />
            </div>
          )}
        </div>

        <div className="mt-3 rounded-2xl bg-surface px-4 py-4">
          <p className="text-[18px] font-medium text-black">
            참여자 <span className="font-bold text-brand">{people.length}</span>
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {people.length === 0 && (
              <li className="text-[15px] text-muted">아직 아무도 없어요. 첫 번째가 되어 주세요.</li>
            )}
            {people.map((p, i) => (
              <li key={p.userId} className="flex items-center gap-2">
                <Image
                  src={AVATARS[i % AVATARS.length]}
                  alt=""
                  width={24}
                  height={24}
                  className="shrink-0 rounded-full"
                />
                <span className="text-[16px] text-muted">{p.user.nickname}</span>
                {meetup?.creatorId === p.userId && (
                  <span className="px-1.5 py-1 rounded bg-accent-soft text-accent text-[12px] font-medium leading-none">
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
