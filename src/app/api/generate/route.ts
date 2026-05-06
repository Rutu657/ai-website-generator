import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt, history, existingCode } = await req.json();

  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "NVIDIA_API_KEY is not set in environment variables" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const systemInstruction = `You are an expert React and Tailwind CSS frontend engineer.
Generate only production-ready React components using TailwindCSS.

CRITICAL RULES:
1. NO markdown — do not wrap code in \`\`\`jsx, \`\`\`html, or any other code fence.
2. NO explanations, comments, or text outside the code.
3. The component name MUST be 'GeneratedWebsite'.
4. Use React.useState, React.useEffect, React.useRef etc. (always prefix with React.)
5. For icons, use inline SVG elements — do NOT write any import statements.
6. Do NOT include any import or export statements.
7. Return ONLY the bare function: function GeneratedWebsite() { return ( ... ); }
8. Design must be professional, modern, fully mobile-responsive, and visually stunning.
9. Use rich Tailwind gradients, glassmorphism, shadows, and animations.
10. For images, use Unsplash URLs (https://images.unsplash.com/photo-XXXX?w=800&q=80).

EDITING MODE:
- If EXISTING_CODE is provided along with a user request, you must MODIFY that existing code.
- Apply ONLY the changes the user asked for. Keep everything else intact.
- Do NOT regenerate from scratch — edit the existing code.
- Return the COMPLETE modified code (the full function, not just the diff).`;

  // Build the user message — include existing code for editing
  let userMessage = prompt;
  if (existingCode) {
    userMessage = `EXISTING_CODE:\n${existingCode}\n\nUSER_REQUEST: ${prompt}\n\nModify the EXISTING_CODE above based on the USER_REQUEST. Return the COMPLETE modified function.`;
  }

  const messages = [
    { role: "system", content: systemInstruction },
    ...(history || [])
      .filter((msg: any) => msg.role === "user" || msg.role === "ai")
      .map((msg: any) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        model: "z-ai/glm4.7",
        messages,
        temperature: 0.7,
        top_p: 1,
        max_tokens: 8192,
        stream: true,
        chat_template_kwargs: {
          enable_thinking: false,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`NVIDIA API error ${response.status}:`, errorText);
      return new Response(
        JSON.stringify({ error: `NVIDIA API error ${response.status}: ${errorText || "No details"}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) { controller.close(); return; }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6).trim();
              if (raw === "[DONE]") continue;

              try {
                const parsed = JSON.parse(raw);
                const delta = parsed.choices?.[0]?.delta;
                if (!delta) continue;

                // Skip reasoning content
                if (delta.reasoning_content) continue;

                const content: string | undefined = delta.content;
                if (content != null && content !== "") {
                  const cleaned = content
                    .replace(/```(jsx|javascript|tsx|react|html|typescript)?/g, "")
                    .replace(/```/g, "");
                  if (cleaned) {
                    controller.enqueue(
                      new TextEncoder().encode(`data: ${JSON.stringify({ content: cleaned })}\n\n`)
                    );
                  }
                }
              } catch {
                // Ignore malformed chunks
              }
            }
          }
        } catch (err: any) {
          console.error("Stream read error:", err);
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
          );
        } finally {
          reader.releaseLock();
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
    console.error("NVIDIA fetch error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
