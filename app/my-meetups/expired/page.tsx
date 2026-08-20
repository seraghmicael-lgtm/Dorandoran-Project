import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";

export default function ExpiredNotificationPage() {
  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <HeaderBack title="알림" backHref="/my-meetups" />

      <div className="p-4 flex flex-col gap-6">
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-2">
          <h1 className="text-base font-bold text-black leading-snug">
            오후 3시 오일장 동행, 시간이 지나 목록에서 내렸어요
          </h1>
          <p className="text-xs text-gray-600">
            기록은 남기지 않았어요. 언제든 다시 열 수 있어요.
          </p>
        </div>

        <Link
          href="/create/speak"
          className="w-full h-[50px] bg-black text-white flex items-center justify-center rounded text-sm font-medium"
        >
          같은 내용으로 다시 열기
        </Link>

        <div className="flex flex-col gap-3 pt-2">
          <h2 className="text-sm font-bold text-black">
            비슷한 시간에 열린 동행
          </h2>

          <Link
            href="/meetup/1"
            className="p-4 border border-gray-200 rounded-lg bg-white flex flex-col gap-1.5"
          >
            <span className="text-xs text-gray-500 font-medium">
              오후 4시 30분 ~ 5시
            </span>
            <h3 className="text-sm font-bold text-black">
              저녁 장보기 같이 가실 분
            </h3>
            <p className="text-xs text-gray-600">
              도란마트 · 걸어서 6분 · 두 자리 남았어요
            </p>
          </Link>

          <Link
            href="/meetup/2"
            className="p-4 border border-gray-200 rounded-lg bg-white flex flex-col gap-1.5"
          >
            <span className="text-xs text-gray-500 font-medium">
              내일 오전 10시 ~ 11시
            </span>
            <h3 className="text-sm font-bold text-black">
              아침 산책 같이 걸어요
            </h3>
            <p className="text-xs text-gray-600">
              도토리마을 공원 · 걸어서 4분 · 한 자리 남았어요
            </p>
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
