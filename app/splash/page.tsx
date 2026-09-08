"use client";

import Image from "next/image";
import { useState } from "react";
import WireframeLayout from "@/components/WireframeLayout";
import BrandMark, { BrandWordmark } from "@/components/ds/BrandMark";
import StepFooter from "@/components/ds/StepFooter";

// UI디자인 splash(1235:8623) + on-01 — 경로 이동 없이 한 페이지 안에서
// 순수 브랜드 스플래시를 보여주다 하단 버튼을 누르면 같은 페이지 위에서
// 시작 문구+버튼 레이어로 전환한다(자동 전환 없음 — 눌러야 넘어간다).
// 로고·문구가 배경 그림에 함께 그려져 있어 통짜 이미지 한 장으로 그대로 쓴다.
export default function SplashPage() {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
        <div className="relative flex-1 w-full bg-[#ebf7f5]">
          <Image
            src="/illust/splash-bg.png"
            alt="오늘마실"
            fill
            sizes="360px"
            className="object-cover object-bottom"
            priority
          />
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="absolute inset-x-5 bottom-8 h-[54px] rounded-lg bg-ink text-white flex items-center justify-center text-[17px] font-bold cursor-pointer"
          >
            시작하기
          </button>
        </div>
      </WireframeLayout>
    );
  }

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <div className="flex-1 px-5 flex flex-col items-center justify-center text-center gap-6">
        <BrandWordmark width={140} />
        <BrandMark size={100} />
        <div className="flex flex-col gap-3">
          <h1 className="text-[24px] font-bold text-black">오늘 같이할 사람 찾기</h1>
          <p className="text-[15px] text-[#999999] leading-[1.6] whitespace-pre-line">
            {"장 보러, 산책하러, 커피 한 잔\n우리 동네에서 한두 시간"}
          </p>
        </div>
      </div>
      <StepFooter primary={{ label: "동네 인증하고 시작하기", href: "/location-permission" }} />
    </WireframeLayout>
  );
}
