import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import BottomNavThree from "@/components/BottomNavThree";

export default function MyMeetupsPage() {
  return (
    <WireframeLayout>
      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
        <h1 className="text-lg font-bold text-black">오늘 나가실 동행</h1>

        <div className="p-4 border border-gray-200 rounded flex flex-col gap-3 bg-white">
          <div className="font-bold text-base text-black">
            오늘 3시 · 오일장 구경
          </div>
          <div className="text-sm text-gray-700">
            신사시장 정문 · 걸어서 8분
          </div>
          <div className="text-sm text-gray-600">
            3명 중 2명 · 한 분 더
          </div>

          <div className="pt-2">
            <Link
              href="/my-meetups/cancel"
              className="w-full h-[50px] border border-black text-black flex items-center justify-center rounded text-sm font-medium"
            >
              동행 취소하기
            </Link>
          </div>
        </div>
      </div>

      <BottomNavThree active="my-meetups" />
    </WireframeLayout>
  );
}
