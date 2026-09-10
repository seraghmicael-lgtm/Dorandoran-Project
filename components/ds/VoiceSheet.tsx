"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { listenOnce, unlockAudio, ListenHandle } from "@/lib/voice";

// UI디자인 Frame 202(1187:3876) 의 말하기 시트 — 화면을 떠나지 않고 아래에서 올라온다.
// 듣는 동안은 디자인 그대로 360×350: 마이크(143×144)와 두 줄 문구를 28 간격으로 세로 가운데,
// 닫기는 오른쪽 위 20/20. 디자인에 없는 상태(들은 말 확인·요약·오류)는 같은 판 아래에
// [다음] 한 줄을 덧붙여 기존 동작을 그대로 이어간다.
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
  hint = "하고 싶은 활동을 말해보세요",
}: {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  summarize?: boolean;
  hint?: string;
}) {
  const [stage, setStage] = useState<Stage>("listening");
  const [heard, setHeard] = useState("");
  const [error, setError] = useState<[string, string]>(["", ""]);
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
        setError(["마이크를 쓸 수 없어요", "손으로 적어주셔도 돼요"]);
        setStage("error");
        return;
      }
      if (!transcript) {
        setError(["잘 안 들렸어요", "마이크를 누르고 한 번만 더 말씀해주세요"]);
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
    setError(["", ""]);
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

  // 굵은 첫 줄(16) + 회색 둘째 줄(14) — 디자인의 "듣고 있어요 / 하고 싶은 활동을 말해보세요"
  const [title, detail] =
    stage === "listening"
      ? ["듣고 있어요", hint]
      : stage === "working"
        ? [summarize ? "짧게 줄이고 있어요" : "확인하고 있어요", "잠시만 기다려주세요"]
        : stage === "error"
          ? error
          : ["이렇게 들었어요", `“${heard}”`];

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/40" role="dialog" aria-modal="true">
      {/* 시트 밖을 눌러도 닫힌다 */}
      <button type="button" aria-label="닫기" onClick={onClose} className="absolute inset-0 cursor-default" />

      <div className="relative w-full rounded-t-[20px] bg-white animate-[dropup_180ms_ease-out]">
        {/* icon(1187:3889) — 오른쪽 위 20/20 에 24 */}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-5 top-5 size-6 cursor-pointer"
        >
          <Image src="/illust/close.svg" alt="" width={24} height={24} />
        </button>

        <div className="h-[350px] flex flex-col items-center justify-center gap-7">
          {/* Frame 204(1187:3877) — 듣는 동안 테두리가 숨을 쉰다. 누르면 다시 듣는다. */}
          <button
            type="button"
            onClick={restart}
            aria-label="다시 말하기"
            className="shrink-0 cursor-pointer"
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

          {/* Frame 217(1187:3886) — 두 줄 사이 8 */}
          <div className="shrink-0 flex flex-col items-center gap-2 px-5 text-center">
            <p className="text-[16px] font-bold leading-[1.5] text-[#171717]">{title}</p>
            <p className="text-[14px] font-medium leading-[1.5] text-[#777777]">{detail}</p>
          </div>
        </div>

        {/* 디자인에 없는 상태 — 들은 말을 확인하고 넘어가는 줄 */}
        {stage !== "listening" && (
          <div className="px-4 pb-4">
            <button
              type="button"
              onClick={confirm}
              disabled={stage === "working"}
              className="w-full h-12 rounded-xl bg-ink text-white text-[16px] font-bold cursor-pointer disabled:opacity-60"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
