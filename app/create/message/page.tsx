"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import { updateDraft } from "@/lib/draft";
import { unlockAudio } from "@/lib/voice";
import { unlockAgentAudio } from "@/lib/realtimeMeetup";

// 와이어프레임_v02 06_하실 말씀 있으세요
export default function CreateMessagePage() {
  const router = useRouter();
  const [text, setText] = useState("");

  const handleVoice = () => {
    unlockAudio();
    unlockAgentAudio();
    router.push("/create/listening");
  };

  const handleConfirm = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    updateDraft({ message: trimmed });
    router.push("/create/review");
  };

  const handleSkip = () => {
    router.push("/create/review");
  };

  const hasText = text.trim().length > 0;

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={6} backHref="/create/people" />

      <div className="px-[18px] py-[22px] flex flex-col">
        <h1 className="text-[22px] font-bold text-black">하실 말씀 있으세요?</h1>
        <p className="text-[15px] text-gray-500 mt-1">안 하셔도 괜찮아요</p>
        <div className="h-5" />

        {/* 큰 입력 박스 — 검정 1px 테두리 하나로 묶임 */}
        <div className="border border-black flex flex-col">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="여기에 쓰세요 예) 천천히 걸을게요"
            rows={4}
            className="w-full p-4 text-base font-bold text-black placeholder:font-normal placeholder:text-gray-500 focus:outline-none resize-none"
          />
          {/* 검정 상단 보더로 구분된 행 — 중앙 누르고 말하기 */}
          <div className="border-t border-black flex justify-center">
            <button
              type="button"
              onClick={handleVoice}
              className="flex items-center gap-[7px] py-[14px] cursor-pointer"
            >
              <span className="w-[18px] h-[18px] rounded-full border-2 border-black" />
              <span className="text-[15px] font-bold text-black">누르고 말하기</span>
            </button>
          </div>
        </div>

        {/* 텍스트가 비어있지 않으면 검정 배경 흰 글씨 이걸로 할게요 */}
        {hasText && (
          <>
            <div className="h-2.5" />
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-[14px] bg-black text-white text-[15px] font-bold cursor-pointer"
            >
              이걸로 할게요
            </button>
          </>
        )}

        {/* 항상 표시 — 회색 테두리 건너뛸래요 */}
        <div className="h-2.5" />
        <button
          type="button"
          onClick={handleSkip}
          className="w-full border border-gray-300 py-[14px] flex justify-center text-[15px] font-bold text-black cursor-pointer hover:bg-gray-50 active:bg-gray-100"
        >
          건너뛸래요
        </button>

        {/* 맨 아래 회색 안내문 */}
        <div className="h-5" />
        <p className="text-[15px] text-gray-500">여기에 남기신 한마디가 게시판에 그대로 보여요.</p>
      </div>
    </WireframeLayout>
  );
}
