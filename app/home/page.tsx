import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderNav from "@/components/HeaderNav";
import PlaceholderBox from "@/components/PlaceholderBox";

export default function HomePage() {
  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <HeaderNav />

      <div className="p-4 flex flex-col gap-4 pb-6">
        <h1 className="text-base font-bold text-black py-1">
          오늘, 송정동 마실 어떠세요?
        </h1>

        <div className="flex flex-col gap-3">
          {/* 카드 1: 뜨개질 같이 해요 */}
          <Link
            href="/meetup/1"
            className="p-4 border border-gray-200 rounded flex flex-col gap-2 bg-white"
          >
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="font-bold text-black">오후 3시</span>
              <span>2 / 3명</span>
            </div>
            <h2 className="text-base font-bold text-black">뜨개질 같이 해요</h2>
            <p className="text-xs text-gray-600">예상 시간 : 1시간</p>
            <p className="text-xs text-gray-500">
              동사무소 시민회의실 ㆍ 걸어서 8분
            </p>
          </Link>

          {/* 카드 2: 강아지 산책하러 가요 */}
          <Link
            href="/meetup/2"
            className="p-4 border border-gray-200 rounded flex flex-col gap-2 bg-white"
          >
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="font-bold text-black">오후 3시 30분</span>
              <span>2 / 3명</span>
            </div>
            <h2 className="text-base font-bold text-black">
              강아지 산책하러 가요
            </h2>
            <p className="text-xs text-gray-600">예상 시간 : 1시간</p>
            <p className="text-xs text-gray-500">
              도토리공원 ㆍ 걸어서 5분
            </p>
          </Link>

          {/* 카드 3: 도란마트 장보러 가요 */}
          <Link
            href="/meetup/3"
            className="p-4 border border-gray-200 rounded flex flex-col gap-2 bg-white"
          >
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="font-bold text-black">오후 3시 30분</span>
              <span>2 / 3명</span>
            </div>
            <h2 className="text-base font-bold text-black">
              도란마트 장보러 가요
            </h2>
            <p className="text-xs text-gray-600">예상 시간 : 1시간</p>
            <p className="text-xs text-gray-500">
              도란마트 정문 앞 ㆍ 걸어서 4분
            </p>
          </Link>

          {/* 카드 4: Adㆍ동네광고 */}
          <div className="p-4 border border-gray-200 rounded flex items-center justify-between bg-white">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-gray-500 border border-gray-300 px-1.5 py-0.5 rounded w-fit">
                Adㆍ동네광고
              </span>
              <h2 className="text-sm font-bold text-black">
                아픈 허리 잘 낫는 병원
              </h2>
              <p className="text-xs text-gray-500">우리동네병원 정형외과</p>
            </div>
            <PlaceholderBox width="w-[87px]" height="h-[87px]" className="rounded">
              이미지
            </PlaceholderBox>
          </div>

          {/* 카드 5: 반찬 나눔 */}
          <Link
            href="/meetup/4"
            className="p-4 border border-gray-200 rounded flex flex-col gap-2 bg-white"
          >
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="font-bold text-black">오후 5시 ~ 5시 30분</span>
              <span>2 / 3명</span>
            </div>
            <h2 className="text-base font-bold text-black">반찬나눔</h2>
            <p className="text-xs text-gray-500">
              105동 앞 ㆍ 걸어서 1분
            </p>
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
