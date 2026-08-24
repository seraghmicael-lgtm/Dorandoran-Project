import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import GoogleMap from "@/components/GoogleMap";
import { prisma } from "@/lib/prisma";
import { directionsUrl } from "@/lib/places";

export default async function MeetupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 06_하실 말씀에서 남긴 한마디를 제목 밑에 건다(Figma: 오늘마실_동행자세히보기 1).
  // 만나는 곳·좌표가 있으면 지도에 핀을 찍고 길찾기를 연결한다.
  // 나머지 값은 아직 와이어프레임 고정값이라 그대로 둔다.
  let meetup: {
    activity: string;
    startTime: string;
    message: string | null;
    locationName: string | null;
    lat: number | null;
    lng: number | null;
  } | null = null;
  try {
    meetup = await prisma.meetup.findUnique({
      where: { id },
      select: {
        activity: true,
        startTime: true,
        message: true,
        locationName: true,
        lat: true,
        lng: true,
      },
    });
  } catch (e) {
    console.error("동행 조회 실패:", e);
  }

  const placeName = meetup?.locationName?.split(" · ")[0] ?? "도란마트 정문 앞";
  const hasPin = typeof meetup?.lat === "number" && typeof meetup?.lng === "number";

  return (
    <WireframeLayout justify="between" className="p-6 flex flex-col justify-between">
      <div className="flex flex-col gap-6">
        {/* Title / Time */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-black">
            {meetup?.startTime ?? "오후 3시 30분"}
          </span>
          <h1 className="text-xl font-bold text-black">
            {meetup?.activity ?? "도란마트 장보러 가요"}
          </h1>

          {/* 하실 말씀 한마디 — 제목 바로 밑, 초록 세로선 + 따옴표 인용 */}
          {meetup?.message && (
            <blockquote className="mt-3 border-l-[3px] border-[#3D6B5A] pl-3">
              <p className="text-[15px] leading-[1.5] text-gray-700 whitespace-pre-line">
                “{meetup.message}”
              </p>
            </blockquote>
          )}
        </div>

        {/* Info Grid */}
        <div className="flex flex-col border-y border-gray-200 py-3 text-sm gap-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">만드신 분</span>
            <span className="font-medium text-black">봄날의햇살 님</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">걸리는 시간</span>
            <span className="font-medium text-black">1시간 이상</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">모임인원</span>
            <span className="font-medium text-black">2 / 3명</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">거리</span>
            <span className="font-medium text-black">걸어서 8분</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">만나는 곳</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-black">{placeName}</span>
              {/* 지도 앱으로 넘긴다 — 좌표가 있으면 정확히, 없으면 이름으로라도 */}
              <a
                href={directionsUrl({ lat: meetup?.lat, lng: meetup?.lng, name: placeName })}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#3D6B5A] font-medium flex items-center underline-offset-2 hover:underline"
              >
                길찾기 &gt;
              </a>
            </div>
          </div>
        </div>

        {/* 만나는 곳 지도 — 좌표를 못 찾은 동행은 지도 자리를 비운다(가짜 위치를 보여주지 않는다) */}
        {hasPin && (
          <GoogleMap
            lat={meetup!.lat!}
            lng={meetup!.lng!}
            height="h-[149px]"
            className="rounded"
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4 pb-4">
        <Link
          href={`/meetup/${id}/complete`}
          className="w-full h-[60px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          참여하기
        </Link>
        <Link
          href="/home"
          className="w-full h-[60px] bg-white text-black border border-black flex items-center justify-center rounded text-base font-medium"
        >
          다른 동행 보기
        </Link>
      </div>
    </WireframeLayout>
  );
}
