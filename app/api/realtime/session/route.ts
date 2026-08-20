import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on server" },
      { status: 500 }
    );
  }

  // 1. Primary endpoint: /v1/realtime/client_secrets
  try {
    const primaryRes = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-realtime",
        },
      }),
    });

    if (primaryRes.ok) {
      const data = await primaryRes.json();
      return NextResponse.json(data);
    }

    const primaryErrText = await primaryRes.text();
    console.warn("Primary client_secrets endpoint response failed:", primaryRes.status, primaryErrText);
  } catch (err) {
    console.warn("Primary endpoint request error:", err);
  }

  // 2. Fallback endpoint: /v1/realtime/sessions
  try {
    const fallbackRes = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
      }),
    });

    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      return NextResponse.json(data);
    }

    const fallbackErrText = await fallbackRes.text();
    return NextResponse.json(
      {
        error: "Failed to create realtime session",
        status: fallbackRes.status,
        details: fallbackErrText,
      },
      { status: fallbackRes.status || 500 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Exception calling realtime session API",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
