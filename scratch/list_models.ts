
import { GoogleGenerativeAI } from "@google/generative-ai";

async function listAllModels() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return;
  }
  
  // The SDK doesn't expose listModels directly in the simple way.
  // We have to use the REST API.
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e: any) {
    console.error("Failed to list models:", e.message);
  }
}

listAllModels();
