import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const { prompt, history } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API Key is not set in environment variables" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      systemInstruction: `
        You are an expert React and Tailwind frontend engineer.
        Generate only production-ready React components using TailwindCSS.
        
        CRITICAL RULES:
        1. NO markdown (no \`\`\`jsx or \`\`\`html blocks).
        2. NO explanations or text outside the code.
        3. The component name MUST be 'GeneratedWebsite'.
        4. Use standard React hooks (useState, useEffect) if needed.
        5. Use lucide-react for icons.
        6. Ensure the design is professional, modern, and mobile-responsive.
        7. Return ONLY the raw JSX code for the component.
      `,
    });

    // Format history for Gemini
    const chatHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessageStream(prompt);
    
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          if (chunkText) {
            const data = JSON.stringify({ content: chunkText });
            controller.enqueue(`data: ${data}\n\n`);
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
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
