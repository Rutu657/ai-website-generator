import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const { prompt, history, existingCode } = await req.json();

  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

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

  let userMessage = prompt;
  if (existingCode) {
    userMessage = `EXISTING_CODE:\n${existingCode}\n\nUSER_REQUEST: ${prompt}\n\nModify the EXISTING_CODE above based on the USER_REQUEST. Return the COMPLETE modified function.`;
  }

  // --- TRY NVIDIA NIM FIRST ---
  if (nvidiaKey) {
    try {
      console.log("DEBUG: Attempting NVIDIA NIM...");
      const nvidiaResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${nvidiaKey}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          model: "meta/llama-3.1-8b-instruct", // Most stable model on NVIDIA
          messages: [
            { role: "system", content: systemInstruction },
            ...(history || []).map((m: any) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content })),
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
          stream: true,
        }),
      });

      if (nvidiaResponse.ok) {
        return streamNvidia(nvidiaResponse);
      } else {
        console.warn(`NVIDIA failed with status ${nvidiaResponse.status}. Falling back to Gemini...`);
      }
    } catch (err) {
      console.error("NVIDIA Connection Error:", err);
    }
  }

  // --- FALLBACK TO GEMINI ---
  if (geminiKey) {
    try {
      console.log("DEBUG: Attempting Gemini Fallback...");
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const chat = model.startChat({
        history: (history || []).map((m: any) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
      });

      const result = await chat.sendMessageStream(`${systemInstruction}\n\nUSER_PROMPT: ${userMessage}`);
      
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            const cleaned = text.replace(/```(jsx|tsx|react|html|javascript)?/g, "").replace(/```/g, "");
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: cleaned })}\n\n`));
          }
          controller.close();
        },
      });

      return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: "All AI engines failed: " + err.message }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ error: "No API keys configured" }), { status: 500 });
}

async function streamNvidia(response: Response) {
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) return controller.close();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") continue;
            try {
              const parsed = JSON.parse(raw);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                const cleaned = content.replace(/```(jsx|tsx|react|html|javascript)?/g, "").replace(/```/g, "");
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: cleaned })}\n\n`));
              }
            } catch (e) {}
          }
        }
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
}
