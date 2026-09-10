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
        {/* ⚠️ 실측 확인된 렌더링 버그: 디테일 많은 배경 사진이 해상도 1080x2400일 때
            아이콘·워드마크와 같은 화면 영역을 차지하면 그 둘이 두 겹으로 번져 보였다
            (실기기·프로덕션 빌드·헤드리스 전부 재현, next/image·plain img 무관, 겹침 자체는
            지금도 여전함 — 아이콘이 사진 위에 그대로 얹힌다). 배경 사진을 720x1600(가로세로
            비율은 그대로, 화소 수만 절반)으로 줄이자 완전히 사라졌다 — 디테일량/디코드 비용이
            어떤 임계값을 넘던 것으로 보인다. 사진을 다시 고해상도로 바꾸면 재발할 수 있다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illust/splash-bg.png"
          alt=""
          aria-hidden="true"
          className="absolute left-0 right-0 bottom-0 w-full object-cover"
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
