import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import BottomNavThree from "@/components/BottomNavThree";

export default function FeedPage() {
  return (
    <WireframeLayout>
      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        <h1 className="text-base font-bold text-black leading-snug">
          지금 신사동에서 세 분이 같이 갈 사람을 찾고 있어요
        </h1>

        <div className="flex items-center gap-2 text-xs text-gray-700">
          <span className="px-3 py-1 border border-black rounded-full font-medium">
            빠른 순
          </span>
          <span className="px-3 py-1 border border-gray-300 rounded-full">
            가까운 순
          </span>
          <span className="px-3 py-1 border border-gray-300 rounded-full">
            소요시간 순
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/meetup/1?from=/feed"
            className="p-3 border border-gray-200 rounded flex flex-col gap-1 bg-white hover:bg-gray-50"
          >
            <div className="font-bold text-sm text-black">오늘 3시 · 오일장 구경</div>
            <div className="text-xs text-gray-600">걸어서 8분 · 1시간 이내 · 3명 중 2명</div>
            <div className="text-xs text-gray-500 pt-1">봄날의햇살 님</div>
          </Link>

          <Link
            href="/meetup/2?from=/feed"
            className="p-3 border border-gray-200 rounded flex flex-col gap-1 bg-white hover:bg-gray-50"
          >
            <div className="font-bold text-sm text-black">오늘 5시 · 식자재마트</div>
            <div className="text-xs text-gray-600">걸어서 12분 · 1시간 이상 · 3명 중 1명</div>
            <div className="text-xs text-gray-500 pt-1">늘푸른소나무 님</div>
          </Link>

          <Link
            href="/meetup/3?from=/feed"
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
