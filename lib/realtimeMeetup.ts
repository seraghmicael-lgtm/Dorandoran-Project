// OpenAI Realtime(공식 @openai/agents SDK, openai-realtime-agents 패턴) 기반
// 동행 만들기 음성 에이전트. WebRTC라 Arc 등 크로미움 파생에서도 동작한다.
// 에이전트가 직접 음성으로 묻고(서버 VAD로 말 끝 감지), 파악한 필드를
// set_meetup_fields 도구 호출로 화면에 밀어넣는다.

export interface MeetupFields {
  time?: string | null;
  location?: string | null;
  activity?: string | null;
}

export interface RealtimeMeetupCallbacks {
  onFields: (f: MeetupFields) => void;
  onUserText: (text: string) => void;
  onAgentText: (text: string) => void;
  onAgentSpeaking?: (speaking: boolean) => void;
  onStatus: (s: "connecting" | "connected" | "closed" | "error") => void;
  onDebug?: (msg: string) => void;
}

export interface RealtimeMeetupHandle {
  sendText: (text: string) => void;
  disconnect: () => void;
  /** 시각화용 — 사용자 마이크 스트림 */
  micStream: MediaStream;
  /** 시각화용 — 도우미 음성 스트림(연결 후 채워짐) */
  getAgentStream: () => MediaStream | null;
}

// 에이전트 목소리가 나올 오디오 엘리먼트 — 우리가 만들어서 제스처로 해금해둔다.
// (SDK 기본은 매 연결마다 새 엘리먼트를 만들어 autoplay하는데, 제스처 없이는
// 브라우저가 재생을 차단해 "연결됐는데 아무 소리도 안 나는" 상태가 된다.)
let agentAudioEl: HTMLAudioElement | null = null;
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";

export function unlockAgentAudio() {
  try {
    if (!agentAudioEl) {
      agentAudioEl = new Audio();
      agentAudioEl.autoplay = true;
    }
    if (!agentAudioEl.srcObject) {
      agentAudioEl.src = SILENT_WAV;
      const p = agentAudioEl.play();
      if (p) p.catch(() => {});
    } else {
      // 이미 세션 스트림이 붙어있으면 재생만 재시도
      agentAudioEl.play().catch(() => {});
    }
  } catch {}
}

const INSTRUCTIONS = `너는 '도란도란' 앱의 음성 도우미다. 어르신이 오늘 동네에서 열 작은 모임(동행)을 말로 만들도록 돕는다.
목표: 시간(time), 장소(location), 활동(activity) 세 가지를 파악한다.

규칙:
- 항상 한국어 존댓말로, 한 번에 한두 문장만, 천천히 또박또박 말한다.
- 어르신 말에서 필드가 파악되는 즉시 set_meetup_fields 도구를 호출해 기록한다. 파악된 필드만 보내고 모르는 필드는 null로 보낸다.
- time은 "오후 3시"처럼 시각만 기록한다. "오늘"/"내일" 같은 날짜 단어는 빼라.
- 빠진 항목은 한 번에 하나씩만 물어라. 예: "어디서 만나고 싶으세요?", "언제 만나고 싶으세요?", "무엇을 하고 싶으세요?"
- 세 가지가 모두 기록되면 "다 됐어요. 화면 아래 올리기 버튼을 눌러주세요."라고 말하고 더 묻지 않는다.
- 모임 만들기와 무관한 잡담은 정중히 짧게 끊고 목표로 돌아온다.

대화 시작: "안녕하세요. 무엇을 같이 하고 싶으세요?"라고 먼저 인사하며 물어라.`;

// 한 번에 한 세션만 — 이전 세션이 살아있으면 닫고 시작한다(인사 음성 겹침 방지)
let activeClose: (() => void) | null = null;

