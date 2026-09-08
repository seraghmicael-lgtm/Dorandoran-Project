"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import BrandMark, { BrandWordmark } from "@/components/ds/BrandMark";

// UI디자인 splash(1235:8623) — 첫 화면 한 장. on-01의 로고·문구·ds_button이
// 전부 이 배경 사진 위에 얹힌 하나의 레이어다(별도 화면·탭 없이 바로 이 상태로 시작).
export default function SplashPage() {
  const router = useRouter();

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <div className="relative flex-1 w-full bg-[#edfafb]">
        <Image
          src="/illust/splash-bg.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="360px"
          className="object-cover object-bottom"
          priority
        />

        <div className="absolute inset-x-5 top-1/2 -translate-y-[60px] flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <BrandMark size={100} />
            <BrandWordmark width={124} />
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
