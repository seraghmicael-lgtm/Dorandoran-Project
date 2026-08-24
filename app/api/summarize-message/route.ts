import { NextResponse } from "next/server";

// 06_하실 말씀 — 어르신이 길게 말한 한마디를 게시판에 그대로 걸 짧은 문장으로 줄인다.
// 상세 화면(동행 자세히 보기)의 제목 밑 인용 칸에 두 줄로 들어가므로 길이를 강하게 제한한다.
// 문장당 20자 이내 · 최대 2문장. 상세 화면 인용 칸이 한 줄에 한 문장씩 두 줄로 보인다
// (Figma: 오늘마실_동행자세히보기 1 — "천천히 둘러볼게요." / "무거운 건 안 사요.").
const MAX_CHARS_PER_SENTENCE = 20;
const MAX_SENTENCES = 2;

/** 모델이 길게 뱉어도 화면이 깨지지 않게 서버에서 한 번 더 자른다. 문장마다 줄바꿈. */
function clamp(raw: string): string {
  const text = raw.replace(/\s+/g, " ").replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").trim();
  if (!text) return "";
  const sentences = text.match(/[^.!?。]+[.!?。]?/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  return sentences
    .slice(0, MAX_SENTENCES)
    .map((s) => (s.length <= MAX_CHARS_PER_SENTENCE ? s : s.slice(0, MAX_CHARS_PER_SENTENCE).trim()))
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();
    if (typeof transcript !== "string" || !transcript.trim()) {
      return NextResponse.json({ message: "" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    // 키가 없으면 들은 말을 그대로 잘라서라도 돌려준다 — 빈 화면보다 낫다
    if (!apiKey) return NextResponse.json({ message: clamp(transcript) });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || "gpt-4o",
        messages: [
          {
            role: "system",
            content: `어르신이 동네 모임에 남길 "하실 말씀" 한마디를 게시판용으로 다듬는 역할이다.

규칙:
- 어르신이 길게 말해도 핵심만 남긴다. 사연·이유·인사말은 버린다.
- 최대 ${MAX_SENTENCES}문장, 한 문장은 ${MAX_CHARS_PER_SENTENCE}자 이내. 이 길이를 절대 넘기지 마라.
- 어르신이 직접 말하는 말투(존댓말 평서문)를 유지한다. 3인칭 설명으로 바꾸지 마라.
- 없는 내용을 지어내지 마라. 요약할 알맹이가 없으면 빈 문자열을 반환한다.
- 따옴표·이모지·머리말을 붙이지 마라.

예: "제가 무릎이 좀 안 좋아서 빨리는 못 걸어요. 천천히 둘러보기만 할 거고 무거운 건 살 생각이 없어요"
  → 천천히 둘러볼게요. 무거운 건 안 사요.
예: "귀가 좀 어두워서 크게 말씀해주시면 좋겠어요"
  → 조금 크게 말씀해주세요.

JSON 으로만 답하라: {"message": "..."}`,
          },
          { role: "user", content: transcript },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      console.error("summarize-message OpenAI error:", await res.text());
      return NextResponse.json({ message: clamp(transcript) });
    }
    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
    return NextResponse.json({ message: clamp(String(parsed.message ?? "")) });
  } catch (error) {
    console.error("Error in /api/summarize-message:", error);
    return NextResponse.json({ message: "" });
  }
}
