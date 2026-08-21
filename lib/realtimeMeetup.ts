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
  onStatus: (s: "connecting" | "connected" | "closed" | "error") => void;
  onDebug?: (msg: string) => void;
}

export interface RealtimeMeetupHandle {
  sendText: (text: string) => void;
  disconnect: () => void;
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

export async function connectRealtimeMeetup(
  cb: RealtimeMeetupCallbacks
): Promise<RealtimeMeetupHandle> {
  const debug = (m: string) => cb.onDebug?.(m);
  cb.onStatus("connecting");
  debug("실시간 연결 준비");

  // 1) 단수명 키 발급
  const keyRes = await fetch("/api/realtime/session", { method: "POST" });
  if (!keyRes.ok) throw new Error("session mint failed: " + keyRes.status);
  const { value: ephemeralKey } = await keyRes.json();
  if (!ephemeralKey) throw new Error("no ephemeral key");
  debug("연결 키 발급됨");

  // 2) SDK는 클라이언트에서만 로드
  const { RealtimeAgent, RealtimeSession, tool } = await import("@openai/agents/realtime");
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

  const session = new RealtimeSession(agent, {
    model: "gpt-realtime",
    config: {
      audio: {
        input: { transcription: { model: "gpt-4o-mini-transcribe", language: "ko" } },
        output: { voice: "alloy" },
      },
    },
  });

  // 대화 텍스트 추출 (자막용)
  session.on("history_updated", (history: any[]) => {
    try {
      let lastUser = "";
      let lastAgent = "";
      for (const item of history) {
        if (item?.type !== "message") continue;
        const texts: string[] = [];
        for (const c of item.content ?? []) {
          const t = c?.transcript ?? c?.text ?? "";
          if (t) texts.push(t);
        }
        const joined = texts.join(" ").trim();
        if (!joined) continue;
        if (item.role === "user") lastUser = joined;
        else if (item.role === "assistant") lastAgent = joined;
      }
      if (lastUser) cb.onUserText(lastUser);
      if (lastAgent) cb.onAgentText(lastAgent);
    } catch {}
  });

  session.on("error", (e: any) => {
    debug("실시간 오류: " + (e?.error?.message ?? e?.message ?? String(e)));
  });

  const transport = session.transport as any;
  transport?.on?.("connection_change", (status: string) => {
    debug("연결 상태: " + status);
    if (status === "disconnected") cb.onStatus("closed");
  });

  // 3) WebRTC 연결 (마이크 권한 요청 포함)
  await session.connect({ apiKey: ephemeralKey });
  cb.onStatus("connected");
  debug("실시간 연결됨 — 말씀하세요");

  // 에이전트가 먼저 인사하도록 응답 생성 트리거
  try {
    transport?.sendEvent?.({ type: "response.create" });
  } catch {}

  return {
    sendText: (text: string) => {
      try {
        session.sendMessage(text);
      } catch (e) {
        debug("텍스트 전송 실패");
      }
    },
    disconnect: () => {
      try {
        session.close();
      } catch {}
      cb.onStatus("closed");
    },
  };
}
