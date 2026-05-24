import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables.");
      return NextResponse.json(
        {
          error:
            "AI service is not configured. Please add your Gemini API key to .env.local",
        },
        { status: 500 }
      );
    }

    const { message, resumeData, history } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Please enter a message." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a friendly, expert resume coach and career advisor built into a resume builder app. The user is currently editing their resume, and you have access to their resume data for context.

Here is the user's current resume data:
${resumeData ? JSON.stringify(resumeData, null, 2) : "(No resume data available)"}

GUIDELINES:
1. Answer questions about resumes, career advice, job searching, interview prep, and professional development.
2. When the user asks you to improve or suggest content, reference their actual resume data above to give personalized advice.
3. Be concise but thorough. Use bullet points and formatting when helpful.
4. If the user asks something unrelated to careers/resumes, politely redirect them — you are a resume assistant.
5. Be encouraging and constructive. Never be dismissive of the user's experience.
6. When suggesting text (like a summary or bullet point), provide the exact text they can copy.
7. Use markdown formatting in your responses for readability (bold, bullet points, headers, etc.).`;

    // Build the conversation contents array for Gemini
    const contents = [];

    // Add conversation history if present
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      }
    }

    // Add the current user message
    contents.push({
      role: "user",
      parts: [{ text: message.trim() }],
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", response.status, errText);

      let userMessage = "Failed to get AI response. Please try again.";
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error?.message) {
          userMessage = `Gemini API error: ${errJson.error.message}`;
        }
      } catch {}

      if (response.status === 400) {
        userMessage =
          "Invalid request format or bad Gemini API key. Please check your config.";
      }

      return NextResponse.json({ error: userMessage }, { status: 500 });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return NextResponse.json(
        { error: "Empty response from Gemini AI." },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: content.trim() });
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
