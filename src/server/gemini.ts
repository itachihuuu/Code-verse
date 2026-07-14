import { GoogleGenAI } from "@google/genai";

// Ensure the API key is retrieved from the environment variables safely.
const apiKey = process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});
