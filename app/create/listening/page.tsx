"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";
import { listenOnce, unlockAudio, ListenHandle } from "@/lib/voice";

type Phase = "starting" | "recording" | "transcribing" | "mic-error" | "voice-error";

export default function CreateListeningPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("starting");
  const [liveText, setLiveText] = useState("");
  const handleRef = useRef<ListenHandle | null>(null);
  const unmountedRef = useRef(false);

  const startListen = () => {
    setPhase("starting");
    setLiveText("");
    const handle = listenOnce({
      onPartial: (text) => {
        if (!unmountedRef.current) setLiveText(text);
      },
      onTranscribing: () => {
        if (!unmountedRef.current) setPhase("transcribing");
      },
    });
    handleRef.current = handle;
    setPhase("recording");

    handle.promise.then(({ transcript, micDenied }) => {
      if (unmountedRef.current) return;
      if (transcript) {
        sessionStorage.setItem("dorandoran_transcript", transcript);
        router.push("/create/confirm");
      } else {
        setPhase(micDenied ? "mic-error" : "voice-error");
      }
    });
  };

  useEffect(() => {
    unmountedRef.current = false;
    startListen();
    return () => {
      unmountedRef.current = true;
      handleRef.current?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinish = () => {
    unlockAudio();
    if (phase === "transcribing") return;
    if (phase === "mic-error" || phase === "voice-error") {
      startListen();
      return;
    }
    handleRef.current?.finish();
  };

  const handleWriteClick = () => {
    handleRef.current?.cancel();
    router.push("/create/write");
  };

  const isRecording = phase === "recording";

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <HeaderBack title="듣고 있어요" backHref="/create/speak" />

      <div className="p-4 flex flex-col items-center gap-6 text-center">
        {/* Waveform circle */}
        <div className="flex flex-col items-center gap-3 pt-4">
          <div className="w-[126px] h-[126px] rounded-full border border-gray-300 bg-gray-50 flex items-center justify-center gap-1.5">
            <div className={`w-1.5 h-4 rounded ${isRecording ? "bg-black animate-pulse" : "bg-gray-400"}`} />
            <div className={`w-1.5 h-[34px] rounded ${isRecording ? "bg-black animate-pulse" : "bg-gray-400"}`} />
            <div className={`w-1.5 h-[50px] rounded ${isRecording ? "bg-black animate-pulse" : "bg-gray-400"}`} />
            <div className={`w-1.5 h-7 rounded ${isRecording ? "bg-black animate-pulse" : "bg-gray-400"}`} />
            <div className={`w-1.5 h-[42px] rounded ${isRecording ? "bg-black animate-pulse" : "bg-gray-400"}`} />
            <div className={`w-1.5 h-5 rounded ${isRecording ? "bg-black animate-pulse" : "bg-gray-400"}`} />
          </div>
          <span className="text-base font-bold text-black">듣고 있어요</span>
        </div>

        {/* Transcript box */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-2 text-left">
          <span className="text-xs text-gray-500 font-medium">
            말씀하신 대로 적고 있어요
          </span>
          <p className="text-sm font-bold text-black">
            {phase === "transcribing"
              ? "말씀을 글로 옮기고 있어요..."
              : liveText || "세 시에 오일장 구경 같이"}
          </p>
          <p className="text-sm text-gray-400">…</p>
        </div>

        {/* Error notices */}
        {phase === "mic-error" && (
          <div className="w-full p-3 border border-gray-300 rounded bg-gray-100 text-xs text-gray-700 text-left">
            마이크를 사용할 수 없어요. 마이크 권한을 허용해주시거나, 아래 &apos;손으로
            쓸래요&apos; 버튼으로 직접 작성하실 수 있어요.
          </div>
        )}
        {phase === "voice-error" && (
          <div className="w-full p-3 border border-gray-300 rounded bg-gray-100 text-xs text-gray-700 text-left">
            말씀을 알아듣지 못했어요. &apos;다 말했어요&apos; 버튼을 눌러 다시
            말씀해주시거나, 아래 &apos;손으로 쓸래요&apos; 버튼으로 직접 작성하실 수
            있어요.
          </div>
        )}

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={handleFinish}
            disabled={phase === "transcribing"}
            className={`w-full h-[53px] flex items-center justify-center rounded text-sm font-medium ${
              phase === "transcribing"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white cursor-pointer"
            }`}
          >
            다 말했어요
          </button>

          <button
            type="button"
            onClick={handleWriteClick}
            className="w-full h-[50px] border border-gray-300 bg-white text-black flex items-center justify-center rounded text-sm font-medium cursor-pointer"
          >
            손으로 쓸래요
          </button>
        </div>

        <p className="text-xs text-gray-500 pt-1">
          소리 내기 어려운 곳이면 손으로 쓰셔도 돼요
        </p>
      </div>
    </WireframeLayout>
  );
}
