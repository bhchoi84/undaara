import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  const { system, messages, max_tokens } = await req.json();
  if (!messages || !Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const safeMaxTokens = Math.min(Math.max(Number(max_tokens) || 4000, 1), 8000);

  // Anthropic 형식 → Gemini 형식 변환
  const geminiContents = messages.map((m: { role: string; content: string | Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }> }) => {
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
    if (typeof m.content === "string") {
      parts.push({ text: m.content });
    } else if (Array.isArray(m.content)) {
      for (const c of m.content) {
        if (c.type === "text" && c.text) {
          parts.push({ text: c.text });
        } else if (c.type === "image" && c.source?.type === "base64") {
          parts.push({ inlineData: { mimeType: c.source.media_type, data: c.source.data } });
        }
      }
    }
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });

  const geminiBody: Record<string, unknown> = {
    contents: geminiContents,
    generationConfig: { maxOutputTokens: safeMaxTokens, temperature: 0.8 },
  };

  if (system) {
    geminiBody.systemInstruction = { parts: [{ text: system }] };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: { message: data?.error?.message || "Gemini API error" } }, { status: response.status });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return NextResponse.json({ content: [{ type: "text", text }] });
  } catch (err) {
    return NextResponse.json({ error: "Server error: " + (err as Error).message }, { status: 500 });
  }
}
