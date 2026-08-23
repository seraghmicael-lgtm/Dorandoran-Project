import { NextResponse } from "next/server";
import { FIELD_QUESTIONS, firstMissing } from "@/lib/meetupDialog";

type Fields = {
  time: string | null;
  location: string | null;
  activity: string | null;
};

/** 파싱 실패·불가 시 공통 응답 — 기존 필드 유지 + 첫 빈 필드 질문 */
function fallbackResult(f: Fields) {
  const missingField = firstMissing(f);
  return NextResponse.json({
    ...f,
    missingField,
    followUpQuestion: missingField ? FIELD_QUESTIONS[missingField] : null,
  });
}

export async function POST(request: Request) {
  let existing: Fields = { time: null, location: null, activity: null };
  try {
    const body = await request.json();
    const transcript = body?.transcript;
    existing = {
      time: typeof body?.time === "string" ? body.time : null,
      location: typeof body?.location === "string" ? body.location : null,
      activity: typeof body?.activity === "string" ? body.activity : null,
    };

    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return fallbackResult(existing);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("OPENAI_API_KEY missing, returning fallback values.");
      return fallbackResult(existing);
    }

    const model = process.env.LLM_MODEL || "gpt-4o";

    const systemPrompt = `You are a Korean natural language parser for a community meetup application for senior citizens.
Extract the time, location, and activity details from the user's transcript in Korean.

Existing known fields:
- time: ${existing.time ? `"${existing.time}"` : "null"}
- location: ${existing.location ? `"${existing.location}"` : "null"}
- activity: ${existing.activity ? `"${existing.activity}"` : "null"}

Instructions:
1. Parse the user's input transcript for time, location, or activity.
2. If an existing field is already provided and not null, keep it UNLESS the transcript explicitly provides a new value for that field.
2-1. CHANGE INTENT — elderly users rephrase changes in many ways. Treat ALL of these as
   "replace that field with the new value" (only the referenced field changes; keep the rest):
   - 직접 지시: "시간(을) 4시로 바꿔/바꿔줘/변경해줘", "장소는 도란공원으로 바꿔", "활동 바꿀래"
   - 대체 표현: "3시 말고 4시", "오일장이 아니라 공원", "그거 말고 산책", "차라리 5시", "그냥 공원으로"
   - 재지정: "4시로 하자/해요/할래요/합시다", "공원에서 보자/만나요", "산책으로 하죠"
   - 정정: "아니(요) 4시", "아니야 공원이야", "잘못 말했어 5시야", "다시 말할게, 뜨개질"
   - 상대 시간 조정(기존 time 기준 계산해서 결과 시각을 넣어라):
     "한 시간 미뤄/늦춰(줘)" → +1시간, "30분 당겨" → -30분, "한 시간 뒤로" → +1시간,
     "조금 이따로" → +30분 정도. 예: 기존 "오후 3시" + "한 시간 미뤄" → "오후 4시".
   - 필드 미지칭 변경: 필드 이름을 말하지 않아도 값의 종류로 판단하라 —
     시각 패턴("4시", "네 시 반")이면 time, 장소명이면 location, 행동/활동이면 activity.
   - 비우기: "장소(는) 다시 정할래", "그건 아직 모르겠어" → 해당 필드를 빈 문자열 ""로
     반환하라(원래 몰랐던 필드의 null과 구분하기 위함이다).
3. Return ONLY a JSON object with these exact five keys:
   - "time": string or null — a time-of-day only, WITHOUT any day word (no "오늘"/"내일"/etc).
     The screen that displays this always prefixes it with a fixed "오늘" label, so including a day
     word here would duplicate or contradict it. e.g. "오후 3시", "저녁 6시", "오전 10시".
     If the user mentions a different day (e.g. "내일"), still extract only the time-of-day part.
   - "location": string or null (e.g. "송정 오일장", "우리 아파트 앞")
   - "activity": string or null (e.g. "오일장 구경", "산책")
   - "missingField": "time" | "location" | "activity" | null
     (Pick the FIRST missing field among time, location, activity in that priority order. If none missing, set to null)
   - "followUpQuestion": string or null
     (If missingField is present, write a short, gentle, polite Korean question for seniors asking for that missing information. E.g., "${FIELD_QUESTIONS.location}", "${FIELD_QUESTIONS.activity}", "${FIELD_QUESTIONS.time}". If missingField is null, set to null)

Output pure valid JSON.`;

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!openAiResponse.ok) {
      console.error("OpenAI API error:", await openAiResponse.text());
      return fallbackResult(existing);
    }

    const data = await openAiResponse.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallbackResult(existing);

    const parsed = JSON.parse(content);
    // "" = 의도적 비우기(다시 정할래), null = 이번 발화에 없음(기존 유지), 값 = 갱신
    const mergeField = (v: unknown, prev: string | null): string | null => {
      if (v === "") return null;
      if (typeof v === "string" && v.trim()) return v.trim();
      return prev;
    };
    const merged: Fields = {
      time: mergeField(parsed.time, existing.time),
      location: mergeField(parsed.location, existing.location),
      activity: mergeField(parsed.activity, existing.activity),
    };

    const missingField = firstMissing(merged);
    const followUpQuestion = missingField
      ? (typeof parsed.followUpQuestion === "string" && parsed.followUpQuestion.trim()
          ? parsed.followUpQuestion.trim()
          : FIELD_QUESTIONS[missingField])
      : null;

    return NextResponse.json({ ...merged, missingField, followUpQuestion });
  } catch (error) {
    console.error("Error in /api/parse-meetup:", error);
    return fallbackResult(existing);
  }
}
