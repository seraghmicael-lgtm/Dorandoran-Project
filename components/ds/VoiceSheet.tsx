"use client";

import { useEffect, useRef, useState } from "react";
import { listenOnce, unlockAudio, ListenHandle } from "@/lib/voice";

// 말하기를 누르면 아래에서 올라오는 시트.
// 화면을 떠나지 않고 그 자리에서 듣고 정리해 칸을 채운다.
type Stage = "listening" | "working" | "error";

export default function VoiceSheet(props: {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  summarize?: boolean;
  hint?: string;
}) {
  // open 이 바뀔 때마다 새 인스턴스로 시작한다 — 이전 상태가 남아 있지 않게
  return props.open ? <Sheet key={String(props.open)} {...props} /> : null;
}

function Sheet({
  open,
  onClose,
  onResult,
  /** 들은 말을 짧게 줄일지 — 하실 말씀 칸은 줄이고, 활동·장소는 그대로 쓴다 */
  summarize = false,
  hint = "말씀하세요",
}: {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  summarize?: boolean;
  hint?: string;
}) {
  const [stage, setStage] = useState<Stage>("listening");
  const [message, setMessage] = useState("");
  const handleRef = useRef<ListenHandle | null>(null);
  const aliveRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    aliveRef.current = true;
    unlockAudio();

    const handle = listenOnce({ onTranscribing: () => aliveRef.current && setStage("working") });
    handleRef.current = handle;

    handle.promise.then(async ({ transcript, micDenied }) => {
      if (!aliveRef.current) return;
      if (micDenied) {
        setMessage("마이크를 쓸 수 없어요. 손으로 적어주셔도 돼요.");
        setStage("error");
        return;
      }
      if (!transcript) {
        setMessage("잘 안 들렸어요. 한 번만 더 말씀해주세요.");
        setStage("error");
        return;
      }
      if (!summarize) {
        onResult(transcript);
        onClose();
        return;
      }
      setStage("working");
      try {
        const res = await fetch("/api/summarize-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });
        const { message: short } = res.ok ? await res.json() : { message: "" };
        if (!aliveRef.current) return;
        // 줄이지 못했으면 들은 말이라도 넣는다 — 다시 말하게 하지 않는다
        onResult(short || transcript);
        onClose();
      } catch {
        if (!aliveRef.current) return;
        onResult(transcript);
        onClose();
      }
    });

    return () => {
      aliveRef.current = false;
      handleRef.current?.cancel();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/40" role="dialog" aria-modal="true">
      {/* 시트 밖을 누르면 닫는다 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative w-full rounded-t-3xl bg-white px-5 pt-3 pb-7 flex flex-col items-center gap-4 animate-[dropup_180ms_ease-out]">
        <span className="w-10 h-1 rounded-full bg-gray-300" aria-hidden="true" />

        {stage === "listening" && (
          <>
            {/* 듣는 중 — 막대가 번갈아 뛴다 */}
            <div className="flex items-end gap-1.5 h-[46px] pt-3" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="w-[7px] rounded-sm bg-accent animate-[bar_900ms_ease-in-out_infinite]"
                  style={{ height: 30, animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
            <p className="text-[19px] font-bold text-black">듣고 있어요</p>
            <p className="text-[15px] text-muted">{hint}</p>
            <button
              type="button"
              onClick={() => handleRef.current?.finish()}
              className="w-full h-[54px] rounded-lg bg-ink text-white flex items-center justify-center text-[17px] font-bold cursor-pointer"
            >
              다 말했어요
            </button>
          </>
        )}

        {stage === "working" && (
          <>
            <p className="pt-6 text-[19px] font-bold text-black">
              {summarize ? "짧게 줄이고 있어요" : "글로 옮기고 있어요"}
            </p>
            <p className="text-[15px] text-muted">잠시만요</p>
          </>
        )}

        {stage === "error" && (
          <>
            <p className="pt-6 text-[19px] font-bold text-black">{message}</p>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-[54px] rounded-lg border border-gray-300 bg-white text-black flex items-center justify-center text-[17px] font-medium cursor-pointer"
            >
              닫기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
