import express, { Request, Response } from 'express';
import { ai } from './gemini';

export const apiRouter = express.Router();

// Mock database for sessions & users
const users: Record<string, { email: string; name: string; avatar: string; password?: string }> = {
  'guest@codeverse.io': {
    email: 'guest@codeverse.io',
    name: 'Guest Developer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  }
};

let activeSessions: Record<string, string> = {}; // token -> email

// Auth Routes
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }
  if (users[email]) {
    res.status(400).json({ error: 'User already exists.' });
    return;
  }
  users[email] = { email, name, password, avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}` };
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  activeSessions[token] = email;
  res.json({ token, user: { email, name, avatar: users[email].avatar } });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }
  const user = users[email];
  if (!user || (user.password && user.password !== password)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  activeSessions[token] = email;
  res.json({ token, user: { email, name: user.name, avatar: user.avatar } });
});

apiRouter.post('/auth/profile', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }
  const token = authHeader.replace('Bearer ', '');
  const email = activeSessions[token];
  if (!email || !users[email]) {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return;
  }
  const user = users[email];
  res.json({ user: { email, name: user.name, avatar: user.avatar } });
});

// Helper to query Gemini with fallbacks
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const models = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`Trying Gemini generateContent with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (error: any) {
      console.error(`Gemini generateContent with model ${model} failed:`, error);
      lastError = error;
      // Continue to the next model in the fallback list
    }
  }

  throw lastError || new Error('Failed to generate content with all available models.');
}

// Gemini AI Chat Copilot Route
apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  const { messages, contextFile } = req.body;
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  try {
    const formattedMessages = messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    let systemInstruction = "You are CodeVerse Copilot, an elite AI programming assistant built into the CodeVerse IDE. Your goal is to write clean, secure, and modern code, explain complex concepts simply, and help developers debug, refactor, and write tests.";
    
    if (contextFile) {
      systemInstruction += `\n\nCurrent active file: ${contextFile.name} (Language: ${contextFile.language}).\nFile contents:\n\`\`\`\n${contextFile.content}\n\`\`\``;
    }

    const response = await generateContentWithFallback({
      contents: formattedMessages,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to generate AI response: ' + (error.message || error) });
  }
});

// Gemini AI camera OCR transcribe code Route
apiRouter.post('/ai/ocr', async (req: Request, res: Response) => {
  const { image } = req.body; // Base64 encoded image
  if (!image) {
    res.status(400).json({ error: 'Image data is required.' });
    return;
  }

  try {
    // Check if the image contains the standard data URL header and strip it if needed
    let base64Data = image;
    let mimeType = 'image/jpeg';
    
    const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      base64Data = matches[2];
    }

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const response = await generateContentWithFallback({
      contents: [
        imagePart,
        { text: "Extract all visible source code from this image. Do not add markdown backticks, explanations, or commentaries. Output ONLY the raw source code itself, keeping formatting intact so it can be directly pasted into an editor." }
      ]
    });

    res.json({ code: response.text });
  } catch (error: any) {
    console.error('OCR Error:', error);
    res.status(500).json({ error: 'Failed to extract code from image: ' + (error.message || error) });
  }
});
