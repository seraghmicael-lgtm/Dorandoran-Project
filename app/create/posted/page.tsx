import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function CreatePostedPage() {
  return (
    <WireframeLayout justify="start" className="flex flex-col">
      {/* Header without back arrow as per spec */}
      <header className="h-[65px] px-4 flex items-center justify-center border-b border-gray-200 bg-white">
        <span className="text-base font-medium text-black">올렸어요</span>
      </header>

      <div className="p-4 flex flex-col items-center gap-6 text-center">
        {/* Check mark badge */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="w-[74px] h-[74px] rounded-full border-2 border-black bg-white flex items-center justify-center text-2xl font-bold text-black">
            ✓
          </div>
          <h1 className="text-xl font-bold text-black">올렸어요</h1>
        </div>

        {/* Card info */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-white flex flex-col gap-2 text-left">
          <span className="text-xs text-gray-500 font-medium">
            오늘 오후 3시 ~ 4시
          </span>
          <h2 className="text-base font-bold text-black">
            오일장 구경 같이 하실 분
          </h2>
          <p className="text-xs text-gray-600">송정 오일장 · 걸어서 12분</p>
        </div>

        {/* Notice text */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 text-xs text-gray-600 flex flex-col gap-1 text-center">
          <p>사람이 모이면 알려드릴게요.</p>
          <p>안 모이면 조용히 사라져요. 기록도 안 남아요.</p>
        </div>

        {/* Action buttons */}
        <div className="w-full flex flex-col gap-3 pt-2">
          <Link
            href="/my-meetups"
            className="w-full h-[53px] bg-black text-white flex items-center justify-center rounded text-sm font-medium"
          >
            내 동행 보기
          </Link>

          <Link
            href="/home"
            className="w-full h-[50px] border border-gray-300 bg-white text-black flex items-center justify-center rounded text-sm font-medium"
          >
            홈으로
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
