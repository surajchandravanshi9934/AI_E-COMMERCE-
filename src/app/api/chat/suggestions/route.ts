import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

/* ================= GEMINI INIT ================= */
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

/* ================= GET (Health Check – KEEP THIS) ================= */
export async function GET() {
  return NextResponse.json({
    status: "OK",
    service: "Chat Suggestions API",
    model: "gemini-2.5-flash",
  });
}

/* ================= POST (AI Suggestions) ================= */
export async function POST(req: Request) {
  try {
    console.log("🔥 Suggestions API HIT");

    const { message, role, targetRole } = await req.json();

    if (!message || !role || !targetRole) {
      return NextResponse.json({ suggestions: [] });
    }

    let roleContext = "";
    if (role === "user" && targetRole === "vendor")
      roleContext = "You are a USER asking a vendor politely.";
    if (role === "vendor" && targetRole === "user")
      roleContext = "You are a VENDOR helping a user professionally.";
    if (role === "vendor" && targetRole === "admin")
      roleContext = "You are a VENDOR asking an admin clearly.";
    if (role === "admin" && targetRole === "vendor")
      roleContext = "You are an ADMIN giving guidance.";

    const prompt = `
${roleContext}

Last message:
"${message}"

Generate 3 reply suggestions.
Rules:
- 5 to 10 words
- Polite and professional
- One per line
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const rawText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const suggestions = rawText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("❌ Suggestion Error:", err);
    return NextResponse.json({ suggestions: [] });
  }
}
