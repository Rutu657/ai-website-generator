
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testModel() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("test");
    console.log("gemini-flash-latest works");
  } catch (e: any) {
    console.error("gemini-flash-latest failed:", e.message);
  }
}

testModel();
