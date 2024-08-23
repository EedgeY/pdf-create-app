import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Edge環境
export const runtime = 'edge';

// POST
export async function POST(req: Request) {
  const { messages } = await req.json();
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    stream: true,
    messages,
  });
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
