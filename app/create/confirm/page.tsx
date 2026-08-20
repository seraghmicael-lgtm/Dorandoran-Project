"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";

export default function CreateConfirmPage() {
  const router = useRouter();

  // Core parsed fields
  const [transcript, setTranscript] = useState("세 시에 오일장 구경 같이해요");
  const [time, setTime] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [activity, setActivity] = useState<string | null>(null);
  const [missingField, setMissingField] = useState<"time" | "location" | "activity" | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);

  const [isParsing, setIsParsing] = useState(false);

  // Voice recording & transcription states for follow-up questions
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [textInput, setTextInput] = useState("");

  // Inline editing state for existing non-null fields
  const [editingTime, setEditingTime] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [editingActivity, setEditingActivity] = useState(false);
  const [inputTime, setInputTime] = useState("");
  const [inputLocation, setInputLocation] = useState("");
  const [inputActivity, setInputActivity] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const stopRequestedRef = useRef(false);

  // TTS audio playback states & refs
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentTtsUrlRef = useRef<string | null>(null);
  const lastSpokenQuestionRef = useRef<string | null>(null);

  const activeQuestion = missingField
    ? missingField === "time"
      ? followUpQuestion || "언제 만나고 싶으세요?"
      : missingField === "location"
      ? followUpQuestion || "어디서 만나고 싶으세요?"
      : missingField === "activity"
      ? followUpQuestion || "무엇을 하고 싶으세요?"
      : null
    : null;

  const speakQuestion = async (questionText: string) => {
    if (!questionText) return;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: questionText }),
      });
      if (!res.ok) return;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (currentTtsUrlRef.current) {
        URL.revokeObjectURL(currentTtsUrlRef.current);
      }
      currentTtsUrlRef.current = url;

      if (ttsAudioRef.current) {
        ttsAudioRef.current.src = url;
        ttsAudioRef.current.play().catch((err) => {
          console.warn("TTS autoplay blocked or failed:", err);
        });
      }
    } catch (err) {
      console.warn("TTS fetch error:", err);
    }
  };

  useEffect(() => {
    if (activeQuestion && activeQuestion !== lastSpokenQuestionRef.current) {
      lastSpokenQuestionRef.current = activeQuestion;
      speakQuestion(activeQuestion);
    } else if (!activeQuestion) {
      lastSpokenQuestionRef.current = null;
    }
  }, [activeQuestion]);

  useEffect(() => {
    return () => {
      if (currentTtsUrlRef.current) {
        URL.revokeObjectURL(currentTtsUrlRef.current);
      }
    };
  }, []);

  const handleReplayTts = () => {
    if (ttsAudioRef.current && ttsAudioRef.current.src) {
      ttsAudioRef.current.currentTime = 0;
      ttsAudioRef.current.play().catch((err) => {
        console.warn("Replay TTS blocked or failed:", err);
      });
    } else if (activeQuestion) {
      speakQuestion(activeQuestion);
    }
  };

  const applyParsedData = (data: any) => {
    if (!data) return;
    setTime(data.time ?? null);
    setLocation(data.location ?? null);
    setActivity(data.activity ?? null);
    setMissingField(data.missingField ?? null);
    setFollowUpQuestion(data.followUpQuestion ?? null);
  };

  const parseTranscript = async (
    inputTranscript: string,
    overrideValues?: { time?: string | null; location?: string | null; activity?: string | null }
  ) => {
    setIsParsing(true);
    try {
      const res = await fetch("/api/parse-meetup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: inputTranscript,
          time: overrideValues?.time !== undefined ? overrideValues.time : time,
          location: overrideValues?.location !== undefined ? overrideValues.location : location,
          activity: overrideValues?.activity !== undefined ? overrideValues.activity : activity,
        }),
      });
      if (!res.ok) {
        console.error("parse-meetup returned an error status:", res.status);
        return;
      }
      const data = await res.json();
      applyParsedData(data);
    } catch (err) {
      console.error("Failed to parse meetup transcript:", err);
    } finally {
      setIsParsing(false);
    }
  };

  useEffect(() => {
    const savedTranscript = sessionStorage.getItem("dorandoran_transcript");
    if (savedTranscript && savedTranscript.trim()) {
      setTranscript(savedTranscript);
      parseTranscript(savedTranscript, { time: null, location: null, activity: null });
    } else {
      parseTranscript("세 시에 오일장 구경 같이해요", { time: null, location: null, activity: null });
    }
  }, []);

  const handleAnswerSubmit = (answerText: string) => {
    if (!answerText || !answerText.trim()) return;
    setTextInput("");
    parseTranscript(answerText.trim());
  };

  const startAnswerRecording = async () => {
    try {
      stopRequestedRef.current = false;
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
          formData.append("file", audioBlob, "answer.webm");

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error("Transcribe failed");

          const data = await res.json();
          if (data.transcript && data.transcript.trim()) {
            handleAnswerSubmit(data.transcript.trim());
          }
        } catch (err) {
          console.error("Answer transcription error:", err);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      if (stopRequestedRef.current) {
        mediaRecorder.stop();
      }
    } catch (err) {
      console.error("Microphone access failed for answer recording:", err);
    }
  };

  const stopAnswerRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      stopRequestedRef.current = true;
    }
  };

  const isFormComplete = Boolean(time && location && activity);

  const handlePost = () => {
    if (!isFormComplete) return;
    const draftData = {
      transcript,
      time: time!,
      location: location!,
      activity: activity!,
    };
    sessionStorage.setItem("dorandoran_meetup_draft", JSON.stringify(draftData));
    router.push("/create/duration");
  };

  const renderFollowUpInput = () => (
    <div className="flex flex-col gap-2 pt-1">
      <div className="flex items-center gap-3">
        {/* Mic button (scaled-down "누르고 말하기" style) */}
        <button
          type="button"
          onPointerDown={startAnswerRecording}
          onPointerUp={stopAnswerRecording}
          onPointerLeave={isRecording ? stopAnswerRecording : undefined}
          disabled={isTranscribing || isParsing}
          className={`w-12 h-12 rounded-full border-2 transition-all flex flex-col items-center justify-center gap-0.5 select-none touch-none shrink-0 ${
            isRecording
              ? "border-red-500 bg-red-50 scale-105"
              : isTranscribing || isParsing
              ? "border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed"
              : "border-black bg-white hover:bg-gray-50 active:scale-95 shadow-sm"
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full border ${
              isRecording ? "bg-red-500 border-red-600 animate-ping" : "bg-gray-300 border-gray-400"
            }`}
          />
          <span className="text-[9px] font-bold text-black leading-tight">
            {isRecording ? "녹음 중" : isTranscribing ? "변환 중" : "말하기"}
          </span>
        </button>

        {/* Text input fallback */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnswerSubmit(textInput);
          }}
          className="flex-1 flex items-center gap-1.5"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="글자로 입력하셔도 돼요"
            disabled={isRecording || isTranscribing || isParsing}
            className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-black bg-white"
          />
          <button
            type="submit"
            disabled={!textInput.trim() || isParsing}
            className="px-3 py-1.5 bg-black text-white text-xs rounded font-medium disabled:bg-gray-300 disabled:cursor-not-allowed shrink-0"
          >
            입력
          </button>
        </form>
      </div>
      {(isParsing || isTranscribing) && (
        <p className="text-xs text-gray-500 animate-pulse">답변을 확인하고 있어요...</p>
      )}
    </div>
  );

  const renderQuestionHeader = (questionText: string) => (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-bold text-black">{questionText}</p>
      <button
        type="button"
        onClick={handleReplayTts}
        className="flex items-center gap-1 text-xs text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 px-2.5 py-1 rounded shrink-0 cursor-pointer shadow-sm"
        title="다시 듣기"
      >
        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
        </svg>
        <span>다시 듣기</span>
      </button>
    </div>
  );

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <HeaderBack title="이렇게 들었어요" backHref="/create/listening" />
      <audio ref={ttsAudioRef} hidden />

      <div className="p-4 flex flex-col items-center gap-5">
        {/* User raw input */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-1 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">말씀하신 내용</span>
            {isParsing && (
              <span className="text-xs text-gray-400 animate-pulse">분석 중...</span>
            )}
          </div>
          <p className="text-sm font-bold text-black">
            “{transcript}”
          </p>
        </div>

        {/* Extracted structure & follow-up questions */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-white flex flex-col gap-4 text-left">
          {/* Row 1: Time */}
          <div className="flex flex-col border-b border-gray-100 pb-3 gap-2">
            <div className="flex items-center justify-between">
              {editingTime ? (
                <div className="flex items-center gap-1.5 text-sm text-black flex-1 mr-2">
                  <span>오늘</span>
                  <input
                    type="text"
                    className="px-2 py-1 border border-black rounded text-sm font-bold w-32 focus:outline-none"
                    value={inputTime}
                    onChange={(e) => setInputTime(e.target.value)}
                    placeholder="오후 3시"
                    autoFocus
                  />
                  <span>에</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-black">
                  <span>오늘</span>
                  {time ? (
                    <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded font-bold">
                      {time}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 font-medium">시간 미정</span>
                  )}
                  <span>에</span>
                </div>
              )}

              {time && (
                editingTime ? (
                  <button
                    type="button"
                    onClick={() => {
                      const val = inputTime.trim() || null;
                      setTime(val);
                      setEditingTime(false);
                      if (!val) {
                        parseTranscript("", { time: null });
                      }
                    }}
                    className="text-xs text-black font-bold underline cursor-pointer"
                  >
                    완료
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setInputTime(time || "");
                      setEditingTime(true);
                    }}
                    className="text-xs text-gray-500 underline cursor-pointer"
                  >
                    고치기
                  </button>
                )
              )}
            </div>

            {/* Follow-up question UI if time is missing */}
            {!time && missingField === "time" && (
              <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-2">
                {renderQuestionHeader(followUpQuestion || "언제 만나고 싶으세요?")}
                {renderFollowUpInput()}
              </div>
            )}
          </div>

          {/* Row 2: Location */}
          <div className="flex flex-col border-b border-gray-100 pb-3 gap-2">
            <div className="flex items-center justify-between">
              {editingLocation ? (
                <div className="flex items-center gap-1.5 text-sm text-black flex-1 mr-2">
                  <input
                    type="text"
                    className="px-2 py-1 border border-black rounded text-sm font-bold w-full focus:outline-none"
                    value={inputLocation}
                    onChange={(e) => setInputLocation(e.target.value)}
                    placeholder="장소 입력 (예: 송정 오일장)"
                    autoFocus
                  />
                  <span>에서</span>
                </div>
              ) : (
                location ? (
                  <div className="flex items-center gap-1.5 text-sm text-black">
                    <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded font-bold">
                      {location}
                    </span>
                    <span>에서</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 font-medium">어디서 만날까요?</span>
                )
              )}

              {location && (
                editingLocation ? (
                  <button
                    type="button"
                    onClick={() => {
                      const val = inputLocation.trim() || null;
                      setLocation(val);
                      setEditingLocation(false);
                      if (!val) {
                        parseTranscript("", { location: null });
                      }
                    }}
                    className="text-xs text-black font-bold underline cursor-pointer"
                  >
                    완료
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setInputLocation(location || "");
                      setEditingLocation(true);
                    }}
                    className="text-xs text-gray-500 underline cursor-pointer"
                  >
                    고치기
                  </button>
                )
              )}
            </div>

            {/* Follow-up question UI if location is missing */}
            {!location && missingField === "location" && (
              <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-2">
                {renderQuestionHeader(followUpQuestion || "어디서 만나고 싶으세요?")}
                {renderFollowUpInput()}
              </div>
            )}
          </div>

          {/* Row 3: Activity */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              {editingActivity ? (
                <div className="flex items-center gap-1.5 text-sm text-black flex-1 mr-2">
                  <input
                    type="text"
                    className="px-2 py-1 border border-black rounded text-sm font-bold w-full focus:outline-none"
                    value={inputActivity}
                    onChange={(e) => setInputActivity(e.target.value)}
                    placeholder="활동 입력 (예: 오일장 구경)"
                    autoFocus
                  />
                  <span>같이 하실 분</span>
                </div>
              ) : (
                activity ? (
                  <div className="flex items-center gap-1.5 text-sm text-black">
                    <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded font-bold">
                      {activity}
                    </span>
                    <span>같이 하실 분</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 font-medium">무엇을 할까요?</span>
                )
              )}

              {activity && (
                editingActivity ? (
                  <button
                    type="button"
                    onClick={() => {
                      const val = inputActivity.trim() || null;
                      setActivity(val);
                      setEditingActivity(false);
                      if (!val) {
                        parseTranscript("", { activity: null });
                      }
                    }}
                    className="text-xs text-black font-bold underline cursor-pointer"
                  >
                    완료
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setInputActivity(activity || "");
                      setEditingActivity(true);
                    }}
                    className="text-xs text-gray-500 underline cursor-pointer"
                  >
                    고치기
                  </button>
                )
              )}
            </div>

            {/* Follow-up question UI if activity is missing */}
            {!activity && missingField === "activity" && (
              <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-2">
                {renderQuestionHeader(followUpQuestion || "무엇을 하고 싶으세요?")}
                {renderFollowUpInput()}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full flex flex-col gap-3 pt-4">
          <button
            type="button"
            onClick={handlePost}
            disabled={!isFormComplete}
            className={`w-full h-[53px] flex items-center justify-center rounded text-sm font-medium transition-colors ${
              isFormComplete
                ? "bg-black text-white cursor-pointer hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            올리기
          </button>

          <Link
            href="/create/speak"
            className="w-full h-[50px] border border-gray-300 bg-white text-black flex items-center justify-center rounded text-sm font-medium"
          >
            다시 말할래요
          </Link>
        </div>
      </div>
    </WireframeLayout>
  );
}
