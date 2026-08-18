import React from "react";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderNav from "@/components/HeaderNav";

export default function CommunityPage() {
  return (
    <WireframeLayout className="flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          {/* Message List */}
          <div className="flex flex-col gap-3">
            {/* Message 1 */}
            <div className="flex flex-col gap-1 items-start max-w-[85%]">
              <span className="text-xs text-gray-600">쿠킹쿠킹</span>
              <div className="p-3 border border-gray-300 bg-white rounded text-sm text-black">
                방금 큰 소리 나지 않았어요?
              </div>
            </div>

            {/* Message 2 (My message - right aligned) */}
            <div className="flex flex-col gap-1 items-end self-end max-w-[85%]">
              <span className="text-xs text-gray-600">즐거운다람쥐</span>
              <div className="p-3 border border-black bg-black text-white rounded text-sm">
                아까 사거리에서 사고 났다는거 같아요
              </div>
            </div>

            {/* Message 3 */}
            <div className="flex flex-col gap-1 items-start max-w-[85%]">
              <span className="text-xs text-gray-600">요리하는엄마</span>
              <div className="p-3 border border-gray-300 bg-white rounded text-sm text-black">
                3단지 정전 났습니다 ㅠㅠ
              </div>
            </div>

            {/* Message 4 */}
            <div className="flex flex-col gap-1 items-start max-w-[85%]">
              <span className="text-xs text-gray-600">뚜벅이</span>
              <div className="p-3 border border-gray-300 bg-white rounded text-sm text-black">
                언제 복구 될까요?
              </div>
            </div>

            {/* Message 5 */}
            <div className="flex flex-col gap-1 items-start max-w-[85%]">
              <span className="text-xs text-gray-600">한가로이</span>
              <div className="p-3 border border-gray-300 bg-white rounded text-sm text-black">
                관리실에 확인해보심이...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input box */}
      <div className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
        <div className="flex-1 p-2 border border-gray-300 rounded text-xs text-gray-400">
          메시지를 입력하세요
        </div>
        <div className="w-8 h-8 rounded-full border border-gray-400 bg-gray-100 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
          mic
        </div>
      </div>
    </WireframeLayout>
  );
}
