import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";

export default function CreateWritePage() {
  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <HeaderBack title="손으로 쓰기" backHref="/create/speak" />

      <div className="p-4 flex flex-col items-center gap-5">
        {/* Sentence fill-in box */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-white flex flex-col gap-4 text-left">
          {/* Row 1: Time */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-1.5 text-sm text-black">
              <span>오늘</span>
              <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded font-bold">
                오후 3시
              </span>
              <span>에</span>
            </div>
            <span className="text-xs text-gray-500 underline cursor-pointer">
              고치기
            </span>
          </div>

          {/* Row 2: Location */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-1.5 text-sm text-black">
              <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded font-bold">
                우리 아파트 앞
              </span>
              <span>에서</span>
            </div>
            <span className="text-xs text-gray-500 underline cursor-pointer">
              고치기
            </span>
          </div>

          {/* Row 3: Input slot for activity */}
          <div className="flex flex-col gap-2">
            <div className="w-full h-[50px] border border-gray-300 rounded px-3 flex items-center text-sm text-gray-400 bg-gray-50">
              무엇을 할까요?
            </div>
            <span className="text-sm font-medium text-black">같이 하실 분</span>
          </div>
        </div>

        {/* Switch back to speech button */}
        <div className="w-full flex flex-col items-center gap-1">
          <Link
            href="/create/listening"
            className="w-full h-[44px] border border-gray-300 bg-white text-black flex items-center justify-center gap-2 rounded text-xs font-medium"
          >
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>다시 말로 할래요</span>
          </Link>
          <span className="text-[11px] text-gray-500">
            말하기가 편하시면 언제든 위 버튼으로 돌아가세요
          </span>
        </div>

        {/* Notice text box */}
        <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-xs text-gray-600 flex flex-col gap-1 text-center">
          <p>사람이 안 모이면 조용히 사라져요.</p>
          <p>아무도 모르니 편하게 올려보세요.</p>
        </div>

        {/* Submit button */}
        <div className="w-full pt-1">
          <Link
            href="/create/posted"
            className="w-full h-[52px] bg-black text-white flex items-center justify-center rounded text-sm font-medium"
          >
            올리기
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
