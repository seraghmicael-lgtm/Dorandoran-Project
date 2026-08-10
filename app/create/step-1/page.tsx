import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";

export default function CreateStep1Page() {
  return (
    <WireframeLayout>
      <HeaderBack backHref="/create" />

      <div className="p-4 flex-1 flex flex-col justify-between gap-6 overflow-y-auto">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <h1 className="text-xl font-bold text-black leading-snug">
              어떤 동행을 구하시나요?
            </h1>
            <span className="text-sm font-bold text-black">1/2</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="py-2 text-gray-400 text-base">
              모임명을 입력해주세요
            </div>
            <div className="h-[1px] bg-gray-300 w-full" />
          </div>

          <div className="flex flex-col gap-3 pt-2">
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

        <div className="pb-4">
          <Link
            href="/create/step-2"
            className="w-full h-[62px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
          >
            다음
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
