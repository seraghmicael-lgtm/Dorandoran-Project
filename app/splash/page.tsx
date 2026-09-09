"use client";

import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";

// UI디자인 splash(1235:8623) — 첫 화면 한 장. on-01의 로고·문구·ds_button이
// 전부 이 배경 사진 위에 얹힌 하나의 레이어다(별도 화면·탭 없이 바로 이 상태로 시작).
export default function SplashPage() {
  const router = useRouter();

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <div className="relative flex-1 w-full bg-[#edfafb] flex flex-col items-center overflow-hidden">
        {/* ⚠️ 실측 확인된 렌더링 버그: 사진처럼 디테일 많은 배경 이미지가 아이콘·워드마크와
            같은 화면 영역에서 겹치면(둘 다 같은 세로 구간을 차지하면) 아이콘·워드마크가
            두 겹으로 번져 보인다(실기기·프로덕션 빌드·헤드리스 전부 재현, next/image·plain img
            무관). 사진을 아이콘 블록과 겹치지 않는 하단 고정 높이로 떼어놓으니 완전히 사라졌다 —
            그래서 배경을 전체가 아니라 하단 300px만 차지하게 잘랐다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illust/splash-bg.png"
          alt=""
          aria-hidden="true"
          className="absolute left-0 right-0 bottom-0 w-full h-[300px] object-cover object-bottom"
        />

        {/* UI디자인 Frame 254(1331:3400) — 아이콘 바로 아래 워드마크. */}
        <div className="relative mt-[190px] flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/illust/symbol.svg" alt="" aria-hidden="true" className="block w-[100px] h-[100px]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/illust/logo.svg" alt="오늘마실" className="block w-[124px] h-[43px]" />
          </div>
          <p className="text-[18px] font-medium text-[#777] text-center leading-[1.5] whitespace-pre-line">
            {"장 보러, 산책하러, 커피 한 잔\n우리 동네에서 한두 시간"}
          </p>
        </div>

        {/* ds_button(primary) */}
        <div className="absolute inset-x-4 bottom-[26px]">
          <button
            type="button"
            onClick={() => router.push("/location-permission")}
            className="w-full h-12 rounded-xl bg-[#32952d] text-white flex items-center justify-center text-[18px] font-medium cursor-pointer"
          >
            동네 인증하고 시작하기
          </button>
        </div>
      </div>
    </WireframeLayout>
  );
}
