import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob | File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("OPENAI_API_KEY missing");
      return NextResponse.json(
        { error: "OPENAI_API_KEY missing" },
        { status: 500 }
      );
    }

    // 확장자는 실제 MIME 타입에서 유도한다 — iOS Safari는 audio/mp4로 녹음하는데
    // 무조건 .webm으로 이름 붙이면 Whisper가 포맷 불일치로 거부한다.
    const mime = file.type || "audio/webm";
    const ext = mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")
      ? "m4a"
      : mime.includes("mpeg") || mime.includes("mp3")
      ? "mp3"
      : mime.includes("ogg")
      ? "ogg"
      : mime.includes("wav")
      ? "wav"
      : "webm";

    const openAiFormData = new FormData();
    const audioFile = new File([file], `recording.${ext}`, { type: mime });

    openAiFormData.append("file", audioFile);
    openAiFormData.append("model", "whisper-1");
    openAiFormData.append("language", "ko");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openAiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI Transcribe API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Transcription failed", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      transcript: data.text || "",
    });
  } catch (error: any) {
    console.error("Error in /api/transcribe:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
