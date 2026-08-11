import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderNav from "@/components/HeaderNav";
import BottomNavFive from "@/components/BottomNavFive";

export default function HomePage() {
  return (
    <WireframeLayout className="flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="p-4 flex flex-col gap-4">
          <h1 className="text-base font-bold text-black">
            모집중인 추천 동행
          </h1>

          {/* 곧 시작하는 모임 캐러셀 */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <Link
              href="/meetup/1"
              className="min-w-[260px] p-3 border border-gray-300 rounded flex flex-col gap-2 bg-white flex-shrink-0"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400" />
                <span className="text-xs text-gray-600">달토끼 / 화봉동</span>
              </div>
              <h2 className="text-sm font-bold text-black">
                모여서 대보름 호두 까기
              </h2>
              <p className="text-xs text-gray-600">
                시작 시간: 13시 보고 있는 사람: 42명
              </p>
            </Link>

            <Link
              href="/meetup/2"
              className="min-w-[260px] p-3 border border-gray-300 rounded flex flex-col gap-2 bg-white flex-shrink-0"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400" />
                <span className="text-xs text-gray-600">귀여운양양 / 송정동</span>
              </div>
              <h2 className="text-sm font-bold text-black">
                수영 교실 등록 함께할 분
              </h2>
              <p className="text-xs text-gray-600">
                모임시간: 채팅 협의 참여자: 1 / 3
              </p>
            </Link>
          </div>

          {/* Sort Chips */}
          <div className="flex gap-2 text-xs py-1">
            <span className="px-3 py-1 bg-black text-white rounded font-medium cursor-pointer">
              빠른 순
            </span>
            <span className="px-3 py-1 bg-white text-black border border-gray-300 rounded font-medium cursor-pointer">
              가까운 순
            </span>
            <span className="px-3 py-1 bg-white text-black border border-gray-300 rounded font-medium cursor-pointer">
              소요시간 순
            </span>
          </div>

          {/* Vertical Card List */}
          <div className="flex flex-col gap-3 pb-4">
            {/* Card 1 */}
            <Link
              href="/meetup/1"
              className="p-3 border border-gray-200 rounded flex flex-col gap-1.5 bg-white"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400" />
                <span className="text-xs text-gray-600">귀여운양양 / 연암동</span>
              </div>
              <h2 className="text-sm font-bold text-black">
                수영 교실 등록 함께할 분
              </h2>
              <p className="text-xs text-gray-600">
                모임시간: 채팅 협의 예상 소요: 10분 참여자: 1 / 3
              </p>
              <p className="text-xs text-gray-500">
                모임 장소: 시민체육센터
              </p>
            </Link>

            {/* Card 2 */}
            <Link
              href="/meetup/2"
              className="p-3 border border-gray-200 rounded flex flex-col gap-1.5 bg-white"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400" />
                <span className="text-xs text-gray-600">귀여운양양 / 송정동</span>
              </div>
              <h2 className="text-sm font-bold text-black">
                뜨개질 같이 해요
              </h2>
              <p className="text-xs text-gray-600">
                모임시간: 13시 예상 소요: 1시간 이상 참여자: 1 / 5
              </p>
              <p className="text-xs text-gray-500">
                모임 장소: 동사무소 시민회의실 (걸어서 8분)
              </p>
            </Link>

            {/* Card 3 */}
            <Link
              href="/meetup/3"
              className="p-3 border border-gray-200 rounded flex flex-col gap-1.5 bg-white"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400" />
                <span className="text-xs text-gray-600">노스탤지어 / 화봉동</span>
              </div>
              <h2 className="text-sm font-bold text-black">
                오후에 강아지 산책 합니다
              </h2>
              <p className="text-xs text-gray-600">
                모임시간: 10시 예상 소요: 1시간 이상 참여자: 2 / 3
              </p>
              <p className="text-xs text-gray-500">
                모임 장소: 도토리마을 공원 (걸어서 8분)
              </p>
            </Link>

            {/* Card 4 (모집완료) */}
            <Link
              href="/meetup/4"
              className="p-3 border border-gray-200 rounded flex flex-col gap-1.5 bg-white relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-300 border border-gray-400" />
                  <span className="text-xs text-gray-600">낮잠자고싶다 / 연암동</span>
                </div>
                <span className="px-2 py-0.5 border border-gray-400 bg-gray-100 text-gray-600 text-[10px] rounded">
                  모집완료
                </span>
              </div>
              <h2 className="text-sm font-bold text-black">
                반찬 나눔 깻잎, 장아찌
              </h2>
              <p className="text-xs text-gray-600">
                모임시간: 16시 예상 소요: 1시간 이상 참여자: 6 / 6
              </p>
              <p className="text-xs text-gray-500">
                모임 장소: 보문 아파트 정문 앞 (걸어서 8분)
              </p>
            </Link>
          </div>
        </div>
      </div>

      <BottomNavFive active="home" />
    </WireframeLayout>
  );
}