export async function connectRealtimeMeetup(
  cb: RealtimeMeetupCallbacks
): Promise<RealtimeMeetupHandle> {
  const debug = (m: string) => cb.onDebug?.(m);
  if (activeClose) {
    try {
      activeClose();
    } catch {}
    activeClose = null;
  }
  cb.onStatus("connecting");
  debug("실시간 연결 준비");

  // 1) 단수명 키 발급
  const keyRes = await fetch("/api/realtime/session", { method: "POST" });
  if (!keyRes.ok) throw new Error("session mint failed: " + keyRes.status);
  const { value: ephemeralKey } = await keyRes.json();
  if (!ephemeralKey) throw new Error("no ephemeral key");
  debug("연결 키 발급됨");

  // 2) SDK는 클라이언트에서만 로드
  const { RealtimeAgent, RealtimeSession, OpenAIRealtimeWebRTC, tool } = await import(
    "@openai/agents/realtime"
  );
  const { z } = await import("zod");

  const setMeetupFields = tool({
    name: "set_meetup_fields",
    description:
      "어르신 말에서 파악한 모임 정보를 화면에 기록한다. 파악된 필드만 값을 넣고 모르는 필드는 null.",
    parameters: z.object({
      time: z.string().nullable(),
      location: z.string().nullable(),
      activity: z.string().nullable(),
    }),
    execute: async (args: MeetupFields) => {
      cb.onFields(args);
      debug("필드 기록: " + JSON.stringify(args));
      return "기록했습니다";
    },
  });

  const agent = new RealtimeAgent({
    name: "도란도란 도우미",
    instructions: INSTRUCTIONS,
    tools: [setMeetupFields],
  });

  // 우리가 관리하는(해금 가능한) 오디오 엘리먼트를 SDK에 넘긴다
  if (!agentAudioEl) {
    agentAudioEl = new Audio();
    agentAudioEl.autoplay = true;
  }

  // 마이크는 우리가 직접 연다 — 시각화(막대)와 SDK가 같은 스트림을 쓴다.
  // 에코캔슬 명시: 도우미 목소리가 마이크로 되돌아 들어가 이중 발화를 유발하는 것 방지.
  let micStream: MediaStream;
  try {
    const { preferredMicConstraints } = await import("./voice");
    const audio = await preferredMicConstraints({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    });
    micStream = await navigator.mediaDevices.getUserMedia({ audio });
  } catch (err) {
    const { describeMicFailure } = await import("./voice");
    debug("마이크 열기 실패: " + (await describeMicFailure(err)));
    throw err;
  }
  debug("입력장치: " + (micStream.getAudioTracks()[0]?.label || "?").slice(0, 28));

  const stopMic = () => {
    try {
      micStream.getTracks().forEach((t) => t.stop());
    } catch {}
  };

  const transport = new OpenAIRealtimeWebRTC({
    audioElement: agentAudioEl,
    mediaStream: micStream,
  });

  const session = new RealtimeSession(agent, {
    transport,
    model: "gpt-realtime",
    config: {
      audio: {
        input: {
          transcription: { model: "gpt-4o-mini-transcribe", language: "ko" },
          // 연결 직후 SDK가 보내는 session.update에서도 VAD가 확실히 켜져 있도록 명시
          turnDetection: { type: "server_vad", silence_duration_ms: 900 },
        },
        output: { voice: "alloy" },
      },
    },
  });

  // ---- 자막/진단: 공식 이벤트 직결 ----
  let userPartial = "";
  session.on("transport_event", (event: any) => {
    switch (event?.type) {
      case "input_audio_buffer.speech_started":
        debug("서버: 음성 감지됨");
        userPartial = "";
        break;
      case "conversation.item.input_audio_transcription.delta":
        if (typeof event.delta === "string") {
          userPartial += event.delta;
          if (userPartial.trim()) cb.onUserText(userPartial.trim());
        }
        break;
      case "conversation.item.input_audio_transcription.completed":
        if (typeof event.transcript === "string" && event.transcript.trim()) {
          cb.onUserText(event.transcript.trim());
          debug("내 말 인식: " + event.transcript.trim().slice(0, 20));
        }
        userPartial = "";
        break;
      case "error": {
        const msg = event?.error?.message ?? JSON.stringify(event?.error ?? {});
        debug("서버 오류: " + String(msg).slice(0, 60));
        break;
      }
    }
  });

  session.on("agent_end", (_ctx: any, _agent: any, text: string) => {
    if (text && text.trim()) cb.onAgentText(text.trim());
  });
  session.on("audio_start", () => {
    cb.onAgentSpeaking?.(true);
    // 스트림이 붙은 뒤 재생이 차단돼 있으면 한 번 더 시도
    agentAudioEl?.play().catch(() => debug("도우미 소리 차단됨 — 버튼을 한 번 눌러주세요"));
  });
  session.on("audio_stopped", () => cb.onAgentSpeaking?.(false));
  session.on("error", (e: any) => {
    debug("실시간 오류: " + (e?.error?.message ?? e?.message ?? String(e)).slice(0, 60));
  });
  (transport as any).on?.("connection_change", (status: string) => {
    debug("연결 상태: " + status);
    if (status === "disconnected") cb.onStatus("closed");
  });

  // 3) WebRTC 연결 — 실패하면 마이크를 반납하고 던진다(스트림 누수 방지)
  try {
    await session.connect({ apiKey: ephemeralKey });
  } catch (e) {
    stopMic();
    throw e;
  }
  cb.onStatus("connected");
  debug("실시간 연결됨 — 말씀하세요");

  activeClose = () => {
    try {
      session.close();
    } catch {}
    stopMic();
  };

  // 에이전트가 먼저 인사하도록 응답 생성 트리거 (연결당 1회)
  try {
    (transport as any).sendEvent?.({ type: "response.create" });
  } catch {}

  // 상행(마이크→서버) 진단: outbound-rtp 바이트가 실제로 늘어나는지 확인
  {
    const track = micStream.getAudioTracks()[0];
    debug(`마이크 트랙: ${track ? track.readyState + (track.muted ? "/muted" : "") : "없음"}`);
    const readSent = async (): Promise<number> => {
      try {
        const pc = (transport as any).connectionState?.peerConnection as
          | RTCPeerConnection
          | undefined;
        if (!pc) return -1;
        const stats = await pc.getStats();
        let sent = 0;
        stats.forEach((r: any) => {
          if (r.type === "outbound-rtp" && (r.kind === "audio" || r.mediaType === "audio")) {
            sent += r.bytesSent ?? 0;
          }
        });
        return sent;
      } catch {
        return -1;
      }
    };
    setTimeout(async () => {
      const a = await readSent();
      setTimeout(async () => {
        const b = await readSent();
        if (a < 0 || b < 0) debug("송신 통계 접근 불가");
        else if (b > a) debug(`마이크 송신 정상(${Math.round((b - a) / 1024)}KB/4초)`);
        else debug("마이크 송신 0 — 입력장치/권한 확인 필요");
      }, 4000);
    }, 2000);
  }

  return {
    sendText: (text: string) => {
      try {
        session.sendMessage(text);
      } catch {
        debug("텍스트 전송 실패");
      }
    },
    disconnect: () => {
      try {
        session.close();
      } catch {}
      // SDK는 외부에서 받은 mediaStream을 멈추지 않는다 — 우리가 정리한다
      stopMic();
      activeClose = null;
      cb.onStatus("closed");
    },
    micStream,
    getAgentStream: () => (agentAudioEl?.srcObject as MediaStream | null) ?? null,
  };
}
