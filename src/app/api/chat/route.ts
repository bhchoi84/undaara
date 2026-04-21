import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const { model, max_tokens, system, messages } = await req.json();
  if (!messages || !Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const safeMaxTokens = Math.min(Math.max(Number(max_tokens) || 3000, 1), 8000);
  const safeModel = ["claude-haiku-4-5-20251001"].includes(model) ? model : "claude-haiku-4-5-20251001";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: safeModel, max_tokens: safeMaxTokens, system, messages }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data?.error?.message || "API error" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Server error: " + (err as Error).message }, { status: 500 });
  }
}
