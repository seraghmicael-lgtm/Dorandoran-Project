"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";

// UI디자인 splash(1235:8623) — 첫 화면. 문구·버튼 없는 순수 브랜드 스플래시로 바뀌어
// 잠깐 보여주고 자동으로 다음(on-01, /onboarding)으로 넘어간다. 눌러서 바로 넘어갈 수도 있다.
// 로고·문구가 배경 그림에 함께 그려져 있어 통짜 이미지 한 장으로 그대로 쓴다.
export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push("/onboarding"), 1500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <button
        type="button"
        onClick={() => router.push("/onboarding")}
        aria-label="시작하기"
        className="relative flex-1 w-full bg-[#ebf7f5] cursor-pointer"
      >
        <Image
          src="/illust/splash-bg.png"
          alt="오늘마실"
          fill
          sizes="360px"
          className="object-cover object-bottom"
          priority
        />
      </button>
    </WireframeLayout>
  );
}
