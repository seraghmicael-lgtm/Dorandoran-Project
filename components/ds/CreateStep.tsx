"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearDraft } from "@/lib/draft";
import WireframeLayout from "@/components/WireframeLayout";
import MemoryChips from "@/components/ds/MemoryChips";

// UI디자인 CR 그룹(cr-01~cr-06)의 공통 뼈대.
//   상단 네비(← · 동행 만들기) → 제목 + 단계 배지 → 메모리 칩 → 본문 → 이전/다음
// ← 는 흐름에서 빠져나가는 길이라 나가기 전에 한 번 묻는다(적어둔 게 통째로 사라진다).
export default function CreateStep({
  step,
  title,
  chips = true,
  children,
  footer,
}: {
  step: number;
  /** 줄바꿈은 디자인에 박혀 있어 \n 을 그대로 살린다 */
  title: string;
  chips?: boolean;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <header className="h-[60px] px-5 flex items-center border-b border-gray-100 bg-white relative">
        <button
          type="button"
          onClick={() => setAsking(true)}
          aria-label="동행 만들기 그만두기"
          className="text-2xl text-black cursor-pointer leading-none"
        >
          ‹
        </button>
        <span className="absolute inset-x-0 text-center text-[17px] font-bold text-black pointer-events-none">
          동행 만들기
        </span>
      </header>

      <div className="flex-1 px-5 pt-7 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[24px] font-bold text-black leading-[1.35] whitespace-pre-line">
            {title}
          </h1>
          <span className="shrink-0 mt-1 px-2.5 py-1 rounded-full bg-accent-faint text-accent text-[13px] font-bold">
            {step} / 6
          </span>
        </div>

        {chips && <MemoryChips />}
        {children}
      </div>

      {footer}

      {asking && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-create-title"
        >
          <div className="w-full max-w-[320px] my-auto bg-white rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <h2 id="leave-create-title" className="text-[19px] font-bold text-black">
                동행 만들기를 취소하시겠어요?
              </h2>
              <p className="text-[15px] text-muted">작성한 내용은 사라집니다</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  clearDraft();
                  router.push("/home");
                }}
                className="w-full h-[54px] rounded-lg bg-white text-black border border-gray-300 flex items-center justify-center text-[17px] font-medium cursor-pointer"
              >
                홈으로
              </button>
              <button
                type="button"
                onClick={() => setAsking(false)}
                className="w-full h-[54px] rounded-lg bg-ink text-white flex items-center justify-center text-[17px] font-bold cursor-pointer"
              >
                계속 모임 만들기
              </button>
            </div>
          </div>
        </div>
      )}
    </WireframeLayout>
  );
}
