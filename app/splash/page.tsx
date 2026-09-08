"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";

// UI디자인 splash(1235:8623) — 순수 브랜드 스플래시 한 장.
// on-01(시작 문구+버튼) 레이어는 삭제 — 하단 버튼을 누르면 바로 다음 화면으로 넘어간다.
// 로고·문구가 배경 그림에 함께 그려져 있어 통짜 이미지 한 장으로 그대로 쓴다.
export default function SplashPage() {
  const router = useRouter();

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
          onClick={() => router.push("/location-permission")}
          className="absolute inset-x-5 bottom-8 h-[54px] rounded-lg bg-ink text-white flex items-center justify-center text-[17px] font-bold cursor-pointer"
        >
          시작하기
        </button>
      </div>
    </WireframeLayout>
  );
}
