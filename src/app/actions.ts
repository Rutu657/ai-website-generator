"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function generateWebsite(prompt: string, previousCode?: string) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("API Key not found. Please set GOOGLE_GENERATIVE_AI_API_KEY in your environment variables.");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const systemPrompt = `
    You are an expert React and Tailwind CSS developer.
    Your task is to generate a premium, production-ready, and high-converting React component based on the user's prompt.

    TECHNICAL REQUIREMENTS:
    - Use React (JSX) and Tailwind CSS.
    - Return ONLY the JSX code for a single component named 'GeneratedWebsite'.
    - Use standard HTML tags and Tailwind classes.
    - For icons, use Lucide React icons but represented as SVG or assuming they are available via standard imports (the runner will handle this).
    - For images, use high-quality Unsplash URLs.
    - Ensure the design is fully responsive and modern.

    INTERACTIVE MODE (Step 13):
    - If 'PREVIOUS_CODE' is provided, modify that code based on the user's new instruction.
    - Preserve the overall structure but apply the requested changes accurately.

    RULES:
    - Return ONLY the raw JSX code.
    - Do NOT include any markdown formatting like \`\`\`jsx.
    - Do NOT include 'import' statements.
    - Do NOT include 'export default'.
    - Just provide the component function: 'function GeneratedWebsite() { return ( ... ); }'
  `;

  const userContent = previousCode 
    ? `PREVIOUS_CODE: ${previousCode}\n\nNEW_INSTRUCTION: ${prompt}`
    : prompt;

  try {
    const result = await model.generateContent([systemPrompt, userContent]);
    const response = await result.response;
    let text = response.text();
    
    // Clean up markdown
    text = text.replace(/```jsx/g, "").replace(/```javascript/g, "").replace(/```/g, "").trim();
    
    return text;
  } catch (error) {
    console.error("Generation error:", error);
    throw new Error("Failed to generate website. Please try again.");
  }
}
