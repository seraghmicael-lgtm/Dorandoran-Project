"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import WireframeLayout from "@/components/WireframeLayout";
import HeaderBack from "@/components/HeaderBack";
import { listenOnce, playTts, stopTts, unlockAudio, ListenHandle } from "@/lib/voice";
import {
  connectRealtimeMeetup,
  unlockAgentAudio,
  RealtimeMeetupHandle,
  MeetupFields,
} from "@/lib/realtimeMeetup";
import { useAudioBands } from "@/lib/useAudioBands";
import BarVisualizer, { VisualizerState } from "@/components/ui/bar-visualizer";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Mode = "realtime" | "classic";

export default function CreateListeningPage() {
  const router = useRouter();

  // ---- 공통 대화 상태 ----
  const [mode, setMode] = useState<Mode>("realtime");
  const [transcript, setTranscript] = useState("");
  const [liveText, setLiveText] = useState("");
  const [agentLine, setAgentLine] = useState(""); // 도우미(에이전트)의 최근 말
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [started, setStarted] = useState(false); // 필드 박스 노출 여부

  // ---- 필드 ----
  const [time, setTime] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [activity, setActivity] = useState<string | null>(null);
  const [missingField, setMissingField] = useState<"time" | "location" | "activity" | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseNonce, setParseNonce] = useState(0);

  // ---- 수동 보정 UI ----
  const [textInput, setTextInput] = useState("");
  const [editingTime, setEditingTime] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [editingActivity, setEditingActivity] = useState(false);
  const [inputTime, setInputTime] = useState("");
  const [inputLocation, setInputLocation] = useState("");
  const [inputActivity, setInputActivity] = useState("");

  // ---- 오케스트레이션 ----
  const rtRef = useRef<RealtimeMeetupHandle | null>(null);
  const [rtStatus, setRtStatus] = useState<"connecting" | "connected" | "closed" | "error">(
    "connecting"
  );
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [agentStream, setAgentStream] = useState<MediaStream | null>(null);
  const handleRef = useRef<ListenHandle | null>(null);
  const turnTokenRef = useRef(0);
  const emptyCountRef = useRef(0);
  const micDeniedRef = useRef(false);
  const unmountedRef = useRef(false);
  const [needTap, setNeedTap] = useState(false);
  const [debugLines, setDebugLines] = useState<string[]>([]);

  const pushDebug = (msg: string) => {
    if (unmountedRef.current) return;
    setDebugLines((prev) => [...prev.slice(-2), msg]);
  };

  const activeQuestion = missingField
    ? missingField === "time"
      ? followUpQuestion || "언제 만나고 싶으세요?"
      : missingField === "location"
      ? followUpQuestion || "어디서 만나고 싶으세요?"
      : followUpQuestion || "무엇을 하고 싶으세요?"
    : null;

  // =====================================================================
  // 실시간(OpenAI Realtime) 모드
  // =====================================================================
  const mergeFields = (f: MeetupFields) => {
    // null = 아직 모름 → 기존 값 유지. 값이 오면 갱신(에이전트의 정정 포함).
    if (f.time != null && f.time !== "") setTime(f.time);
    if (f.location != null && f.location !== "") setLocation(f.location);
    if (f.activity != null && f.activity !== "") setActivity(f.activity);
    setStarted(true);
  };

  const rtAttemptsRef = useRef(0);
  const connectingRef = useRef(false);

  const connectRealtime = async (): Promise<boolean> => {
    if (connectingRef.current) return false;
    connectingRef.current = true;
    rtAttemptsRef.current++;
    setRtStatus("connecting");
    try {
      const handle = await connectRealtimeMeetup({
        onFields: (f) => {
          if (!unmountedRef.current) mergeFields(f);
        },
        onUserText: (t) => {
          if (unmountedRef.current) return;
          setTranscript(t);
          setLiveText(t);
          setStarted(true);
        },
        onAgentText: (t) => {
          if (unmountedRef.current) return;
          setAgentLine(t);
          setStarted(true);
        },
        onAgentSpeaking: (sp) => {
          if (unmountedRef.current) return;
          setAgentSpeaking(sp);
          if (sp) setAgentStream(rtRef.current?.getAgentStream() ?? null);
        },
        onStatus: (s) => {
          if (!unmountedRef.current) setRtStatus(s);
        },
        onDebug: pushDebug,
      });
      if (unmountedRef.current) {
        handle.disconnect();
        return false;
      }
      rtRef.current = handle;
      setMicStream(handle.micStream);
      setAgentStream(handle.getAgentStream());
      setMode("realtime");
      return true;
    } catch (e) {
      console.warn("realtime connect failed:", e);
      pushDebug("실시간 연결 실패");
      if (!unmountedRef.current) {
        setMode("classic");
        setRtStatus("error");
        // 여기서 자동으로 녹음을 시작하지 않는다 — 사파리류는 제스처 밖
        // 마이크 요청을 자동 거부하므로, 버튼 탭(제스처) 안에서 재시도한다.
        setNeedTap(true);
      }
      return false;
    } finally {
      connectingRef.current = false;
    }
  };

  // =====================================================================
  // 클래식(녹음+Whisper+TTS) 폴백 — 실시간 연결이 안 될 때만
  // =====================================================================
  const cancelClassic = () => {
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
    setStarted(true);
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

  const classicListen = async (kind: "initial" | "answer", token: number) => {
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
    if (noVad) {
      setNeedTap(true);
      return;
    }
    emptyCountRef.current++;
    if (emptyCountRef.current < 2) {
      await classicListen(kind, token);
    } else {
      setNeedTap(true);
    }
  };

  const classicRunTurn = async (question: string) => {
    const token = ++turnTokenRef.current;
    emptyCountRef.current = 0;
    const played = await playTts(question);
    if (unmountedRef.current || token !== turnTokenRef.current) return;
    if (micDeniedRef.current) {
      setNeedTap(true);
      return;
    }
    if (!played) await sleep(500);
    await classicListen("answer", token);
  };

  useEffect(() => {
    if (mode !== "classic") return;
    if (parseNonce === 0) return;
    if (!activeQuestion) return;
    classicRunTurn(activeQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parseNonce]);

  // =====================================================================
  // 진입/이탈
  // =====================================================================
  useEffect(() => {
    unmountedRef.current = false;
    connectRealtime();
    return () => {
      unmountedRef.current = true;
      turnTokenRef.current++;
      rtRef.current?.disconnect();
      rtRef.current = null;
      handleRef.current?.cancel();
      stopTts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================================
  // 사용자 조작
  // =====================================================================
  const handleMicTap = async () => {
    unlockAudio(); // 제스처로 오디오 해금(질문 낭독 보장)
    unlockAgentAudio(); // 도우미 목소리(WebRTC 스트림) 재생 해금/재시도
    if (mode === "realtime") {
      if (rtStatus === "closed" || rtStatus === "error") {
        connectRealtime(); // 재연결
      }
      return; // 연결 중/연결됨: 서버가 알아서 듣는다
    }
    // classic
    if (listening) {
      handleRef.current?.finish();
      return;
    }
    if (transcribing || isParsing || connectingRef.current) return;
    micDeniedRef.current = false;
    stopTts();
    // 같은 탭 제스처 안에서: 실시간을 먼저 재시도(3회까지), 안 되면 곧장 녹음으로
    if (rtAttemptsRef.current < 3) {
      const ok = await connectRealtime();
      if (ok || unmountedRef.current) return;
    }
    const token = ++turnTokenRef.current;
    classicListen(started && activeQuestion ? "answer" : "initial", token);
  };

  const handleAnswerText = (text: string) => {
    if (!text.trim()) return;
    unlockAudio();
    setTextInput("");
    if (mode === "realtime") {
      rtRef.current?.sendText(text.trim());
      return;
    }
    cancelClassic();
    parseTranscript(text.trim());
  };

  const handleReplayTts = () => {
    unlockAudio();
    const line = mode === "realtime" ? agentLine : activeQuestion;
    if (line) playTts(line);
  };

  const handleRestart = () => {
    unlockAudio();
    setTranscript("");
    setLiveText("");
    setAgentLine("");
    setTime(null);
    setLocation(null);
    setActivity(null);
    setMissingField(null);
    setFollowUpQuestion(null);
    setParseNonce(0);
    setStarted(false);
    micDeniedRef.current = false;
    emptyCountRef.current = 0;
    if (mode === "realtime") {
      rtRef.current?.disconnect();
      rtRef.current = null;
      connectRealtime();
      return;
    }
    cancelClassic();
    const token = ++turnTokenRef.current;
    classicListen("initial", token);
  };

  const isFormComplete = Boolean(time && location && activity);

  const handlePost = () => {
    if (!isFormComplete) return;
    rtRef.current?.disconnect();
    rtRef.current = null;
    cancelClassic();
    const draftData = {
      transcript: transcript || `${time}에 ${location}에서 ${activity}`,
      time: time!,
      location: location!,
      activity: activity!,
    };
    sessionStorage.setItem("dorandoran_meetup_draft", JSON.stringify(draftData));
    router.push("/create/duration");
  };

  // =====================================================================
  // 표시 상태
  // =====================================================================
  const rtLive = mode === "realtime" && rtStatus === "connected";
  const showPulse = rtLive || listening;

  // 오디오 비주얼라이저(LiveKit shadcn 이식) — 실제 소리 밴드
  const userBands = useAudioBands(micStream, 6);
  const agentBands = useAudioBands(agentSpeaking ? agentStream : null, 6);
  const vizState: VisualizerState =
    mode === "realtime"
      ? rtStatus === "connecting"
        ? "connecting"
        : rtStatus === "connected"
        ? agentSpeaking
          ? "speaking"
          : "listening"
        : "idle"
      : listening
      ? "listening"
      : transcribing || isParsing
      ? "connecting"
      : "idle";
  const vizBands = agentSpeaking ? agentBands : userBands;

  const statusText =
    mode === "realtime"
      ? rtStatus === "connecting"
        ? "연결하고 있어요..."
        : rtStatus === "connected"
        ? agentSpeaking
          ? "도우미가 말하고 있어요"
          : "듣고 있어요 — 편하게 말씀하세요"
        : "버튼을 누르면 다시 연결돼요"
      : listening
      ? "듣고 있어요"
      : transcribing
      ? "말씀을 글로 옮기고 있어요..."
      : isParsing
      ? "말씀을 확인하고 있어요..."
      : needTap
      ? micDeniedRef.current
        ? "마이크 권한을 허용하신 뒤 버튼을 눌러주세요"
        : "버튼을 누르고 말씀해주세요"
      : started
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
              showPulse
                ? "border-red-500 bg-red-50"
                : transcribing || isParsing || rtStatus === "connecting"
                ? "border-gray-300 bg-gray-100 opacity-70"
                : "border-black bg-white hover:bg-gray-50 active:scale-95 shadow-sm"
            }`}
          >
            {showPulse || vizState === "connecting" ? (
              <div className="h-[54px] w-[70px]">
                <BarVisualizer state={vizState} bands={vizBands} />
              </div>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-gray-300 border border-gray-400" />
                <span className="text-xs font-bold text-black">누르고 말하기</span>
              </>
            )}
          </button>
          <span className="text-sm font-bold text-black">{statusText}</span>
          {/* ponytail: 진단 표시줄 — 원인 파악되면 제거 */}
          {debugLines.length > 0 && (
            <span className="text-[10px] text-gray-400 leading-tight">
              {debugLines.join(" · ")}
            </span>
          )}
        </div>

        {/* 도우미 말풍선 (실시간 모드) */}
        {mode === "realtime" && agentLine && (
          <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2 text-left">
            <p className="text-sm font-bold text-black">{agentLine}</p>
            <button
              type="button"
              onClick={handleReplayTts}
              className="text-xs text-gray-700 bg-white border border-gray-300 px-2.5 py-1 rounded shrink-0 cursor-pointer"
            >
              다시 듣기
            </button>
          </div>
        )}

        {/* 받아적기 박스 */}
        <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-2 text-left">
          <span className="text-xs text-gray-500 font-medium">말씀하신 대로 적고 있어요</span>
          <p className="text-sm font-bold text-black">
            {liveText || transcript || "세 시에 오일장 구경 같이"}
          </p>
          <p className="text-sm text-gray-400">…</p>
        </div>

        {/* 이렇게 들었어요 — 필드 */}
        {started && (
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
                        if (!val && mode === "classic") parseTranscript("", { time: null });
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
              {mode === "classic" && !time && missingField === "time" && (
                <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2">
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
                        if (!val && mode === "classic") parseTranscript("", { location: null });
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
              {mode === "classic" && !location && missingField === "location" && (
                <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2">
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
                        if (!val && mode === "classic") parseTranscript("", { activity: null });
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
              {mode === "classic" && !activity && missingField === "activity" && (
                <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2">
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
              )}
            </div>

            {/* 글자 입력 폴백 */}
            {!isFormComplete && (
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
                  onFocus={() => {
                    if (mode === "classic") cancelClassic();
                  }}
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
