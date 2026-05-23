import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables.");
      return NextResponse.json(
        { error: "AI service is not configured. Please add your OpenAI API key to .env.local" },
        { status: 500 }
      );
    }

    const { resumeData, jobDescription } = await request.json();

    if (!jobDescription || !resumeData) {
      return NextResponse.json(
        { error: "Missing job description or resume data." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert resume writer and career coach. Your task is to rewrite and optimize an existing resume to better match a specific job description. 

RULES:
1. Tailor the profile summary to highlight relevant experience for the target role.
2. Rewrite experience descriptions using strong action verbs and quantifiable achievements that align with the job requirements.
3. Reorder and emphasize skills that are mentioned in the job description.
4. Add any missing relevant skills from the job description that the candidate could reasonably claim.
5. Keep education and certificates unchanged unless minor wording improvements help.
6. Maintain truthfulness — enhance and reframe, but do NOT fabricate experience.
7. Use concise, impactful, ATS-friendly language.
8. Return ONLY valid JSON matching the exact structure provided — no markdown, no explanation, no code fences.`;

    const userPrompt = `Here is the current resume data (JSON):
${JSON.stringify(resumeData, null, 2)}

Here is the target job description:
"""
${jobDescription}
"""

Rewrite the resume to be optimized for this job. Return the rewritten resume as a JSON object with the EXACT same structure as the input. Every field key must be preserved. Only change the text values to be better tailored.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI API error:", response.status, errText);

      let userMessage = "Failed to get AI response. Please try again.";
      try {
        const errJson = JSON.parse(errText);
        if (errJson.error?.message) {
          userMessage = `OpenAI error: ${errJson.error.message}`;
        }
      } catch {}

      if (response.status === 401) {
        userMessage = "Invalid API key. Please check your OpenAI API key in .env.local";
      } else if (response.status === 429) {
        userMessage = "Rate limited or quota exceeded. Please check your OpenAI billing.";
      }

      return NextResponse.json(
        { error: userMessage },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Empty response from AI." },
        { status: 500 }
      );
    }

    // Parse the JSON response — strip possible markdown fences
    let cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
    }

    const rewrittenResume = JSON.parse(cleaned);

    return NextResponse.json({ rewrittenResume });
  } catch (err) {
    console.error("AI rewrite error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
