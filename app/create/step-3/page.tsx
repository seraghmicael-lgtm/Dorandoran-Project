import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";

export default function CreateStep3Page() {
  return (
    <WireframeLayout>
      <HeaderBack backHref="/create/step-2" />

      <div className="p-4 flex-1 flex flex-col justify-between gap-6 overflow-y-auto">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-start">
            <h1 className="text-xl font-bold text-black leading-snug">
              하고 싶은 활동에 대해 소개 해주세요
            </h1>
            <span className="text-sm font-bold text-black">1/2</span>
          </div>

          {/* Description Box */}
          <div className="p-3 border border-gray-300 rounded min-h-[120px] flex flex-col justify-between bg-white">
            <span className="text-gray-400 text-sm">소개글을 입력하세요...</span>
            <div className="text-right">
              <span className="text-xs text-gray-500 cursor-pointer underline">
                음성으로 입력하기
              </span>
            </div>
          </div>

          {/* Form items */}
          <div className="flex flex-col gap-4">
            {/* Start time */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-black">시작 시간</span>
              <span className="text-sm font-bold text-black">00:00</span>
            </div>

            {/* Expected duration */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-black">예상 소요 시간</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 border border-gray-300 rounded text-black">10분</span>
                <span className="px-3 py-1.5 border border-gray-300 rounded text-black">30분</span>
                <span className="px-3 py-1.5 border border-black font-medium rounded text-black">1시간 이내</span>
                <span className="px-3 py-1.5 border border-gray-300 rounded text-black">1시간 이상</span>
              </div>
            </div>

            {/* Max members */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-black">최대 인원</span>
              <span className="text-sm font-bold text-black">3</span>
            </div>

            {/* Meeting location */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-black">모임 장소</span>
              <div className="flex items-center justify-between p-3 border border-gray-300 rounded bg-white">
                <span className="text-sm text-black">도토리마을 공원</span>
                <Link
                  href="/create/step-4"
                  className="px-3 py-1 bg-black text-white text-xs rounded"
                >
                  위치 찾기
                </Link>
              </div>
            </div>

            {/* Notice box */}
            <div className="p-3 border border-gray-200 rounded bg-gray-50 flex flex-col gap-1 text-xs text-gray-600">
              <span className="font-bold text-black">안내</span>
              <span>최소 인원은 3명이어야 합니다 안전한 장소에서 만나요</span>
            </div>
          </div>
        </div>

        <div className="pb-4">
          <Link
            href="/home"
            className="w-full h-[62px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
          >
            등록
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
