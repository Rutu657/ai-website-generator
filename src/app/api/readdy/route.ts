import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt, projectID } = body;

  if (!process.env.READDY_API_KEY) {
    return new Response(JSON.stringify({ error: "READDY_API_KEY is not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Ensure the key is clean and handles the Bearer prefix correctly
    const apiKey = process.env.READDY_API_KEY || "";
    const authHeader = apiKey.startsWith("rdy_") ? `Bearer ${apiKey}` : apiKey;

    const response = await fetch("https://readdy.ai/api/project/generate", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
      },
      body: JSON.stringify({
        apiVersion: "v2",
        projectID: projectID || "new_project",
        query: `GENERATE PRODUCTION-READY REACT + TAILWIND COMPONENT ONLY. NO MARKDOWN. NO EXPLANATIONS. 
               Component Name: GeneratedWebsite. 
               Requirements: ${prompt}`,
        route: "/",
        currentDevice: "web",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `Readdy API error: ${errorText}` }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Proxy the stream
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
