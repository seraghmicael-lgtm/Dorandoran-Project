"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";
import { listenOnce, playTts, stopTts, unlockAudio, ListenHandle } from "@/lib/voice";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function CreateListeningPage() {
  const router = useRouter();

  // ---- 대화 상태 ----
  const [transcript, setTranscript] = useState("");
  const [liveText, setLiveText] = useState("");
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  // ---- 파싱 결과 (이렇게 들었어요) ----
  const [time, setTime] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [activity, setActivity] = useState<string | null>(null);
  const [missingField, setMissingField] = useState<"time" | "location" | "activity" | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseNonce, setParseNonce] = useState(0);
  const hasParsed = parseNonce > 0;

  // ---- 수동 보정 UI ----
  const [textInput, setTextInput] = useState("");
  const [editingTime, setEditingTime] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [editingActivity, setEditingActivity] = useState(false);
  const [inputTime, setInputTime] = useState("");
  const [inputLocation, setInputLocation] = useState("");
  const [inputActivity, setInputActivity] = useState("");

  // ---- 오케스트레이션 ----
  const handleRef = useRef<ListenHandle | null>(null);
  const turnTokenRef = useRef(0);
  const emptyCountRef = useRef(0);
  const micDeniedRef = useRef(false);
  const unmountedRef = useRef(false);
  const [needTap, setNeedTap] = useState(false); // 자동 듣기가 안 돼 탭이 필요한 상태
  const [debugLines, setDebugLines] = useState<string[]>([]);

  const pushDebug = (msg: string) => {
    if (unmountedRef.current) return;
    setDebugLines((prev) => [...prev.slice(-2), msg]); // 최근 3개만 유지
  };

  const activeQuestion = missingField
    ? missingField === "time"
      ? followUpQuestion || "언제 만나고 싶으세요?"
      : missingField === "location"
      ? followUpQuestion || "어디서 만나고 싶으세요?"
      : followUpQuestion || "무엇을 하고 싶으세요?"
    : null;

  const cancelCurrent = () => {
    turnTokenRef.current++;
    handleRef.current?.cancel();
    handleRef.current = null;
    setListening(false);
    setTranscribing(false);
    stopTts();
  };

  const applyParsedData = (data: any) => {
    if (!data) return;
    setTime(data.time ?? null);
    setLocation(data.location ?? null);
    setActivity(data.activity ?? null);
    setMissingField(data.missingField ?? null);
    setFollowUpQuestion(data.followUpQuestion ?? null);
    setParseNonce((n) => n + 1);
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
      if (!res.ok) return;
      const data = await res.json();
      applyParsedData(data);
    } catch (err) {
      console.error("parse-meetup failed:", err);
    } finally {
      setIsParsing(false);
    }
  };

  /** 한 번 듣기 — 결과를 대화 단계에 맞게 라우팅한다 */
  const listen = async (kind: "initial" | "answer", token: number) => {
    setNeedTap(false);
    setLiveText("");
    setListening(true);
    const handle = listenOnce({
      onPartial: (t) => {
        if (!unmountedRef.current) setLiveText(t);
      },
      onTranscribing: () => {
        if (!unmountedRef.current) setTranscribing(true);
      },
      onDebug: pushDebug,
    });
    handleRef.current = handle;
    const { transcript: heard, noVad, micDenied } = await handle.promise;
    handleRef.current = null;
    if (unmountedRef.current || token !== turnTokenRef.current) return;
    setListening(false);
    setTranscribing(false);

    if (micDenied) {
      micDeniedRef.current = true;
      setNeedTap(true);
      return;
    }
    if (heard) {
      emptyCountRef.current = 0;
      if (kind === "initial") {
        setTranscript(heard);
        parseTranscript(heard, { time: null, location: null, activity: null });
      } else {
        parseTranscript(heard);
      }
      return;
    }
    // 빈 결과
    if (noVad) {
      setNeedTap(true);
      return;
    }
    emptyCountRef.current++;
    if (emptyCountRef.current < 2) {
      await listen(kind, token);
    } else {
      setNeedTap(true);
    }
  };

  /** 문답 턴: 질문을 음성으로 말하고, 끝나면 자동으로 듣는다 */
  const runTurn = async (question: string) => {
    const token = ++turnTokenRef.current;
    emptyCountRef.current = 0;
    const played = await playTts(question);
    if (unmountedRef.current || token !== turnTokenRef.current) return;
    if (micDeniedRef.current) {
      setNeedTap(true);
      return;
    }
    if (!played) await sleep(500);
    await listen("answer", token);
  };

  // 첫 진입: 자동으로 듣기 시도 (안 되는 환경이면 버튼 탭으로 시작)
  useEffect(() => {
    unmountedRef.current = false;
    const token = ++turnTokenRef.current;
    listen("initial", token);
    return () => {
      unmountedRef.current = true;
      turnTokenRef.current++;
      handleRef.current?.cancel();
      stopTts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 파싱 결과가 나올 때마다: 빠진 필드가 있으면 음성 문답 턴 시작
  useEffect(() => {
    if (parseNonce === 0) return;
    if (!activeQuestion) return;
    runTurn(activeQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parseNonce]);

  /** 마이크 버튼 탭 — 제스처가 확보되는 유일하게 확실한 시작점 */
  const handleMicTap = () => {
    unlockAudio();
    if (listening) {
      handleRef.current?.finish(); // "다 말했어요" 역할
      return;
    }
    if (transcribing || isParsing) return;
    micDeniedRef.current = false; // 권한을 켰을 수도 있으니 재시도
    const token = ++turnTokenRef.current;
    stopTts();
    listen(hasParsed && activeQuestion ? "answer" : "initial", token);
  };

  const handleAnswerText = (text: string) => {
    if (!text.trim()) return;
    unlockAudio();
    cancelCurrent();
    setTextInput("");
    parseTranscript(text.trim());
  };

  const handleReplayTts = () => {
    unlockAudio();
    if (activeQuestion) playTts(activeQuestion);
  };

  const handleRestart = () => {
    unlockAudio();
    cancelCurrent();
    setTranscript("");
    setLiveText("");
    setTime(null);
    setLocation(null);
    setActivity(null);
    setMissingField(null);
    setFollowUpQuestion(null);
    setParseNonce(0);
    micDeniedRef.current = false;
    emptyCountRef.current = 0;
    const token = ++turnTokenRef.current;
    listen("initial", token);
  };

  const isFormComplete = Boolean(time && location && activity);

  const handlePost = () => {
    if (!isFormComplete) return;
    cancelCurrent();
    const draftData = {
      transcript: transcript || `${time}에 ${location}에서 ${activity}`,
      time: time!,
      location: location!,
      activity: activity!,
    };
    sessionStorage.setItem("dorandoran_meetup_draft", JSON.stringify(draftData));
    router.push("/create/duration");
  };

  const statusText = listening
    ? "듣고 있어요"
    : transcribing
    ? "말씀을 글로 옮기고 있어요..."
    : isParsing
    ? "말씀을 확인하고 있어요..."
    : needTap
    ? micDeniedRef.current
      ? "마이크 권한을 허용하신 뒤 버튼을 눌러주세요"
      : "버튼을 누르고 말씀해주세요"
    : hasParsed
    ? isFormComplete
      ? "내용을 확인하시고 올리기를 눌러주세요"
      : "버튼을 누르고 답하실 수도 있어요"
    : "버튼을 누르고 말씀해주세요";

  return (
    <WireframeLayout justify="start" className="flex flex-col">
      <HeaderBack title="동행 만들기" backHref="/create/speak" />

      <div className="p-4 flex flex-col items-center gap-5 text-center">
        {/* 마이크 버튼 + 상태 */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleMicTap}
            className={`w-[126px] h-[126px] rounded-full border-2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none ${
              listening
                ? "border-red-500 bg-red-50"
                : transcribing || isParsing
                ? "border-gray-300 bg-gray-100 opacity-70"
                : "border-black bg-white hover:bg-gray-50 active:scale-95 shadow-sm"
            }`}
          >
            {listening ? (
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-4 rounded bg-black animate-pulse" />
                <div className="w-1.5 h-[34px] rounded bg-black animate-pulse" />
                <div className="w-1.5 h-[50px] rounded bg-black animate-pulse" />
                <div className="w-1.5 h-7 rounded bg-black animate-pulse" />
                <div className="w-1.5 h-[42px] rounded bg-black animate-pulse" />
                <div className="w-1.5 h-5 rounded bg-black animate-pulse" />
              </div>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-gray-300 border border-gray-400" />
                <span className="text-xs font-bold text-black">누르고 말하기</span>
              </>
            )}
          </button>
          <span className="text-sm font-bold text-black">{statusText}</span>
          {listening && (
            <span className="text-[11px] text-gray-500">말씀이 끝나면 자동으로 알아들어요 · 버튼을 누르면 바로 끝나요</span>
          )}
          {/* ponytail: 진단 표시줄 — 원인 파악되면 제거 */}
          {debugLines.length > 0 && (
            <span className="text-[10px] text-gray-400 leading-tight">
              {debugLines.join(" · ")}
            </span>
          )}
        </div>

        {/* 실시간 받아적기 박스 */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-2 text-left">
          <span className="text-xs text-gray-500 font-medium">말씀하신 대로 적고 있어요</span>
          <p className="text-sm font-bold text-black">
            {liveText || transcript || "세 시에 오일장 구경 같이"}
          </p>
          <p className="text-sm text-gray-400">…</p>
        </div>

        {/* 이렇게 들었어요 — 파싱 결과 + 문답 */}
        {hasParsed && (
          <div className="w-full p-4 border border-gray-200 rounded-lg bg-white flex flex-col gap-4 text-left">
            <span className="text-xs text-gray-500 font-medium">이렇게 들었어요</span>

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
                {time &&
                  (editingTime ? (
                    <button
                      type="button"
                      onClick={() => {
                        const val = inputTime.trim() || null;
                        setTime(val);
                        setEditingTime(false);
                        if (!val) parseTranscript("", { time: null });
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
                  ))}
              </div>
              {!time && missingField === "time" && (
                <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-black">
                      {followUpQuestion || "언제 만나고 싶으세요?"}
                    </p>
                    <button
                      type="button"
                      onClick={handleReplayTts}
                      className="text-xs text-gray-700 bg-white border border-gray-300 px-2.5 py-1 rounded shrink-0 cursor-pointer"
                    >
                      다시 듣기
                    </button>
                  </div>
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
                ) : location ? (
                  <div className="flex items-center gap-1.5 text-sm text-black">
                    <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded font-bold">
                      {location}
                    </span>
                    <span>에서</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 font-medium">어디서 만날까요?</span>
                )}
                {location &&
                  (editingLocation ? (
                    <button
                      type="button"
                      onClick={() => {
                        const val = inputLocation.trim() || null;
                        setLocation(val);
                        setEditingLocation(false);
                        if (!val) parseTranscript("", { location: null });
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
                  ))}
              </div>
              {!location && missingField === "location" && (
                <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-black">
                      {followUpQuestion || "어디서 만나고 싶으세요?"}
                    </p>
                    <button
                      type="button"
                      onClick={handleReplayTts}
                      className="text-xs text-gray-700 bg-white border border-gray-300 px-2.5 py-1 rounded shrink-0 cursor-pointer"
                    >
                      다시 듣기
                    </button>
                  </div>
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
                ) : activity ? (
                  <div className="flex items-center gap-1.5 text-sm text-black">
                    <span className="px-2.5 py-1 bg-gray-100 border border-gray-300 rounded font-bold">
                      {activity}
                    </span>
                    <span>같이 하실 분</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 font-medium">무엇을 할까요?</span>
                )}
                {activity &&
                  (editingActivity ? (
                    <button
                      type="button"
                      onClick={() => {
                        const val = inputActivity.trim() || null;
                        setActivity(val);
                        setEditingActivity(false);
                        if (!val) parseTranscript("", { activity: null });
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
                  ))}
              </div>
              {!activity && missingField === "activity" && (
                <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-black">
                      {followUpQuestion || "무엇을 하고 싶으세요?"}
                    </p>
                    <button
                      type="button"
                      onClick={handleReplayTts}
                      className="text-xs text-gray-700 bg-white border border-gray-300 px-2.5 py-1 rounded shrink-0 cursor-pointer"
                    >
                      다시 듣기
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 글자 입력 폴백 (질문이 있을 때만) */}
            {activeQuestion && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAnswerText(textInput);
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onFocus={cancelCurrent}
                  placeholder="글자로 입력하셔도 돼요"
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
            )}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="w-full flex flex-col gap-3 pt-1">
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

          <button
            type="button"
            onClick={handleRestart}
            className="w-full h-[50px] border border-gray-300 bg-white text-black flex items-center justify-center rounded text-sm font-medium cursor-pointer"
          >
            다시 말할래요
          </button>

          <Link
            href="/create/write"
            className="w-full h-[50px] border border-gray-300 bg-white text-black flex items-center justify-center rounded text-sm font-medium"
          >
            손으로 쓸래요
          </Link>
        </div>

        <p className="text-xs text-gray-500 pb-2">
          소리 내기 어려운 곳이면 손으로 쓰셔도 돼요
        </p>
      </div>
    </WireframeLayout>
  );
}
