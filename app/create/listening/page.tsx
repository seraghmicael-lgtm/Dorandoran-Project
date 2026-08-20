"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";

type Phase = "starting" | "recording" | "transcribing" | "mic-error" | "transcribe-error";

export default function CreateListeningPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("starting");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const finishRequestedRef = useRef(false);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      finishRequestedRef.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        if (!finishRequestedRef.current) return; // unmount cleanup

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        if (audioBlob.size === 0) {
          setPhase("transcribe-error");
          return;
        }

        setPhase("transcribing");
        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording");

          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          if (!res.ok) throw new Error("Transcription failed");

          const data = await res.json();
          if (data.transcript && data.transcript.trim()) {
            sessionStorage.setItem("dorandoran_transcript", data.transcript.trim());
            router.push("/create/confirm");
          } else {
            throw new Error("Empty transcript");
          }
        } catch (err) {
          console.error("Transcription error:", err);
          setPhase("transcribe-error");
        }
      };

      mediaRecorder.start();
      setPhase("recording");

      if (finishRequestedRef.current) {
        mediaRecorder.stop();
      }
    } catch (err) {
      console.error("Microphone access failed:", err);
      setPhase("mic-error");
    }
  };

  useEffect(() => {
    startRecording();
    return () => {
      finishRequestedRef.current = false;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinish = () => {
    if (phase === "transcribing") return;
    if (phase === "mic-error" || phase === "transcribe-error") {
      // 실패 상태에서 다시 누르면 처음부터 다시 녹음
      setPhase("starting");
      startRecording();
      return;
    }
    finishRequestedRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleWriteClick = () => {
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
            {phase === "transcribing" ? "말씀을 글로 옮기고 있어요..." : "세 시에 오일장 구경 같이"}
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
        {phase === "transcribe-error" && (
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
