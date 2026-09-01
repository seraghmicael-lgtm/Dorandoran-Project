"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CreateStep from "@/components/ds/CreateStep";
import PrevNext from "@/components/ds/PrevNext";
import { updateDraft } from "@/lib/draft";
import { listenOnce, unlockAudio, ListenHandle } from "@/lib/voice";

// UI디자인 cr-06 (1089:7757) — 추가로 남길 얘기가 있나요?
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

  // 이 단계는 안 하셔도 되는 곳이라 다음은 늘 열려 있다.
  // 적어두신 게 있으면 담아가고, 없으면 비운 채로 넘어간다(건너뛸래요와 같다).
  const goNext = () => {
    handleRef.current?.cancel();
    const trimmed = text.trim();
    updateDraft({ message: trimmed || undefined });
    router.push("/create/review");
  };

  return (
    <CreateStep
      step={6}
      title={"추가로 남길\n얘기가 있나요?"}
      footer={<PrevNext backHref="/create/people" onNext={goNext} stack />}
    >
      <div className="mt-6 flex flex-col">
        {/* 큰 입력 박스 — 라운드 회색 필드 안에 말하기 줄이 붙는다 */}
        <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="예) 초보 환영합니다. 편하게 오세요"
            rows={4}
            className="w-full p-4 text-[16px] text-black placeholder:text-muted focus:outline-none resize-none"
          />
          {/* 아래 줄에 붙은 누르고 말하기 */}
          <div className="border-t border-gray-200 bg-surface flex justify-center">
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
            <p className="text-[14px] text-muted">{voiceError}</p>
          </>
        )}

      </div>
    </CreateStep>
  );
}
