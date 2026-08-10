import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import BottomNavThree from "@/components/BottomNavThree";

export default function FeedAltPage() {
  return (
    <WireframeLayout>
      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        <h1 className="text-base font-bold text-black leading-snug">
          지금 신사동에서 세 분이 같이 갈 사람을 찾고 있어요
        </h1>

        <div className="flex flex-col gap-3">
          {/* Card 1 variant */}
          <Link
            href="/meetup/1"
            className="p-3 border border-gray-200 rounded flex flex-col gap-2 bg-white hover:bg-gray-50"
          >
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1 font-bold text-black">
                <span>오늘 3시</span>
              </div>
              <span className="text-gray-600">2 / 3명</span>
            </div>
            <div className="text-sm font-medium text-black">오일장 구경</div>
            <div className="text-xs text-gray-500">봄날의햇살 님</div>
          </Link>

          {/* Card 2 */}
          <Link
            href="/meetup/2"
            className="p-3 border border-gray-200 rounded flex flex-col gap-1 bg-white hover:bg-gray-50"
          >
            <div className="font-bold text-sm text-black">오늘 5시 · 식자재마트</div>
            <div className="text-xs text-gray-600">걸어서 12분 · 1시간 이상 · 3명 중 1명</div>
            <div className="text-xs text-gray-500 pt-1">늘푸른소나무 님</div>
          </Link>

          {/* Card 3 */}
          <Link
            href="/meetup/3"
            className="p-3 border border-gray-200 rounded flex flex-col gap-1 bg-white hover:bg-gray-50"
          >
            <div className="font-bold text-sm text-black">내일 10시 · 공원 한 바퀴</div>
            <div className="text-xs text-gray-600">걸어서 4분 · 30분 · 3명 모두 모였어요</div>
            <div className="text-xs text-gray-500 pt-1">운영자</div>
          </Link>
        </div>
      </div>

      <BottomNavThree active="home" />
    </WireframeLayout>
  );
}
