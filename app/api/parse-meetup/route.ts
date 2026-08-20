import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const transcript = body?.transcript;

    const existingTime = typeof body?.time === "string" ? body.time : typeof body?.existingTime === "string" ? body.existingTime : null;
    const existingLocation = typeof body?.location === "string" ? body.location : typeof body?.existingLocation === "string" ? body.existingLocation : null;
    const existingActivity = typeof body?.activity === "string" ? body.activity : typeof body?.existingActivity === "string" ? body.existingActivity : null;

    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      let missingField: "time" | "location" | "activity" | null = null;
      if (!existingTime) missingField = "time";
      else if (!existingLocation) missingField = "location";
      else if (!existingActivity) missingField = "activity";

      let followUpQuestion: string | null = null;
      if (missingField === "time") followUpQuestion = "언제 만나고 싶으세요?";
      else if (missingField === "location") followUpQuestion = "어디서 만나고 싶으세요?";
      else if (missingField === "activity") followUpQuestion = "무엇을 하고 싶으세요?";

      return NextResponse.json({
        time: existingTime,
        location: existingLocation,
        activity: existingActivity,
        missingField,
        followUpQuestion,
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("OPENAI_API_KEY missing, returning fallback values.");
      let missingField: "time" | "location" | "activity" | null = null;
      if (!existingTime) missingField = "time";
      else if (!existingLocation) missingField = "location";
      else if (!existingActivity) missingField = "activity";

      let followUpQuestion: string | null = null;
      if (missingField === "time") followUpQuestion = "언제 만나고 싶으세요?";
      else if (missingField === "location") followUpQuestion = "어디서 만나고 싶으세요?";
      else if (missingField === "activity") followUpQuestion = "무엇을 하고 싶으세요?";

      return NextResponse.json({
        time: existingTime,
        location: existingLocation,
        activity: existingActivity,
        missingField,
        followUpQuestion,
      });
    }

    const model = process.env.LLM_MODEL || "gpt-4o";

    const systemPrompt = `You are a Korean natural language parser for a community meetup application for senior citizens.
Extract the time, location, and activity details from the user's transcript in Korean.

Existing known fields:
- time: ${existingTime ? `"${existingTime}"` : "null"}
- location: ${existingLocation ? `"${existingLocation}"` : "null"}
- activity: ${existingActivity ? `"${existingActivity}"` : "null"}

Instructions:
1. Parse the user's input transcript for time, location, or activity.
2. If an existing field is already provided and not null, keep it UNLESS the transcript explicitly provides a new value for that field.
3. Return ONLY a JSON object with these exact five keys:
   - "time": string or null (e.g. "오후 3시", "오늘 15시", "내일 오전 10시")
   - "location": string or null (e.g. "송정 오일장", "우리 아파트 앞")
   - "activity": string or null (e.g. "오일장 구경", "산책")
   - "missingField": "time" | "location" | "activity" | null
     (Pick the FIRST missing field among time, location, activity in that priority order. If none missing, set to null)
   - "followUpQuestion": string or null
     (If missingField is present, write a short, gentle, polite Korean question for seniors asking for that missing information. E.g., "어디서 만나고 싶으세요?", "무엇을 하고 싶으세요?", "언제 만나고 싶으세요?". If missingField is null, set to null)

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
      const errorText = await openAiResponse.text();
      console.error("OpenAI API error:", errorText);

      let missingField: "time" | "location" | "activity" | null = null;
      if (!existingTime) missingField = "time";
      else if (!existingLocation) missingField = "location";
      else if (!existingActivity) missingField = "activity";

      let followUpQuestion: string | null = null;
      if (missingField === "time") followUpQuestion = "언제 만나고 싶으세요?";
      else if (missingField === "location") followUpQuestion = "어디서 만나고 싶으세요?";
      else if (missingField === "activity") followUpQuestion = "무엇을 하고 싶으세요?";

      return NextResponse.json({
        time: existingTime,
        location: existingLocation,
        activity: existingActivity,
        missingField,
        followUpQuestion,
      });
    }

    const data = await openAiResponse.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      let missingField: "time" | "location" | "activity" | null = null;
      if (!existingTime) missingField = "time";
      else if (!existingLocation) missingField = "location";
      else if (!existingActivity) missingField = "activity";

      let followUpQuestion: string | null = null;
      if (missingField === "time") followUpQuestion = "언제 만나고 싶으세요?";
      else if (missingField === "location") followUpQuestion = "어디서 만나고 싶으세요?";
      else if (missingField === "activity") followUpQuestion = "무엇을 하고 싶으세요?";

      return NextResponse.json({
        time: existingTime,
        location: existingLocation,
        activity: existingActivity,
        missingField,
        followUpQuestion,
      });
    }

    const parsed = JSON.parse(content);
    const parsedTime = typeof parsed.time === "string" && parsed.time.trim() ? parsed.time.trim() : existingTime;
    const parsedLocation = typeof parsed.location === "string" && parsed.location.trim() ? parsed.location.trim() : existingLocation;
    const parsedActivity = typeof parsed.activity === "string" && parsed.activity.trim() ? parsed.activity.trim() : existingActivity;

    let missingField: "time" | "location" | "activity" | null = null;
    if (!parsedTime) missingField = "time";
    else if (!parsedLocation) missingField = "location";
    else if (!parsedActivity) missingField = "activity";

    let followUpQuestion: string | null = typeof parsed.followUpQuestion === "string" && parsed.followUpQuestion.trim() ? parsed.followUpQuestion.trim() : null;

    if (missingField && !followUpQuestion) {
      if (missingField === "time") followUpQuestion = "언제 만나고 싶으세요?";
      else if (missingField === "location") followUpQuestion = "어디서 만나고 싶으세요?";
      else if (missingField === "activity") followUpQuestion = "무엇을 하고 싶으세요?";
    }
    if (!missingField) {
      followUpQuestion = null;
    }

    return NextResponse.json({
      time: parsedTime,
      location: parsedLocation,
      activity: parsedActivity,
      missingField,
      followUpQuestion,
    });
  } catch (error) {
    console.error("Error in /api/parse-meetup:", error);
    return NextResponse.json({
      time: null,
      location: null,
      activity: null,
      missingField: "time",
      followUpQuestion: "언제 만나고 싶으세요?",
    });
  }
}
