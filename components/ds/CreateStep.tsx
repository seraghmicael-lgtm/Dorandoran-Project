"use client";

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
  children,
  footer,
}: {
  step: number;
  /** 줄바꿈은 디자인에 박혀 있어 \n 을 그대로 살린다 */
  title: string;
  /** 상단 ‹ 가 갈 곳 — 이전 화면과 같은 주소 */
  backHref: string;
  chips?: boolean;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <header className="h-[60px] px-5 flex items-center border-b border-gray-100 bg-white relative">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          aria-label="이전 화면으로"
          className="text-2xl text-black cursor-pointer leading-none"
        >
          ‹
        </button>
        <span className="absolute inset-x-0 text-center text-[17px] font-bold text-black pointer-events-none">
          동행 만들기
        </span>
      </header>

      <div className="px-5 pt-4">
        <Stepper step={step} />
      </div>

      <div className="flex-1 px-5 pt-5 flex flex-col">
        <h1 className="text-[24px] font-bold text-black leading-[1.35] whitespace-pre-line">
          {title}
        </h1>

        {chips && <MemoryChips />}
        {children}
      </div>

      {footer}
    </WireframeLayout>
  );
}
