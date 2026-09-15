import { NextResponse } from "next/server";

const LANGUAGE_NAMES: Record<string, string> = {
  hi: "Hindi",
  en: "English",
  mr: "Marathi",
  gu: "Gujarati",
  bn: "Bengali",
  ta: "Tamil",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history = [], language = "en", currentRoute = "/" } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message parameter" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // If no API key is configured, return fallback status so client uses intelligent local engine
    if (!apiKey) {
      return NextResponse.json({
        reply: null,
        message: "No Gemini API key configured. Client fallback active.",
      });
    }

    const targetLang = LANGUAGE_NAMES[language] || "English";

    const systemInstruction = `You are MediKiosk Assistant, an empathetic, supportive hospital kiosk guide for patients and visitors at an Indian hospital (All India Institute of Ayurveda - AIIA / public hospital OPD).
Rules:
1. Keep replies concise (2-3 sentences max) because patients read on a kiosk screen or listen via audio speech.
2. Answer questions about how to use the kiosk (ABHA login, entering complaints/pain, photographing past prescriptions/reports, getting an OPD token number).
3. Current screen route of the patient: "${currentRoute}".
4. You MUST respond in ${targetLang}.
5. STRICT MEDICAL SAFETY: Do NOT diagnose diseases or prescribe medications. If the user mentions acute chest pain, trouble breathing, or emergency symptoms, urgently advise them to use the Emergency Help button or speak to hospital staff immediately.`;

    // Format conversation history for Gemini API
    const contents = [
      {
        role: "user",
        parts: [{ text: systemInstruction }],
      },
      {
        role: "model",
        parts: [{ text: `Understood. I will act as the MediKiosk hospital assistant and reply concisely in ${targetLang}.` }],
      },
      ...history.slice(-6).map((h: { role: string; text: string }) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 200,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.warn("Gemini API error in assistant route:", errText);
      return NextResponse.json({ reply: null, error: "LLM service unavailable" });
    }

    const data = await geminiRes.json();
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!candidateText) {
      return NextResponse.json({ reply: null });
    }

    return NextResponse.json({
      reply: candidateText,
      isAiGenerated: true,
    });
  } catch (err: any) {
    console.error("Error in assistant API handler:", err);
    return NextResponse.json(
      { reply: null, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
