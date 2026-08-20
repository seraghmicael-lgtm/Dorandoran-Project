import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";

export default function CreateConfirmPage() {
  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <HeaderBack title="이렇게 들었어요" backHref="/create/listening" />

      <div className="p-4 flex flex-col items-center gap-5">
        {/* User raw input */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-1 text-left">
          <span className="text-xs text-gray-500 font-medium">말씀하신 내용</span>
          <p className="text-sm font-bold text-black">
            “세 시에 오일장 구경 같이 해요”
          </p>
        </div>

        {/* Extracted natural language structure */}
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
            <span className="text-sm text-gray-400">어디서 만날까요?</span>
            <span className="text-xs text-gray-500 underline cursor-pointer">
              찾기
            </span>
          </div>

          {/* Row 3: Activity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-black">
              <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded font-bold">
                오일장 구경
              </span>
              <span>같이 하실 분</span>
            </div>
            <span className="text-xs text-gray-500 underline cursor-pointer">
              고치기
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full flex flex-col gap-3 pt-4">
          <Link
            href="/create/posted"
            className="w-full h-[53px] bg-black text-white flex items-center justify-center rounded text-sm font-medium"
          >
            올리기
          </Link>

          <Link
            href="/create/speak"
            className="w-full h-[50px] border border-gray-300 bg-white text-black flex items-center justify-center rounded text-sm font-medium"
          >
            다시 말할래요
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
