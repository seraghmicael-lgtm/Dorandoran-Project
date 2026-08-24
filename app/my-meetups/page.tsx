import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function MyMeetupsPage() {
  return (
    <WireframeLayout justify="start" bottomNav="five" className="flex flex-col">
      {/* Tabs: 참여한 동행 (active) / 만든 동행 */}
      <div className="flex items-stretch border-b border-gray-300">
        <div className="flex-1 flex items-center justify-center py-2 border-b-2 border-black">
          <span className="text-lg font-bold text-black">참여한 동행</span>
        </div>
        <Link
          href="/my-meetups/created"
          className="flex-1 flex items-center justify-center py-2.5"
        >
          <span className="text-lg text-black">만든 동행</span>
        </Link>
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

        <div className="p-3.5 border border-gray-300 rounded flex flex-col gap-3">
          {/* 카드를 누르면 동행 자세히 보기. 취소 버튼은 링크 밖에 둔다(중첩 금지) */}
          <Link href="/meetup/1" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-black">오후 3시</span>
              <span className="text-sm font-medium text-gray-500">2 / 3명</span>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xl font-bold text-black">뜨개질 같이 해요</p>
              <p className="text-sm font-medium text-gray-400">예상 시간 : 1시간</p>
              <p className="text-sm font-medium text-gray-400">
                동사무소 시민회의실ㆍ걸어서 8분
              </p>
            </div>
          </Link>

          <Link
            href="/my-meetups/cancel"
            className="w-full py-4 bg-white border border-gray-300 rounded-[10px] flex items-center justify-center"
          >
            <span className="text-base font-medium text-black">참여 취소하기</span>
          </Link>
        </div>
      </div>

      <div className="h-2 bg-gray-100 mt-4" />

      <div className="px-5 pt-4">
        <h2 className="text-lg font-bold text-black pb-3">완료</h2>

        <div className="flex flex-col gap-3">
          <Link href="/meetup/2" className="p-3.5 bg-gray-100 border border-gray-100 rounded flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="px-1 py-0.5 bg-gray-500 text-sm text-white">
                2026년 5월 14일 참여했어요!
              </span>
              <span className="px-2 py-1 bg-white border border-gray-300 text-xs text-gray-600">
                더보기
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold text-black">오후 4시</span>
              <p className="text-xl font-bold text-black">같이 산책 해요</p>
            </div>
          </Link>

          <Link href="/meetup/3" className="p-3.5 bg-gray-100 border border-gray-100 rounded flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="px-1 py-0.5 bg-gray-500 text-sm text-white">
                2026년 3월 12일 참여했어요!
              </span>
              <span className="px-2 py-1 bg-white border border-gray-300 text-xs text-gray-600">
                더보기
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-lg font-bold text-black">오후 4시</span>
              <p className="text-xl font-bold text-black">같이 산책 해요</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="pb-6" />
    </WireframeLayout>
  );
}
