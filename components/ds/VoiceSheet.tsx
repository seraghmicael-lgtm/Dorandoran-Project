"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { listenOnce, unlockAudio, ListenHandle } from "@/lib/voice";

// UI디자인 cr-04 (1122:2687) 의 말하기 시트 — 화면을 떠나지 않고 아래에서 올라온다.
// 초록 마이크 하나, 들은 말을 따옴표로 되비쳐 주고, 아래 [다음] 으로 넘어간다.
type Stage = "listening" | "heard" | "working" | "error";

export default function VoiceSheet(props: {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  summarize?: boolean;
  hint?: string;
}) {
  // 열 때마다 새로 시작한다 — 지난번에 들은 말이 남아 있지 않게
  return props.open ? <Sheet {...props} /> : null;
}

function Sheet({
  onClose,
  onResult,
  /** 들은 말을 짧게 줄일지 — 하실 말씀 칸만 줄이고, 활동·장소는 그대로 쓴다 */
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
  const [heard, setHeard] = useState("");
  const [error, setError] = useState("");
  const [round, setRound] = useState(0);
  const handleRef = useRef<ListenHandle | null>(null);
  const aliveRef = useRef(false);

  useEffect(() => {
    aliveRef.current = true;
    unlockAudio();

    const handle = listenOnce();
    handleRef.current = handle;

    handle.promise.then(({ transcript, micDenied }) => {
      if (!aliveRef.current) return;
      if (micDenied) {
        setError("마이크를 쓸 수 없어요.\n손으로 적어주셔도 돼요.");
        setStage("error");
        return;
      }
      if (!transcript) {
        setError("잘 안 들렸어요.\n마이크를 누르고 한 번만 더 말씀해주세요.");
        setStage("error");
        return;
      }
      setHeard(transcript);
      setStage("heard");
    });

    return () => {
      aliveRef.current = false;
      handleRef.current?.cancel();
      handleRef.current = null;
    };
  }, [round]);

  // 다시 말하기 — 마이크를 누르면 처음부터 듣는다
  const restart = () => {
    handleRef.current?.cancel();
    setHeard("");
    setError("");
    setStage("listening");
    setRound((n) => n + 1);
  };

  const confirm = async () => {
    // 아직 듣는 중이면 먼저 말을 끊는다 — 한 번 더 누르면 넘어간다
    if (stage === "listening") {
      handleRef.current?.finish();
      return;
    }
    if (stage === "error") return restart();
    if (stage !== "heard") return;

    if (!summarize) {
      onResult(heard);
      onClose();
      return;
    }
    setStage("working");
    try {
      const res = await fetch("/api/summarize-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: heard }),
      });
      const { message: short } = res.ok ? await res.json() : { message: "" };
      if (!aliveRef.current) return;
      // 줄이지 못했으면 들은 말이라도 넣는다 — 다시 말하게 하지 않는다
      onResult(short || heard);
      onClose();
    } catch {
      if (!aliveRef.current) return;
      onResult(heard);
      onClose();
    }
  };

  const caption =
    stage === "listening"
      ? hint
      : stage === "working"
        ? summarize
          ? "짧게 줄이고 있어요"
          : "잠시만요"
        : stage === "error"
          ? error
          : `“${heard}”`;

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/40" role="dialog" aria-modal="true">
      {/* 시트 밖을 눌러도 닫힌다 */}
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 cursor-default" />

      <div className="relative w-full h-[430px] rounded-t-[20px] bg-white animate-[dropup_180ms_ease-out]">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-5 top-5 w-6 h-6 cursor-pointer"
        >
          <Image src="/illust/close.svg" alt="" width={24} height={24} />
        </button>

        {/* 초록 마이크 — 듣는 중에는 테두리가 숨을 쉰다. 누르면 다시 듣는다. */}
        <button
          type="button"
          onClick={restart}
          aria-label="다시 말하기"
          className="absolute left-[109px] top-[95px] w-[143px] h-[144px] cursor-pointer"
        >
          <Image
            src="/illust/mic.svg"
            alt=""
            width={143}
            height={144}
            className={stage === "listening" ? "animate-[ring_1400ms_ease-in-out_infinite]" : ""}
            priority
          />
        </button>

        <p className="absolute left-4 right-4 top-[282px] text-center text-[16px] font-bold text-ink leading-[1.4] whitespace-pre-line">
          {caption}
        </p>

        <div className="absolute bottom-0 left-0 w-full px-4 pt-10 pb-4">
          <button
            type="button"
            onClick={confirm}
            disabled={stage === "working"}
            className="w-full h-12 rounded-xl bg-ink text-white text-[16px] font-bold cursor-pointer disabled:opacity-60"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
