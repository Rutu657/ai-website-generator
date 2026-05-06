import { NextRequest } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { prompt, history } = await req.json();

  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "NVIDIA_API_KEY is not set in environment variables" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const client = new OpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: apiKey,
  });

  const systemInstruction = `You are an expert React and Tailwind CSS frontend engineer.
Generate only production-ready React components using TailwindCSS.

CRITICAL RULES:
1. NO markdown (no \`\`\`jsx or \`\`\`html blocks).
2. NO explanations or text outside the code.
3. The component name MUST be 'GeneratedWebsite'.
4. Use standard React hooks (useState, useEffect, useRef, useMemo, useCallback) if needed — they are available globally.
5. For icons, use inline SVGs — do NOT use any import statements.
6. Ensure the design is professional, modern, mobile-responsive, and visually stunning.
7. Return ONLY the raw component code — just the function like:
   function GeneratedWebsite() { return ( ... ); }
8. Do NOT include any import or export statements whatsoever.
9. For images, use high-quality Unsplash image URLs (https://images.unsplash.com/...).
10. Use rich gradients, glassmorphism effects, and modern design patterns.`;

  // Build multi-turn messages
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemInstruction },
    // Include conversation history (exclude the current prompt)
    ...(history || [])
      .filter((msg: any) => msg.role === "user" || msg.role === "ai")
      .map((msg: any) => ({
        role: (msg.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: msg.content,
      })),
    { role: "user", content: prompt },
  ];

  try {
    const completion = await client.chat.completions.create({
      model: "z-ai/glm-4.7",
      messages,
      temperature: 1,
      top_p: 1,
      max_tokens: 16384,
      extra_body: {
        chat_template_kwargs: {
          enable_thinking: true,
          clear_thinking: true, // Strip <think> blocks from output
        },
      },
      stream: true,
    } as any);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion as any) {
            if (!chunk.choices || chunk.choices.length === 0) continue;

            const delta = chunk.choices[0]?.delta;
            if (!delta) continue;

            // Skip reasoning/thinking tokens — only stream actual content
            const content = delta.content;
            if (content) {
              // Strip any markdown fences the model sneaks in
              const cleaned = content
                .replace(/```(jsx|javascript|tsx|react|html|typescript)?/g, "")
                .replace(/```/g, "");
              if (cleaned) {
                controller.enqueue(`data: ${JSON.stringify({ content: cleaned })}\n\n`);
              }
            }
          }
        } catch (err: any) {
          console.error("NVIDIA stream error:", err);
          controller.enqueue(
            `data: ${JSON.stringify({ error: err.message || "Stream error" })}\n\n`
          );
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
    console.error("NVIDIA API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
