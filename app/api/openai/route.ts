import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const openai = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPEN_AI_API_KEY,
  compatibility: 'strict',
});
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    // Validate that the prompt is not empty or undefined
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    const model = openai('gpt-4-turbo');
    const { text } = await generateText({
      model,
      prompt: prompt,
    });

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error(
      'Error occurred:',
      error.response?.data || error.message || error
    );
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
