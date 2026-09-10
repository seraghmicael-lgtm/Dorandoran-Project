"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import MemoryChips from "@/components/ds/MemoryChips";
import Stepper from "@/components/ds/Stepper";

// UI디자인 CR 그룹(cr-01~cr-06)의 공통 뼈대.
//   상단 네비(← · 동행 만들기) → 진행 막대 → 제목 → 메모리 칩 → 본문 → 이전/다음
// ← 는 "이전" 버튼과 같은 곳으로 간다 — 뒤로 가는 것은 안전하다(적어둔 내용이 그대로 남는다).
export default function CreateStep({
  step,
  title,
  backHref,
  chips = true,
  body = "padded",
  children,
  footer,
}: {
  step: number;
  /** 줄바꿈은 디자인에 박혀 있어 \n 을 그대로 살린다 */
  title: string;
  /** 상단 ‹ 가 갈 곳 — 이전 화면과 같은 주소 */
  backHref: string;
  chips?: boolean;
  /** 본문 여백 — cr-01 처럼 블록마다 좌우 여백이 다른 화면은 "bare" 로 두고 직접 준다 */
  body?: "padded" | "bare";
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      {/* ds_navigation_top(1089:5108) — 60px. 좌우 8 안에 48 짜리 아이콘 버튼이 있어
          아이콘 자체는 20px 자리에서 시작한다. */}
      <header className="h-[60px] shrink-0 px-2 flex items-center border-b border-[#E5E5E5] bg-white relative">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          aria-label="이전 화면으로"
          className="size-12 flex items-center justify-center cursor-pointer"
        >
          <Image src="/illust/arrow-back-ios-new.svg" alt="" width={24} height={24} />
        </button>
        <span className="absolute inset-x-0 text-center text-[18px] font-medium leading-[1.5] text-[#171717] pointer-events-none">
          동행 만들기
        </span>
      </header>

      {/* stepper(1187:3789) — 38px 짜리 줄. 막대 묶음(320)을 가운데 두므로 좌우 20 이다. */}
      <div className="shrink-0 px-5 py-4">
        <Stepper step={step} />
      </div>

      {/* title(1089:5670) — 104px 짜리 줄. 글자는 좌우 16 에서 시작한다. */}
      <div className="shrink-0 px-4 py-4">
        <h1 className="text-[28px] font-bold text-black leading-[1.3] tracking-[-0.28px] whitespace-pre-line">
          {title}
        </h1>
      </div>

      <div className={`flex-1 flex flex-col ${body === "padded" ? "px-5" : ""}`}>
        {chips && <MemoryChips step={step} />}
        {children}
      </div>

      {footer}
    </WireframeLayout>
  );
}
