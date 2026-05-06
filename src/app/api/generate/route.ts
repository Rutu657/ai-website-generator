import { NextRequest } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { prompt, history } = await req.json();

  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "NVIDIA API Key is not set in environment variables" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });

  try {
    const systemInstruction = `
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
    `;

    // Format history for NVIDIA/OpenAI
    const messages = [
      { role: "system", content: systemInstruction },
      ...(history || []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: prompt }
    ];

    const response = await openai.chat.completions.create({
      model: "z-ai/glm4.7",
      messages: messages as any,
      temperature: 1,
      top_p: 1,
      max_tokens: 16384,
      extra_body: { "chat_template_kwargs": { "enable_thinking": true, "clear_thinking": false } },
      stream: true,
    } as any);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of (response as any)) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              const data = JSON.stringify({ content });
              controller.enqueue(`data: ${data}\n\n`);
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
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
    console.error("NVIDIA API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
