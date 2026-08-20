import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function MyMeetupsPage() {
  return (
    <WireframeLayout justify="start" className="p-4 flex flex-col gap-4">
      <h1 className="text-base font-bold text-black py-2">오늘 나가실 동행</h1>

      <div className="p-5 border border-gray-200 rounded-lg bg-white flex flex-col gap-3">
        <h2 className="text-lg font-bold text-black">오늘 3시 · 오일장 구경</h2>
        <p className="text-sm text-gray-700">신사시장 정문 · 걸어서 8분</p>
        <p className="text-sm text-gray-600">3명 중 2명 · 한 분 더</p>

        <div className="pt-3 border-t border-gray-100 mt-1">
          <Link
            href="/my-meetups/cancel"
            className="w-full h-[50px] bg-black text-white flex items-center justify-center rounded text-sm font-medium"
          >
            동행 취소하기
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
