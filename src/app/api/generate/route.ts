import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const { prompt, history } = await req.json();

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemInstruction = `You are an expert React and Tailwind CSS frontend engineer.
Generate only production-ready React components using TailwindCSS.

CRITICAL RULES:
1. NO markdown (no \`\`\`jsx or \`\`\`html blocks).
2. NO explanations or text outside the code.
3. The component name MUST be 'GeneratedWebsite'.
4. Use standard React hooks (useState, useEffect, useRef, useMemo, useCallback) if needed.
5. Use lucide-react for icons (but write them as plain SVG inline — do not use import statements).
6. Ensure the design is professional, modern, and mobile-responsive.
7. Return ONLY the raw JSX/JS code — just the function body like:
   function GeneratedWebsite() { return ( ... ); }
8. Do NOT include any import or export statements whatsoever.
9. For images, use high-quality Unsplash image URLs.`;

  // Build chat history for multi-turn
  const formattedHistory = (history || [])
    .filter((msg: any) => msg.role === "user" || msg.role === "ai")
    .map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

  try {
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "model", parts: [{ text: "Understood. I will generate only raw React component code with no imports, no exports, no markdown, and the component will always be named GeneratedWebsite." }] },
        ...formattedHistory,
      ],
    });

    const result = await chat.sendMessageStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const content = chunk.text();
            if (content) {
              // Strip any markdown fences the model sneaks in
              const cleaned = content
                .replace(/```(jsx|javascript|tsx|react|html)?/g, "")
                .replace(/```/g, "");
              const data = JSON.stringify({ content: cleaned });
              controller.enqueue(`data: ${data}\n\n`);
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
