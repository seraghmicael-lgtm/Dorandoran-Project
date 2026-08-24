// OpenAI Realtime(공식 @openai/agents SDK, openai-realtime-agents 패턴) 기반
// 동행 만들기 음성 에이전트. WebRTC라 Arc 등 크로미움 파생에서도 동작한다.
// 에이전트가 직접 음성으로 묻고(서버 VAD로 말 끝 감지), 파악한 필드를
// set_meetup_fields 도구 호출로 화면에 밀어넣는다.

import { FIELD_QUESTIONS, OPENING_LINE } from "./meetupDialog";

export interface MeetupFields {
  time?: string | null;
  location?: string | null;
  activity?: string | null;
}

export interface RealtimeMeetupCallbacks {
  /** 병합 후의 화면 값을 돌려주면 도구 결과로 에이전트에게 그대로 알려준다 */
  onFields: (f: MeetupFields) => MeetupFields | void;
  onUserText: (text: string) => void;
  onAgentText: (text: string) => void;
  onAgentSpeaking?: (speaking: boolean) => void;
  onStatus: (s: "connecting" | "connected" | "closed" | "error") => void;
  onDebug?: (msg: string) => void;
}

export interface RealtimeMeetupHandle {
  sendText: (text: string) => void;
  /** 화면 상태를 대화 기록에만 넣는다 — 응답을 트리거하지 않아 말이 겹치지 않는다 */
  sendContext: (text: string) => void;
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
  반드시 "오전"/"오후" + 아라비아 숫자로 적어라: "네 시" → "오후 4시", "여섯시 반" → "오후 6시 30분".
  한글 숫자나 오전/오후 없는 값으로 기록하면 뒤 화면의 시간 계산이 실패한다.
- 길게 말씀하셔도 되받아 적지 마라. 어르신이 여러 문장으로 길게 말하면 **핵심만 짧게 요약해서** 기록한다.
  location과 activity는 화면에 들어갈 짧은 말(대략 12자 이내)로 줄여라. 조사·수식어·사연은 버리고 알맹이만 남긴다.
  예: "요즘 무릎이 안 좋아서 멀리는 못 가고, 그냥 동네 한 바퀴 천천히 걸으면서 이야기나 나눴으면 좋겠어" → activity는 "동네 산책"
  예: "우리 아파트 정문 앞에 은행나무 있는 데 있잖아, 거기 벤치 쪽에서" → location은 "아파트 정문 앞"
  기록한 뒤에는 "○○, 이렇게 적었어요"처럼 요약한 말을 한 번 확인해준다. 어르신이 아니라고 하면 다시 고쳐 기록한다.
- 말씀이 끝나지 않은 것 같으면(문장이 중간에 끊긴 느낌) 되묻지 말고 조용히 더 기다려라.
- 빠진 항목은 한 번에 하나씩만, 반드시 시간 → 장소 → 활동 순서로 물어라. 앞 항목이 채워지기 전에는 다음 항목을 묻지 마라. 질문 예: "${FIELD_QUESTIONS.time}", "${FIELD_QUESTIONS.location}", "${FIELD_QUESTIONS.activity}"
- 어르신이 순서와 다른 정보를 먼저 말하면 그것도 기록은 하되, 다음 질문은 다시 순서상 첫 번째 빈 항목으로 돌아간다.
- 변경 요청 인식: 이미 채워진 값도 어르신이 바꾸자고 하면 즉시 set_meetup_fields로 갱신하고 "네, ○○로 바꿨어요"라고 짧게 확인해라. 다음 표현들이 모두 변경 요청이다 —
  "4시로 바꿔/바꿔줘/변경해줘", "3시 말고 4시", "오일장이 아니라 공원", "그거 말고 산책",
  "4시로 하자/해요/할래요", "공원에서 보자", "아니(요) 4시", "잘못 말했어 5시야",
  "한 시간 미뤄/늦춰"(기존 시각 +1시간 계산해서 기록), "30분 당겨"(-30분), "조금 이따로"(+30분쯤).
  필드 이름을 말하지 않아도 값의 종류(시각/장소/활동)로 어느 필드인지 판단하라.
  "다시 정할래", "아직 모르겠어"라고 하면 그 필드를 빈 문자열 ""로 보내 비우고(모르는 필드의 null과 구분) 그 항목을 다시 물어라.
- "[화면에 기록된 내용] …" 으로 시작하는 메시지는 어르신 말이 아니라 화면의 현재 상태다. 그 내용을 이미 확정된 사실로 받아들이고, 거기 적힌 항목은 절대 다시 묻지 마라. 남았다고 표시된 항목만 묻고, 남은 게 없다면 마무리 안내만 해라.
- 세 가지가 모두 기록되면 "다 됐어요. 화면 아래 올리기 버튼을 눌러주세요."라고 말하고 더 묻지 않는다.
- 모임 만들기와 무관한 잡담은 정중히 짧게 끊고 목표로 돌아온다.

대화 시작: 소개 인사("${OPENING_LINE}")는 화면이 이미 읽어준다. 너는 먼저 인사하지 말고, 어르신의 첫 응답부터 이어받아 위 순서대로 진행하라.`;

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
    // 이 도구는 절대 실패하지 않는다. 실패를 돌려주면 에이전트가 재시도를 반복하다
    // "계속 문제가 있어서 죄송합니다"류의 사과 루프에 빠진다.
    execute: async (args: MeetupFields) => {
      try {
        const after = cb.onFields(args) ?? args;
        debug("필드 기록: " + JSON.stringify(after));
        // 화면의 최종 상태를 그대로 돌려준다 — 에이전트가 이미 채워진 항목을 다시 묻지 않도록
        return `기록했습니다. 지금 화면: 시간=${after.time ?? "없음"}, 장소=${
          after.location ?? "없음"
        }, 활동=${after.activity ?? "없음"}`;
      } catch (e) {
        debug("필드 기록 실패(무시): " + String(e).slice(0, 40));
        return "기록했습니다";
      }
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
          // 연결 직후 SDK가 보내는 session.update에서도 VAD가 확실히 켜져 있도록 명시.
          // 어르신은 한 문장 안에서도 쉬었다 말한다 — 900ms면 말 중간에 턴이 끊겨
          // 문장 앞토막만 전달된다. 1.6초로 늘려 긴 말씀을 통째로 받는다.
          turnDetection: { type: "server_vad", silence_duration_ms: 1600 },
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

  // WebRTC 모드에선 audio_start/audio_stopped(오디오 델타 이벤트)가 오지 않는다 —
  // 응답 생성 이벤트(agent_start/agent_end)는 데이터채널로 확실히 오므로 그걸로
  // "도우미 발화 중" 신호를 만든다. 재생 꼬리를 감안해 종료 후 1초 여유를 둔다.
  let speakTail: ReturnType<typeof setTimeout> | null = null;
  session.on("agent_start", () => {
    if (speakTail) clearTimeout(speakTail);
    cb.onAgentSpeaking?.(true);
    agentAudioEl?.play().catch(() => debug("도우미 소리 차단됨 — 버튼을 한 번 눌러주세요"));
  });
  session.on("agent_end", (_ctx: any, _agent: any, text: string) => {
    if (text && text.trim()) cb.onAgentText(text.trim());
    if (speakTail) clearTimeout(speakTail);
    speakTail = setTimeout(() => cb.onAgentSpeaking?.(false), 1000);
  });
  session.on("audio_start", () => cb.onAgentSpeaking?.(true));
  session.on("audio_stopped", () => {
    if (speakTail) clearTimeout(speakTail);
    speakTail = setTimeout(() => cb.onAgentSpeaking?.(false), 300);
  });
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

  // 인사는 화면(TTS)이 담당한다 — 여기서 응답을 트리거하면 목소리가 겹친다.

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
    sendContext: (text: string) => {
      try {
        // triggerResponse:false — 기록만 남기고 말은 시키지 않는다.
        // (기본값 true 로 넣으면 도우미가 말하는 중에 응답이 겹쳐 서버 오류가 난다)
        transport.sendMessage(text, {}, { triggerResponse: false });
      } catch {
        debug("상태 전달 실패");
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
