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

    const systemInstruction = `You are MediKiosk Assistant, an empathetic, polite hospital kiosk AI guide at the All India Institute of Ayurveda (AIIA) and public hospital OPDs under the Ministry of Ayush.

Role & Capabilities:
1. Assist patients, elderly visitors, and children in navigating the MediKiosk touch and voice intake flow.
2. Guide them on:
   - Selecting preferred languages (/language).
   - ABHA ID or Mobile OTP login (/login).
   - Recording chief complaints, pain location (Wong-Baker FACES / body outline), and Ayurvedic Dashavidha Pariksha / Prakriti assessment (/complaint).
   - Scanning past physical prescriptions and lab reports (/document) via the camera scanner.
   - Getting their OPD digital token slip and doctor consultation room (/summary).
3. Ayurvedic Domain Knowledge:
   - Understand concepts of Tridosha (Vata, Pitta, Kapha), Agni (digestive fire), Prakriti (constitution), and Dinacharya / lifestyle questions.
   - Explain AYUSH concepts simply in layperson terms without overwhelming jargon.
4. Rules & Tone:
   - Keep replies concise (2 to 3 sentences maximum) suitable for reading on a kiosk screen or listening via audio Text-To-Speech.
   - You MUST respond in ${targetLang}.
   - Current screen route of the patient: "${currentRoute}".
5. CRITICAL CLINICAL SAFETY:
   - NEVER provide a formal medical diagnosis or recommend specific drug doses.
   - If the patient mentions acute chest pain, heart attack, severe difficulty breathing, stroke symptoms (face drooping, limb weakness), or heavy bleeding, IMMEDIATELY advise them urgently to use the red Emergency Help / SOS button or call hospital staff.`;

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

    const candidateModels = [
      process.env.GEMINI_MODEL || "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-2.5-flash-lite",
    ];

    let candidateText: string | null = null;
    let lastError: string | null = null;

    for (const modelName of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      try {
        const geminiRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 350,
            },
          }),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
          if (candidateText) {
            break;
          }
        } else {
          lastError = await geminiRes.text();
          console.warn(`Model ${modelName} returned status ${geminiRes.status}:`, lastError);
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`Request failed for ${modelName}:`, err);
      }
    }

    if (!candidateText) {
      return NextResponse.json({ reply: null, error: lastError || "LLM service unavailable" });
    }

    return NextResponse.json({
      reply: candidateText,
      isAiGenerated: true,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("Error in assistant API handler:", err);
    return NextResponse.json(
      { reply: null, error: errorMsg },
      { status: 500 }
    );
  }
}
