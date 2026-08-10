import WireframeLayout from "@/components/WireframeLayout";
import HeaderNav from "@/components/HeaderNav";
import BottomNavFive from "@/components/BottomNavFive";

export default function HomePage() {
  return (
    <WireframeLayout>
      <HeaderNav />

      <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
        {/* Main Meetup Cards */}
        <div className="flex flex-col gap-3">
          {/* Card 1 */}
          <div className="p-3 border border-gray-200 rounded flex flex-col gap-2 bg-white">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full border border-black inline-block" />
              <span>귀여운양양 / 송정동</span>
            </div>
            <div className="font-bold text-base text-black">뜨개질 같이 해요</div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span>모임시간: 13시</span>
              <span>·</span>
              <span>예상 소요: 1시간</span>
              <span>·</span>
              <span>참여자: 1 / 5</span>
            </div>
            <div className="text-xs text-gray-700 pt-1">
              모임 장소: 동사무소 시민회의실
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-3 border border-gray-200 rounded flex flex-col gap-2 bg-white">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full border border-black inline-block" />
              <span>노스탤지어 / 화봉동</span>
            </div>
            <div className="font-bold text-base text-black">
              오후에 강아지 산책 합니다
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span>모임시간: 10시</span>
              <span>·</span>
              <span>예상 소요: 1시간</span>
              <span>·</span>
              <span>참여자: 2 / 3</span>
            </div>
            <div className="text-xs text-gray-700 pt-1">
              모임 장소: 도토리마을 공원
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-3 border border-gray-200 rounded flex flex-col gap-2 bg-white">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full border border-black inline-block" />
              <span>낮잠자고싶다 / 연암동</span>
            </div>
            <div className="font-bold text-base text-black">반찬 나눔</div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span>시간: 16시</span>
              <span>·</span>
              <span>예상 소요: 5분</span>
              <span>·</span>
              <span>참여자: 3 / 6</span>
            </div>
            <div className="text-xs text-gray-700 pt-1">
              모임 장소: 보문 아파트 정문 앞
            </div>
          </div>
        </div>

        {/* Soon Starting Meetups Section */}
        <div className="flex flex-col gap-3 pt-2">
          <h2 className="text-sm font-bold text-black border-t border-gray-200 pt-4">
            곧 시작하는 모임
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {/* Subcard 1 */}
            <div className="min-w-[260px] p-3 border border-gray-200 rounded flex flex-col gap-2 bg-white">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <span className="w-2 h-2 rounded-full border border-black inline-block" />
                <span>달토끼 / 화봉동</span>
              </div>
              <div className="font-bold text-sm text-black">
                모여서 대보름 부럼 까기
              </div>
              <div className="flex flex-col gap-1 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <span>시작 시간: 13시</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>보고 있는 사람: 42명</span>
                </div>
              </div>
            </div>

            {/* Subcard 2 */}
            <div className="min-w-[260px] p-3 border border-gray-200 rounded flex flex-col gap-2 bg-white">
              <div className="flex justify-between items-center text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full border border-black inline-block" />
                  <span>달토끼</span>
                </div>
                <span className="text-gray-400">5분 전</span>
              </div>
              <div className="font-bold text-sm text-black">
                모여서 대보름 부럼 까기
              </div>
              <div className="flex flex-col gap-1 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <span>보고 있는 사람: 42명</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>동네: 은평동</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavFive active="home" />
    </WireframeLayout>
  );
}
