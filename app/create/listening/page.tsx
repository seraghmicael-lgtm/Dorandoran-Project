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
import {
  FIELD_QUESTIONS,
  OPENING_LINE,
  applyParse,
  firstMissing,
  firstMissingQuestion as dialogFirstMissing,
} from "@/lib/meetupDialog";
import { saveDraft } from "@/lib/draft";
import BarVisualizer, { VisualizerState } from "@/components/ui/bar-visualizer";
import GoogleMap from "@/components/GoogleMap";
import { findNearbyPlace, getCurrentOrigin, PlaceHit } from "@/lib/places";

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

  // ---- 장소 → 좌표 (반경 5km) ----
  // undefined = 아직 위치를 못 물어봄 · null = 위치를 못 씀 · 값 = 지금 계신 곳
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null | undefined>(undefined);
  // 어떤 장소 이름으로 찾은 결과인지 함께 들고 있는다 — 렌더에서 "지금 장소와 맞는지"를 바로 판단한다
  const [placeResult, setPlaceResult] = useState<{
    query: string;
    place: PlaceHit | null;
    reason?: string;
  } | null>(null);

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
    ? followUpQuestion || FIELD_QUESTIONS[missingField]
    : null;

  // =====================================================================
  // 실시간(OpenAI Realtime) 모드
  // =====================================================================
  const mergeFields = (f: MeetupFields) => {
    // null = 아직 모름(기존 유지) · "" = 의도적 비우기 · 값 = 갱신(정정 포함)
    const one = (v: string | null | undefined, prev: string | null) =>
      v === "" ? null : v != null ? v : prev;
    const cur = fieldsRef.current;
    const next = {
      time: one(f.time, cur.t),
      location: one(f.location, cur.l),
      activity: one(f.activity, cur.a),
    };
    commitFields(next);
    setStarted(true);
    return next; // 도구 결과로 되돌려 에이전트가 화면 상태를 알게 한다
  };

  const rtAttemptsRef = useRef(0);
  const connectingRef = useRef(false);

  // 로컬 보조 인식(실시간 세션 병행): 서버 전사 이벤트가 브라우저에 안 와도
  // 말씀 한 번마다 녹음→Whisper→파싱으로 반드시 필드를 채운다.
  const localLoopRef = useRef(0); // 0=꺼짐, n=활성 루프 토큰
  const localHandleRef = useRef<ListenHandle | null>(null);
  const agentSpeakingRef = useRef(false);
  const lastAgentActivityRef = useRef(0);
  const fieldsRef = useRef<{ t: string | null; l: string | null; a: string | null }>({
    t: null,
    l: null,
    a: null,
  });
  /** 세 필드를 한 번에 확정한다. 필드를 바꾸는 곳은 전부 여기를 지난다.
   *  ref 를 동기로 갱신해서 바로 다음 줄의 "다음 질문" 판단이 한 박자 늦은 값을 보지 않게 한다. */
  const commitFields = (f: { time: string | null; location: string | null; activity: string | null }) => {
    fieldsRef.current = { t: f.time, l: f.location, a: f.activity };
    setTime(f.time);
    setLocation(f.location);
    setActivity(f.activity);
  };

  /** 한 필드만 고칠 때(고치기 버튼) — 나머지는 현재 값 그대로 */
  const commitOne = (key: "time" | "location" | "activity", val: string | null) => {
    const c = fieldsRef.current;
    const next = { time: c.t, location: c.l, activity: c.a, [key]: val };
    commitFields(next);
    syncAgent(next);
  };

  /**
   * 에이전트가 모르는 화면 변경(보조 인식이 채웠거나 사용자가 손으로 고쳤거나)을 알려준다.
   * 안 알려주면 에이전트는 화면에 이미 채워진 항목을 계속 다시 묻는다.
   * (에이전트가 스스로 기록한 값은 이미 알고 있으므로 여기를 지나지 않는다.)
   */
  const syncAgent = (f: { time: string | null; location: string | null; activity: string | null }) => {
    // 상태값(mode/rtStatus) 대신 살아있는 핸들로 판단한다 — 보조 루프가 붙든 오래된
    // 렌더 클로저에서 호출돼도 스테일한 상태 때문에 조용히 건너뛰지 않도록.
    if (!rtRef.current) return;
    const filled = [
      f.time && `시간은 ${f.time}`,
      f.location && `장소는 ${f.location}`,
      f.activity && `활동은 ${f.activity}`,
    ]
      .filter(Boolean)
      .join(", ");
    if (!filled) return;
    const miss = firstMissing(f);
    rtRef.current.sendContext(
      `[화면에 기록된 내용] ${filled}. ` +
        (miss
          ? `이건 다시 묻지 말고 "${FIELD_QUESTIONS[miss]}"만 물어보세요.`
          : `세 가지가 모두 채워졌어요. 더 묻지 말고 마무리 안내만 해주세요.`)
    );
  };

  const stopLocalLoop = () => {
    localLoopRef.current = 0;
    localHandleRef.current?.cancel();
    localHandleRef.current = null;
  };

  // 시간 → 장소 → 할일 순서(단일 소스 위임). 앞 필드가 차기 전에는 다음 질문으로 안 넘어간다.
  const firstMissingQuestion = (): string | null => {
    const f = fieldsRef.current;
    return dialogFirstMissing({ time: f.t, location: f.l, activity: f.a });
  };

  const ttsSpeakingRef = useRef(false);
  const introSpokenRef = useRef(false); // "저는 모임 만들기를 도와줄 거예요" 1회만

  /** 첫 발화엔 소개 멘트를 붙여 가이드를 시작한다 */
  const speakGuided = async (q: string) => {
    const text = introSpokenRef.current ? q : `${OPENING_LINE.split(". ")[0]}. ${q}`;
    introSpokenRef.current = true;
    setAgentLine(text);
    setStarted(true);
    ttsSpeakingRef.current = true;
    await playTts(text);
    ttsSpeakingRef.current = false;
  };

  const runLocalLoop = async () => {
    // iOS는 두 번째 마이크 캡처가 WebRTC 오디오 세션과 충돌할 수 있어 보조 루프를 끈다
    if (/iP(hone|ad|od)/.test(navigator.userAgent)) return;
    const token = ++localLoopRef.current;
    let emptyRounds = 0;
    while (localLoopRef.current === token && !unmountedRef.current) {
      if (agentSpeakingRef.current || ttsSpeakingRef.current) {
        await sleep(300); // 도우미/질문 음성이 나가는 동안은 귀를 닫는다(역유입 방지)
        continue;
      }
      const handle = listenOnce({
        engine: "recorder",
        // 어르신은 한 문장 안에서도 쉬었다 말한다 — 짧게 잡으면 말 중간에 끊겨
        // 앞토막만 위스퍼로 넘어간다. 넉넉히 잡고 요약은 파서가 한다.
        silenceMs: 1800,
        noSpeechMs: 8000,
        maxMs: 30000,
        externalStream: rtRef.current?.micStream, // 세션과 같은 마이크 재사용(여닫는 잡음 제거)
        onDebug: () => {},
      });
      localHandleRef.current = handle;
      const { transcript: heard, micDenied } = await handle.promise;
      localHandleRef.current = null;
      if (localLoopRef.current !== token || unmountedRef.current) return;
      if (micDenied) {
        pushDebug("보조 인식: 마이크 불가");
        return;
      }
      if (heard) {
        emptyRounds = 0;
        setTranscript(heard);
        setLiveText(heard);
        setStarted(true);
        pushDebug("보조 인식: " + heard.slice(0, 24));
        await parseTranscript(heard, {
          time: fieldsRef.current.t,
          location: fieldsRef.current.l,
          activity: fieldsRef.current.a,
        });
      } else {
        emptyRounds++;
      }

      // 문답: 첫 빈 필드(시간→장소→할일)를 TTS로 묻고 다시 듣는다.
      const q = firstMissingQuestion();
      if (!q) break; // 세 필드 완성 — 루프 종료
      if (localLoopRef.current !== token || unmountedRef.current) return;
      // 도우미(실시간 에이전트)가 살아있으면 그쪽이 먼저 묻게 3초 양보한다 — 목소리 겹침 방지
      const roundEndAt = Date.now();
      let yielded = 0;
      while (yielded < 3000 && !agentSpeakingRef.current && lastAgentActivityRef.current < roundEndAt) {
        await sleep(300);
        yielded += 300;
        if (localLoopRef.current !== token || unmountedRef.current) return;
      }
      const agentTookOver = agentSpeakingRef.current || lastAgentActivityRef.current >= roundEndAt;
      if (!agentTookOver && emptyRounds <= 4) {
        await speakGuided(q);
      }
      if (emptyRounds > 4) {
        pushDebug("응답 대기 — 버튼을 눌러 이어가세요");
        setNeedTap(true);
        return;
      }
    }
  };

  const connectRealtime = async (): Promise<boolean> => {
    if (connectingRef.current) return false;
    connectingRef.current = true;
    rtAttemptsRef.current++;
    setRtStatus("connecting");
    try {
      const handle = await connectRealtimeMeetup({
        onFields: (f) => (unmountedRef.current ? undefined : mergeFields(f)),
        onUserText: (t) => {
          if (unmountedRef.current) return;
          setTranscript(t);
          setLiveText(t);
          setStarted(true);
        },
        onAgentText: (t) => {
          if (unmountedRef.current) return;
          introSpokenRef.current = true;
          lastAgentActivityRef.current = Date.now();
          setAgentLine(t);
          setStarted(true);
        },
        onAgentSpeaking: (sp) => {
          if (unmountedRef.current) return;
          agentSpeakingRef.current = sp;
          setAgentSpeaking(sp);
          if (sp) {
            introSpokenRef.current = true;
            lastAgentActivityRef.current = Date.now();
            setAgentStream(rtRef.current?.getAgentStream() ?? null);
            // 도우미가 말하는 동안 잡힌 보조 녹음은 버린다(도우미 목소리 역전사 방지)
            localHandleRef.current?.cancel();
          }
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
      runLocalLoop(); // 보조 인식 병행 시작
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

  const applyParsedData = (
    data: any,
    snapshot: { time: string | null; location: string | null; activity: string | null }
  ) => {
    if (!data) return;
    // 응답을 통째로 덮어쓰지 않는다 — 요청이 오가는 사이 에이전트가 채운 값을 지우지 않도록
    // "이번 파싱이 실제로 바꾼 필드"만 반영한다(applyParse 주석 참조).
    const cur = fieldsRef.current;
    const merged = applyParse(snapshot, data, {
      time: cur.t,
      location: cur.l,
      activity: cur.a,
    });
    commitFields(merged);
    // 이번 파싱으로 화면이 실제로 바뀌었으면 에이전트에게도 알린다(중복 질문 방지)
    if (merged.time !== cur.t || merged.location !== cur.l || merged.activity !== cur.a) {
      syncAgent(merged);
    }
    // 남은 항목은 서버 응답이 아니라 병합 결과로 다시 계산한다(서버는 스냅샷 기준이라 어긋날 수 있다)
    const miss = firstMissing(merged);
    setMissingField(miss);
    setFollowUpQuestion(miss ? data.followUpQuestion ?? null : null);
    setParseNonce((n) => n + 1);
    setStarted(true);
  };

  const parseTranscript = async (
    inputTranscript: string,
    overrideValues?: { time?: string | null; location?: string | null; activity?: string | null }
  ) => {
    const snapshot = {
      time: (overrideValues?.time !== undefined ? overrideValues.time : time) ?? null,
      location: (overrideValues?.location !== undefined ? overrideValues.location : location) ?? null,
      activity: (overrideValues?.activity !== undefined ? overrideValues.activity : activity) ?? null,
    };
    setIsParsing(true);
    try {
      const res = await fetch("/api/parse-meetup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: inputTranscript, ...snapshot }),
      });
      if (!res.ok) return;
      const data = await res.json();
      applyParsedData(data, snapshot);
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
    const spoken = introSpokenRef.current
      ? question
      : `${OPENING_LINE.split(". ")[0]}. ${question}`;
    introSpokenRef.current = true;
    const played = await playTts(spoken);
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
    // 진입 즉시 소개+첫 질문을 TTS로 확정 재생 — 도우미(실시간) 음성에 의존하지 않는다
    (async () => {
      introSpokenRef.current = true;
      setAgentLine(OPENING_LINE);
      setStarted(true);
      ttsSpeakingRef.current = true;
      await playTts(OPENING_LINE);
      ttsSpeakingRef.current = false;
    })();
    connectRealtime();
    return () => {
      unmountedRef.current = true;
      turnTokenRef.current++;
      stopLocalLoop();
      rtRef.current?.disconnect();
      rtRef.current = null;
      handleRef.current?.cancel();
      stopTts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 지금 계신 곳 — 진입 때 이미 허용받은 위치를 재사용한다
  useEffect(() => {
    getCurrentOrigin().then((o) => {
      if (!unmountedRef.current) setOrigin(o);
    });
  }, []);

  // 말한 장소를 반경 5km 안에서 찾아 핀으로 보여준다.
  // 어르신이 "여기가 맞나요?"를 눈으로 확인하고 틀리면 고치기로 바로잡을 수 있게 하는 게 목적.
  useEffect(() => {
    if (!location || !origin) return;
    let cancelled = false;
    findNearbyPlace(location, origin).then((r) => {
      if (cancelled || unmountedRef.current) return;
      setPlaceResult({ query: location, place: r.place, reason: r.reason });
    });
    return () => {
      cancelled = true;
    };
  }, [location, origin]);

  // 검색 상태는 상태변수로 따로 두지 않고 결과의 query 와 지금 장소를 비교해 유도한다
  const placeFresh = placeResult?.query === location;
  const place = placeFresh ? placeResult.place : null;
  const searchingPlace = Boolean(location && origin && !placeFresh);
  const placeNotFound = Boolean(placeFresh && !placeResult.place && placeResult.reason === "out-of-range");
  const noOrigin = origin === null;

  // =====================================================================
  // 사용자 조작
  // =====================================================================
  const handleMicTap = async () => {
    unlockAudio(); // 제스처로 오디오 해금(질문 낭독 보장)
    unlockAgentAudio(); // 도우미 목소리(WebRTC 스트림) 재생 해금/재시도
    if (mode === "realtime") {
      if (rtStatus === "closed" || rtStatus === "error") {
        connectRealtime(); // 재연결
      } else if (needTap) {
        // 보조 문답 루프가 응답 대기로 멈춘 상태 — 제스처 안에서 재개
        setNeedTap(false);
        stopLocalLoop();
        runLocalLoop();
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
    commitFields({ time: null, location: null, activity: null });
    setMissingField(null);
    setFollowUpQuestion(null);
    setParseNonce(0);
    setStarted(false);
    micDeniedRef.current = false;
    emptyCountRef.current = 0;
    if (mode === "realtime") {
      stopLocalLoop();
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
    stopLocalLoop();
    rtRef.current?.disconnect();
    rtRef.current = null;
    cancelClassic();
    const draftData = {
      transcript: transcript || `${time}에 ${location}에서 ${activity}`,
      time: time!,
      location: location!,
      activity: activity!,
      // 찾은 좌표를 함께 넘긴다 — 상세 화면의 지도·길찾기가 이걸 쓴다
      ...(place ? { lat: place.lat, lng: place.lng } : {}),
    };
    saveDraft(draftData);
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
        ? needTap
          ? "버튼을 누르고 말씀해주세요"
          : agentSpeaking
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
      <HeaderBack title="동행 만들기" backHref="/create/activity" />

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
            {liveText || transcript || "말씀하시면 여기에 글로 나타나요"}
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
                        commitOne("time", val);
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
                    {followUpQuestion || FIELD_QUESTIONS.time}
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
                        commitOne("location", val);
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
              {/* 말한 장소를 반경 5km 안에서 찾아 핀으로 — 눈으로 확인하고 틀리면 고치기 */}
              {searchingPlace && (
                <p className="text-xs text-gray-500">그 근처를 찾고 있어요...</p>
              )}
              {place && (
                <div className="flex flex-col gap-1.5">
                  <GoogleMap lat={place.lat} lng={place.lng} height="h-[140px]" />
                  <p className="text-xs text-gray-600">
                    <span className="font-bold text-black">{place.name}</span>
                    {place.address ? ` · ${place.address}` : ""}
                    <span className="text-gray-400">
                      {" · "}
                      {place.distanceM < 1000
                        ? `${place.distanceM}m`
                        : `${(place.distanceM / 1000).toFixed(1)}km`}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">여기가 맞나요? 아니면 고치기를 눌러주세요.</p>
                </div>
              )}
              {placeNotFound && (
                <p className="text-xs text-gray-500">
                  걸어서 갈 만한 곳(5km 안)에서 못 찾았어요. 그대로 올려도 괜찮아요.
                </p>
              )}
              {location && noOrigin && (
                <p className="text-xs text-gray-500">
                  위치를 몰라서 지도는 못 보여드려요. 그대로 올려도 괜찮아요.
                </p>
              )}

              {mode === "classic" && !location && missingField === "location" && (
                <div className="mt-1 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-black">
                    {followUpQuestion || FIELD_QUESTIONS.location}
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
                        commitOne("activity", val);
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
                    {followUpQuestion || FIELD_QUESTIONS.activity}
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
