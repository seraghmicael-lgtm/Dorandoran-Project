"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import CreateStepHeader from "@/components/CreateStepHeader";
import MemoryBubbles from "@/components/MemoryBubbles";
import { updateDraft } from "@/lib/draft";
import { listenOnce, unlockAudio, ListenHandle } from "@/lib/voice";

// 와이어프레임_v02 06_하실 말씀 있으세요
export default function CreateMessagePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "summarizing">("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const handleRef = useRef<ListenHandle | null>(null);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      handleRef.current?.cancel();
    };
  }, []);

  // 이 화면 안에서 듣고 요약해서 칸을 채운다 — 동행 만들기(/create/listening)로 넘어가지 않는다.
  const handleVoice = async () => {
    unlockAudio();
    if (voiceState === "listening") {
      handleRef.current?.finish(); // 한 번 더 누르면 "다 말했어요"
      return;
    }
    if (voiceState === "summarizing") return;

    setVoiceError(null);
    setVoiceState("listening");
    const handle = listenOnce({ onTranscribing: () => setVoiceState("summarizing") });
    handleRef.current = handle;
    const { transcript, micDenied } = await handle.promise;
    handleRef.current = null;
    if (unmountedRef.current) return;

    if (micDenied) {
      setVoiceState("idle");
      setVoiceError("마이크를 쓸 수 없어요. 아래 칸에 손으로 써주셔도 돼요.");
      return;
    }
    if (!transcript) {
      setVoiceState("idle");
      setVoiceError("잘 안 들렸어요. 한 번만 더 말씀해주세요.");
      return;
    }

    setVoiceState("summarizing");
    try {
      const res = await fetch("/api/summarize-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const { message } = res.ok ? await res.json() : { message: "" };
      if (unmountedRef.current) return;
      // 요약이 비면 들은 말이라도 넣는다 — 어르신이 다시 말하지 않아도 되게
      setText(message || transcript);
      if (!message) setVoiceError("짧게 줄이지 못했어요. 들은 대로 적었으니 고쳐주세요.");
    } catch {
      if (unmountedRef.current) return;
      setText(transcript);
      setVoiceError("정리하지 못했어요. 들은 대로 적었으니 고쳐주세요.");
    } finally {
      if (!unmountedRef.current) setVoiceState("idle");
    }
  };

  const voiceLabel =
    voiceState === "listening"
      ? "듣고 있어요 — 다 하시면 누르세요"
      : voiceState === "summarizing"
      ? "짧게 줄이고 있어요..."
      : "누르고 말하기";

  const handleConfirm = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    updateDraft({ message: trimmed });
    router.push("/create/review");
  };

  const handleSkip = () => {
    handleRef.current?.cancel();
    updateDraft({ message: undefined }); // 앞서 넣었던 한마디가 남지 않게
    router.push("/create/review");
  };

  const hasText = text.trim().length > 0;

  return (
    <WireframeLayout justify="start" bottomNav="none" className="flex flex-col">
      <CreateStepHeader step={6} backHref="/create/people" />

      <div className="px-[18px] py-[22px] flex flex-col">
        <MemoryBubbles />
        <h1 className="text-[22px] font-bold text-black">하실 말씀 있으세요?</h1>
        <p className="text-[15px] text-gray-500 mt-1">안 하셔도 괜찮아요</p>
        <div className="h-5" />

        {/* 큰 입력 박스 — 검정 1px 테두리 하나로 묶임 */}
        <div className="border border-black flex flex-col">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="예) 천천히 걸을게요"
            rows={4}
            className="w-full p-4 text-base font-bold text-black placeholder:font-normal placeholder:text-gray-500 focus:outline-none resize-none"
          />
          {/* 검정 상단 보더로 구분된 행 — 중앙 누르고 말하기 */}
          <div className="border-t border-black flex justify-center">
            <button
              type="button"
              onClick={handleVoice}
              disabled={voiceState === "summarizing"}
              className="flex items-center gap-[7px] py-[14px] cursor-pointer disabled:cursor-default"
            >
              <span
                className={`w-[18px] h-[18px] rounded-full border-2 ${
                  voiceState === "listening" ? "border-red-500 bg-red-500" : "border-black"
                }`}
              />
              <span className="text-[15px] font-bold text-black">{voiceLabel}</span>
            </button>
          </div>
        </div>

        {voiceError && (
          <>
            <div className="h-2" />
            <p className="text-[14px] text-gray-500">{voiceError}</p>
          </>
        )}

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
