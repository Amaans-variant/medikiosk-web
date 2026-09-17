import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { audioData, mimeType = "audio/webm", language = "en" } = body;

    if (!audioData || typeof audioData !== "string") {
      return NextResponse.json({ error: "Missing audioData" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "No Gemini API key configured" },
        { status: 500 }
      );
    }

    // Strip out base64 data URL header if present (e.g., "data:audio/webm;base64,")
    const cleanBase64 = audioData.includes(",")
      ? audioData.split(",")[1]
      : audioData;

    // Standardize mime type for Gemini
    let cleanMime = mimeType.split(";")[0].trim();
    if (!cleanMime || cleanMime === "audio/webm") {
      cleanMime = "audio/webm";
    }

    const promptText = `Listen to this audio recording carefully.
If someone is speaking, transcribe the exact spoken words verbatim in the original language (Hindi, English, Hinglish, Marathi, Gujarati, Tamil, etc.).
Strict rules:
- Output ONLY the transcribed text. Do NOT add notes, conversational replies, quotes, or markdown.
- If the audio contains only silence, static, background noise, or no recognizable human speech, respond with EXACTLY: NO_SPEECH`;

    const candidateModels = [
      process.env.GEMINI_MODEL || "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-2.5-flash-lite",
    ];

    let transcribedText: string | null = null;
    let lastError: string | null = null;

    for (const modelName of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      try {
        const geminiRes = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: cleanMime,
                      data: cleanBase64,
                    },
                  },
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 250,
            },
          }),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          let candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
          if (candidate.toUpperCase().includes("NO_SPEECH") || candidate.length > 500) {
            candidate = "";
          }
          transcribedText = candidate;
          break;
        } else {
          lastError = await geminiRes.text();
          console.warn(`Gemini audio transcribe failed on ${modelName}:`, lastError);
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
        console.warn(`Request failed for audio model ${modelName}:`, err);
      }
    }

    if (transcribedText === null) {
      return NextResponse.json(
        { error: lastError || "Failed to transcribe audio", transcript: "" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      transcript: transcribedText,
      success: true,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    console.error("Transcribe API error:", err);
    return NextResponse.json({ error: errorMsg, transcript: "" }, { status: 500 });
  }
}
