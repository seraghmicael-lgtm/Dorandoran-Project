import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import PlaceholderBox from "@/components/PlaceholderBox";
import { safeInternalPath } from "@/lib/safePath";

export default async function MeetupDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const backHref = safeInternalPath(from, "/home");

  return (
    <WireframeLayout className="p-4 flex flex-col justify-between">
      <div className="flex flex-col gap-4 overflow-y-auto pb-4">
        {/* Header */}
        <div className="flex items-center pb-2 border-b border-gray-200">
          <Link href={backHref} className="text-lg font-bold text-black px-1">
            ←
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-black pt-1">
          수영 교실 등록 함께할 분
        </h1>

        {/* Details list */}
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-gray-700">시작 시간: 14시 00분</p>
          <p className="text-gray-700">예상 소요 시간: 30분 이내</p>
          <p className="text-gray-700">최대 인원: 3명</p>
          <p className="text-gray-700">모임 장소: 도토리마을 공원</p>
          <p className="text-gray-700 font-medium">현재 참여 인원: 1/3</p>
        </div>

        {/* Map Placeholder */}
        <Link href={`/meetup/${id}/map`}>
          <PlaceholderBox height="h-[120px]" className="rounded cursor-pointer hover:border-black">
            <span className="text-xs text-gray-500">지도 영역 (탭하여 크게 보기)</span>
          </PlaceholderBox>
        </Link>

        {/* Publisher */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
          <h2 className="text-sm font-bold text-black">게시자</h2>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded bg-white">
            <div className="w-10 h-10 rounded-full border border-gray-400 bg-gray-200" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-black">즐거운다람쥐</span>
              <span className="text-xs text-gray-500">동행 참여 3회</span>
            </div>
          </div>
        </div>

        {/* Recommended Meetups */}
        <div className="flex flex-col gap-3 pt-2 border-t border-gray-200">
          <h2 className="text-sm font-bold text-black">
            지금 모집중인 추천 동행
          </h2>

          <Link
            href="/meetup/3"
            className="p-3 border border-gray-200 rounded flex flex-col gap-1 bg-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-black">
                오후에 강아지 산책 합니다
              </h3>
              <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400" />
            </div>
            <p className="text-xs text-gray-600">
              모임시간: 채팅 협의 예상 소요: 1시간 이상 참여자: 2 / 3
            </p>
            <p className="text-xs text-gray-500">
              모임 장소: 도토리마을 공원 (걸어서 8분)
            </p>
          </Link>

          <Link
            href="/meetup/5"
            className="p-3 border border-gray-200 rounded flex flex-col gap-1 bg-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-black">
                수변공원 축제 구경가서 맛있는거 먹어요
              </h3>
              <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400" />
            </div>
            <p className="text-xs text-gray-600">
              모임시간: 채팅 협의 예상 소요: 1시간 이상 참여자: 1 / 5
            </p>
            <p className="text-xs text-gray-500">
              모임 장소: 수변공원 (걸어서 20분)
            </p>
          </Link>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="py-4 border-t border-gray-200">
        <Link
          href={`/meetup/${id}/complete`}
          className="w-full h-[50px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          참여하기
        </Link>
      </div>
    </WireframeLayout>
  );
}
