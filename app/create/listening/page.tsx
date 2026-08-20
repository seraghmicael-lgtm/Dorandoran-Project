"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";
import { RealtimeClient, RealtimeStatus } from "@/lib/realtime-client";

export default function CreateListeningPage() {
  const router = useRouter();
  const [transcript, setTranscript] = useState<string>("");
  const [status, setStatus] = useState<RealtimeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Whisper Fallback states
  const [useFallback, setUseFallback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  const clientRef = useRef<RealtimeClient | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // TTS Ref for fallback instruction
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsPlayedRef = useRef<boolean>(false);

  useEffect(() => {
    const client = new RealtimeClient({
      onTranscript: (text) => {
        setTranscript(text);
      },
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
      },
      onError: (err) => {
        console.warn("Realtime client error:", err);
        setErrorMessage(err.message || "음성 연결이 원활하지 않습니다.");
      },
    });

    clientRef.current = client;

    client.connect().catch((err) => {
      console.warn("Realtime connection failed, using Whisper fallback:", err);
      setStatus("error");
      setUseFallback(true);
    });

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (useFallback && !ttsPlayedRef.current) {
      ttsPlayedRef.current = true;
      fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "다시 녹음해볼게요. 버튼을 누르고 말씀해주세요." }),
      })
        .then((res) => {
          if (!res.ok) return null;
          return res.blob();
        })
        .then((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          if (ttsAudioRef.current) {
            ttsAudioRef.current.src = url;
            ttsAudioRef.current.play().catch((err) => {
              console.warn("Fallback TTS autoplay failed:", err);
            });
          }
        })
        .catch((err) => {
          console.warn("Fallback TTS fetch failed:", err);
        });
    }
  }, [useFallback]);

  const startFallbackRecording = async () => {
    try {
      setFallbackFailed(false);
      audioChunksRef.current = [];
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
        setIsRecording(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        if (audioBlob.size === 0) return;

        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error("Transcription failed");

          const data = await res.json();
          if (data.transcript && data.transcript.trim()) {
            setTranscript(data.transcript.trim());
            if (typeof window !== "undefined") {
              sessionStorage.setItem("dorandoran_transcript", data.transcript.trim());
            }
            router.push("/create/confirm");
          } else {
            throw new Error("Empty transcript returned");
          }
        } catch (transcribeErr) {
          console.error("Fallback transcription error:", transcribeErr);
          setFallbackFailed(true);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to access microphone for fallback recording:", err);
      setFallbackFailed(true);
    }
  };

  const stopFallbackRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFinish = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
    const finalTranscript = transcript.trim() || "세 시에 오일장 구경 같이";
    if (typeof window !== "undefined") {
      sessionStorage.setItem("dorandoran_transcript", finalTranscript);
    }
    router.push("/create/confirm");
  };

  const handleWriteClick = () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
    router.push("/create/write");
  };

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <HeaderBack title="듣고 있어요" backHref="/create/speak" />
      <audio ref={ttsAudioRef} hidden />

      <div className="p-4 flex flex-col items-center gap-6 text-center">
        {/* Recording Visualizer or Circular Button */}
        {!useFallback ? (
          <div className="flex flex-col items-center gap-3 pt-4">
            <div className="w-[126px] h-[126px] rounded-full border border-gray-300 bg-gray-50 flex items-center justify-center gap-1.5">
              <div className={`w-1.5 h-6 rounded ${status === "connected" ? "bg-black animate-pulse" : "bg-gray-400"}`} />
              <div className={`w-1.5 h-10 rounded ${status === "connected" ? "bg-black animate-pulse" : "bg-gray-400"}`} />
              <div className={`w-1.5 h-14 rounded ${status === "connected" ? "bg-black animate-pulse" : "bg-gray-400"}`} />
              <div className={`w-1.5 h-8 rounded ${status === "connected" ? "bg-black animate-pulse" : "bg-gray-400"}`} />
              <div className={`w-1.5 h-12 rounded ${status === "connected" ? "bg-black animate-pulse" : "bg-gray-400"}`} />
              <div className={`w-1.5 h-5 rounded ${status === "connected" ? "bg-black animate-pulse" : "bg-gray-400"}`} />
            </div>
            <span className="text-base font-bold text-black">듣고 있어요</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 pt-2">
            <p className="text-sm font-medium text-gray-700">
              {isTranscribing
                ? "음성을 변환하고 있어요..."
                : isRecording
                ? "말씀하신 후 버튼을 떼어주세요"
                : "다시 녹음해볼게요"}
            </p>
            <div className="py-2 flex justify-center">
              <button
                type="button"
                onPointerDown={startFallbackRecording}
                onPointerUp={stopFallbackRecording}
                onPointerLeave={isRecording ? stopFallbackRecording : undefined}
                disabled={isTranscribing}
                className={`w-[130px] h-[130px] rounded-full border-2 transition-all flex flex-col items-center justify-center gap-2 select-none touch-none ${
                  isRecording
                    ? "border-red-500 bg-red-50 scale-105"
                    : isTranscribing
                    ? "border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed"
                    : "border-black bg-white hover:bg-gray-50 active:scale-95 shadow-sm"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full border ${
                    isRecording ? "bg-red-500 border-red-600 animate-ping" : "bg-gray-300 border-gray-400"
                  }`}
                />
                <span className="text-xs font-bold text-black">
                  {isRecording ? "녹음 중..." : isTranscribing ? "변환 중..." : "누르고 말하기"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Fallback Failure Error Alert */}
        {fallbackFailed && (
          <div className="w-full p-3 border border-gray-300 rounded bg-gray-100 text-xs text-gray-700 text-left">
            음성 연결에 실패했습니다. 아래 &apos;손으로 쓸래요&apos; 버튼을 눌러 직접 작성하실 수 있습니다.
          </div>
        )}

        {/* Realtime voice transcription box */}
        {!useFallback && (
          <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-2 text-left">
            <span className="text-xs text-gray-500 font-medium">
              말씀하신 대로 적고 있어요
            </span>
            <p className="text-sm font-bold text-black">
              {transcript || "세 시에 오일장 구경 같이"}
            </p>
            <p className="text-sm text-gray-400">…</p>
          </div>
        )}

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3 pt-2">
          {!useFallback && (
            <button
              type="button"
              onClick={handleFinish}
              className="w-full h-[53px] bg-black text-white flex items-center justify-center rounded text-sm font-medium"
            >
              다 말했어요
            </button>
          )}

          <button
            type="button"
            onClick={handleWriteClick}
            className="w-full h-[50px] border border-gray-300 bg-white text-black flex items-center justify-center rounded text-sm font-medium"
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
