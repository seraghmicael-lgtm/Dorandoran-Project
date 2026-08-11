import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";

export default function CreateStep2Page() {
  return (
    <WireframeLayout className="p-4 flex flex-col justify-between">
      <div className="flex flex-col gap-4 overflow-y-auto pb-4">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <Link href="/create/step-1" className="text-lg font-bold text-black px-1">
            ←
          </Link>
          <span className="text-sm font-bold text-black">2/2</span>
        </div>

        <h1 className="text-xl font-bold text-black pt-2">
          하고 싶은 활동에 대해 소개해주세요
        </h1>

        {/* Intro text box */}
        <div className="p-3 border border-gray-300 rounded min-h-[120px] flex flex-col justify-between bg-white relative">
          <span className="text-gray-400 text-sm">소개글을 입력하세요...</span>
          <div className="self-end">
            <div className="w-6 h-6 rounded-full border border-gray-400 bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">
              mic
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-4">
          {/* Start Time */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-black">시작 시간</span>
            <div className="p-3 border border-gray-300 rounded text-sm text-black bg-white">
              00:00
            </div>
          </div>

          {/* Expected Duration */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-black">예상 소요 시간</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 border border-gray-300 rounded text-black cursor-pointer hover:border-black">
                30분 이내
              </span>
              <span className="px-3 py-1.5 border border-gray-300 rounded text-black cursor-pointer hover:border-black">
                1시간 이내
              </span>
              <span className="px-3 py-1.5 border border-gray-300 rounded text-black cursor-pointer hover:border-black">
                2시간 이내
              </span>
              <span className="px-3 py-1.5 border border-gray-300 rounded text-black cursor-pointer hover:border-black">
                2시간 이상
              </span>
            </div>
          </div>

          {/* Max Members Stepper */}
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-black">최대 인원</span>
            <div className="flex items-center border border-gray-300 rounded">
              <button type="button" className="px-3 py-1 text-black font-bold border-r border-gray-300">
                −
              </button>
              <span className="px-4 py-1 text-sm font-bold text-black">
                3
              </span>
              <button type="button" className="px-3 py-1 text-black font-bold border-l border-gray-300">
                +
              </button>
            </div>
          </div>

          {/* Meeting Location */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-black">모임 장소</span>
            <div className="flex items-center justify-between p-3 border border-gray-300 rounded bg-white">
              <span className="text-sm text-black">도토리마을 공원</span>
              <Link
                href="/create/step-4?from=/create/step-2"
                className="px-3 py-1 bg-black text-white text-xs rounded"
              >
                위치 찾기
              </Link>
            </div>
          </div>

          {/* Guidance Notice */}
          <div className="p-3 border border-gray-200 rounded bg-gray-50 flex flex-col gap-1 text-xs text-gray-600">
            <p>• 최소 인원은 3명이어야 합니다</p>
            <p>• 안전한 장소에서 만나요</p>
          </div>
        </div>
      </div>

      <div className="py-4">
        <Link
          href="/home"
          className="w-full h-[50px] bg-black text-white flex items-center justify-center rounded text-base font-medium"
        >
          등록
        </Link>
      </div>
    </WireframeLayout>
  );
}
