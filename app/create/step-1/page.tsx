import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function CreateStep1Page() {
  return (
    <WireframeLayout className="p-4 flex flex-col justify-between">
      <div className="flex flex-col gap-4">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <Link href="/start/choose" className="text-lg font-bold text-black px-1">
            ←
          </Link>
          <span className="text-sm font-bold text-black">1/2</span>
        </div>

        <h1 className="text-xl font-bold text-black pt-2">
          어떤 동행을 구하시나요?
        </h1>

        {/* Input field line with mic icon placeholder */}
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-400 text-sm">모임명을 입력해주세요</span>
            <div className="w-5 h-5 rounded-full border border-gray-400 bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">
              mic
            </div>
          </div>
          <div className="h-[1px] bg-gray-300 w-full" />
        </div>

        {/* Chips selection */}
        <div className="flex flex-col gap-3 pt-4">
          <p className="text-xs text-gray-600">
            아니면 아래에서 선택해보세요
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-2 border border-gray-300 rounded text-xs text-black cursor-pointer hover:border-black">
              장보러가요
            </span>
            <span className="px-3 py-2 border border-gray-300 rounded text-xs text-black cursor-pointer hover:border-black">
              김장해요
            </span>
            <span className="px-3 py-2 border border-gray-300 rounded text-xs text-black cursor-pointer hover:border-black">
              반찬 나눌게요
            </span>
            <span className="px-3 py-2 border border-gray-300 rounded text-xs text-black cursor-pointer hover:border-black">
              같이 등록해요
            </span>
          </div>
        </div>
      </div>

      <div className="py-4">
        <Link
          href="/create/step-2"
          className="w-full h-[50px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          다음
        </Link>
      </div>
    </WireframeLayout>
  );
}
