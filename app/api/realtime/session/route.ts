import { NextResponse } from "next/server";

// OpenAI Realtime용 단수명 클라이언트 시크릿 발급 (openai-realtime-console 패턴).
// 브라우저는 이 값으로만 WebRTC 연결하고, 본 API 키는 서버 밖으로 안 나간다.
export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
    }

    const res = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-realtime",
          audio: {
            input: {
              transcription: { model: "gpt-4o-mini-transcribe", language: "ko" },
              // audio.input을 명시하면 생성 시 VAD가 꺼진 채 만들어질 수 있어
              // 서버 VAD를 반드시 명시한다. 어르신은 한 문장 안에서도 쉬었다 말하므로
              // 침묵 1.6초 — lib/realtimeMeetup.ts 의 session.update 값과 맞춘다.
              turn_detection: {
                type: "server_vad",
                silence_duration_ms: 1600,
                create_response: true,
              },
            },
            output: { voice: "alloy" },
          },
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("client_secrets error:", res.status, errText);
      return NextResponse.json(
        { error: "Failed to create realtime session", details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    // GA 응답: { value: "ek_...", expires_at, session: {...} }
    return NextResponse.json({ value: data.value ?? data.client_secret?.value ?? null });
  } catch (error: any) {
    console.error("Error in /api/realtime/session:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
