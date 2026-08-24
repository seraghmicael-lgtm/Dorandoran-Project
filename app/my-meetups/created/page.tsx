import Link from "next/link";
import { cookies } from "next/headers";
import WireframeLayout from "@/components/WireframeLayout";
import CancelCreatedButton from "@/components/CancelCreatedButton";
import { prisma } from "@/lib/prisma";

const fmtCancelDate = (d: Date | null) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d ?? new Date());

export default async function MyMeetupsCreatedPage() {
  // 내가(uid 쿠키) 올린 모임을 최신순으로 — 올리기 직후 이 목록에 바로 나타난다
  const uid = (await cookies()).get("uid")?.value ?? null;
  let myMeetups: {
    id: string;
    startTime: string;
    activity: string;
    locationName: string;
    maxPeople: number;
    status: string;
    participantCount: number;
    cancelledAt: Date | null;
  }[] = [];
  if (uid) {
    try {
      const rows = await prisma.meetup.findMany({
        where: { creatorId: uid },
        orderBy: { createdAt: "desc" },
        include: { participants: true },
      });
      myMeetups = rows.map((m) => ({
        id: m.id,
        startTime: m.startTime,
        activity: m.activity,
        locationName: m.locationName ?? "",
        maxPeople: m.maxPeople,
        status: m.status,
        participantCount: m.participants.length,
        cancelledAt: m.cancelledAt,
      }));
    } catch (e) {
      console.error("만든 동행 조회 실패:", e);
    }
  }
  const open = myMeetups.filter((m) => m.status === "open");
  const cancelled = myMeetups.filter((m) => m.status === "cancelled");

  return (
    <WireframeLayout justify="start" bottomNav="five" className="flex flex-col">
      {/* Tabs: 참여한 동행 / 만든 동행 (active) */}
      <div className="flex items-stretch border-b border-gray-300">
        <Link
          href="/my-meetups"
          className="flex-1 flex items-center justify-center py-2.5"
        >
          <span className="text-lg text-black">참여한 동행</span>
        </Link>
        <div className="flex-1 flex items-center justify-center py-2 border-b-2 border-black">
          <span className="text-lg font-bold text-black">만든 동행</span>
        </div>
      </div>

      <div className="p-5">
        <div className="p-3.5 bg-gray-100 border border-gray-300 rounded flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-bold text-gray-600">Adㆍ동네광고</p>
            <p className="text-xl font-bold text-gray-600">아픈 허리 잘 낫는 병원</p>
            <p className="text-[11px] text-gray-500">우리동네병원 정형외과</p>
          </div>
          <div className="w-[87px] h-[61px] bg-white shrink-0" />
        </div>
      </div>

      <div className="px-5">
        <h2 className="text-lg font-bold text-black pb-3">진행중</h2>

        {open.length > 0 ? (
          <div className="flex flex-col gap-3">
            {open.map((m) => (
              <div key={m.id} className="p-3.5 border border-gray-300 rounded flex flex-col gap-3">
                {/* 카드를 누르면 동행 자세히 보기. 취소 버튼은 링크 밖에 둔다(중첩 금지) */}
                <Link href={`/meetup/${m.id}`} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-black">{m.startTime}</span>
                    <span className="text-sm font-medium text-gray-500">
                      {m.participantCount} / {m.maxPeople}명
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xl font-bold text-black">{m.activity}</p>
                    <p className="text-sm font-medium text-gray-400">{m.locationName}</p>
                  </div>
                </Link>

                <CancelCreatedButton meetupId={m.id} />
              </div>
            ))}
          </div>
        ) : (
          /* 아직 올린 모임이 없으면 Figma 예시 카드 유지 */
          <div className="p-3.5 border border-gray-300 rounded flex flex-col gap-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-black">오후 5시</span>
                <span className="text-sm font-medium text-gray-500">1 / 3명</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xl font-bold text-black">동네 공원에서 같이 운동합시다</p>
                <p className="text-sm font-medium text-gray-400">예상 시간 : 30분</p>
                <p className="text-sm font-medium text-gray-400">
                  도란공원 입구ㆍ걸어서 10분
                </p>
              </div>
            </div>

            <div className="w-full py-4 bg-white border border-gray-300 rounded-[10px] flex items-center justify-center">
              <span className="text-base font-medium text-black">만든 동행 취소하기</span>
            </div>
          </div>
        )}
      </div>

      <div className="h-2 bg-gray-100 mt-4" />

      <div className="px-5 pt-4">
        <h2 className="text-lg font-bold text-black pb-3">완료</h2>

        {cancelled.length > 0 ? (
          <div className="flex flex-col gap-3">
            {cancelled.map((m) => (
              <Link
                key={m.id}
                href={`/meetup/${m.id}`}
                className="p-3.5 bg-gray-100 border border-gray-100 rounded flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-1 py-0.5 bg-gray-500 text-sm text-white">
                    {fmtCancelDate(m.cancelledAt)} 취소되었어요
                  </span>
                  <span className="px-2 py-1 bg-white border border-gray-300 text-xs text-gray-600">
                    더보기
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold text-black">{m.startTime}</span>
                  <p className="text-xl font-bold text-black">{m.activity}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-3.5 bg-gray-100 border border-gray-100 rounded flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="px-1 py-0.5 bg-gray-500 text-sm text-white">
                2026년 8월 16일 취소되었어요
              </span>
              <span className="px-2 py-1 bg-white border border-gray-300 text-xs text-gray-600">
                더보기
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold text-black">오후 5시</span>
              <p className="text-xl font-bold text-black">화훼단지 구경가요</p>
            </div>
          </div>
        )}
      </div>

      <div className="pb-6" />
    </WireframeLayout>
  );
}
