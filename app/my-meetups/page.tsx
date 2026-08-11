import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderNav from "@/components/HeaderNav";
import BottomNavFive from "@/components/BottomNavFive";

export default function MyMeetupsPage() {
  return (
    <WireframeLayout className="flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="p-4 flex flex-col gap-5 overflow-y-auto">
          {/* 오늘 약속된 동행 */}
          <div className="flex flex-col gap-3">
            <h1 className="text-base font-bold text-black">
              오늘 약속된 동행
            </h1>

            <div className="p-4 border border-gray-300 rounded flex flex-col gap-2 bg-white">
              <h2 className="text-sm font-bold text-black">
                수영 교실 등록 함께할 분
              </h2>
              <p className="text-xs text-gray-600">
                모임시간: 채팅 협의 예상 소요: 10분 참여자: 1 / 3
              </p>
              <p className="text-xs text-gray-500">
                모임 장소: 시민체육센터
              </p>

              <div className="flex gap-2 pt-2">
                <span className="flex-1 h-[45px] border border-gray-200 text-gray-300 bg-gray-50 flex items-center justify-center rounded text-xs cursor-not-allowed">
                  시간 미루기
                </span>
                <Link
                  href="/my-meetups/cancel"
                  className="flex-1 h-[45px] border border-black text-black flex items-center justify-center rounded text-xs font-medium"
                >
                  동행 모임 취소하기
                </Link>
              </div>
            </div>
          </div>

          {/* 지금 모집중인 추천 동행 */}
          <div className="flex flex-col gap-3 pt-2 border-t border-gray-200">
            <h2 className="text-base font-bold text-black">
              지금 모집중인 추천 동행
            </h2>

            <Link
              href="/meetup/3"
              className="p-3 border border-gray-200 rounded flex flex-col gap-1 bg-white"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-black">
                  오후에 강아지 산책 합니다
                </h3>
                <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400" />
              </div>
              <p className="text-xs text-gray-600">
                모임시간: 채팅 협의 예상 소요: 1시간 이상 참여자: 2 / 3
              </p>
              <p className="text-xs text-gray-500">
                모임 장소: 도토리마을 공원 (걸어서 8분)
              </p>
            </Link>

            <Link
              href="/meetup/5"
              className="p-3 border border-gray-200 rounded flex flex-col gap-1 bg-white"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-black">
                  수변공원 축제 구경가서 맛있는거 먹어요
                </h3>
                <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400" />
              </div>
              <p className="text-xs text-gray-600">
                모임시간: 채팅 협의 예상 소요: 1시간 이상 참여자: 1 / 5
              </p>
              <p className="text-xs text-gray-500">
                모임 장소: 수변공원 (걸어서 20분)
              </p>
            </Link>
          </div>
        </div>
      </div>

      <BottomNavFive active="my-meetups" />
    </WireframeLayout>
  );
}
