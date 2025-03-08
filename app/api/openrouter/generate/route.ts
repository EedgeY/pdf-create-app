import { promptEN_v2 } from '@/lib/prompt/generate/prompt-v2-en';
import { promptEN_v3 } from '@/lib/prompt/generate/prompt-v3-en';
import { NextRequest, NextResponse } from 'next/server';

// 利用可能なモデルのリスト
const AVAILABLE_MODELS = [
  'anthropic/claude-3.7-sonnet',
  'anthropic/claude-3.5-sonnet',
  'google/gemini-2.0-flash-001',
  'deepseek/deepseek-chat',
];

const PROMPTLIST = [promptEN_v2, promptEN_v3];

export async function POST(req: NextRequest) {
  try {
    const { prompt, model } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      );
    }

    // モデルが指定されていない場合はデフォルトモデルを使用
    const selectedModel =
      model && AVAILABLE_MODELS.includes(model) ? model : AVAILABLE_MODELS[2]; // デフォルトはgoogle/gemini-2.0-flash-001

    // OpenRouter APIを直接呼び出す
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://pdf-create-app.vercel.app',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: PROMPTLIST[0],
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 64000,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const generatedTemplate = data.choices[0]?.message?.content || '';

    console.log('generatedTemplate', generatedTemplate);

    try {
      // JSONとして解析してバリデーションを行う
      let cleanedTemplate = generatedTemplate;

      // マークダウンコードブロックの記法を削除（Geminiが時々これを含める）
      if (cleanedTemplate.includes('```json')) {
        cleanedTemplate = cleanedTemplate
          .replace(/```json\n/g, '')
          .replace(/```/g, '');
      }

      // 前後の空白を削除
      cleanedTemplate = cleanedTemplate.trim();

      // JSONオブジェクトの開始と終了を見つける
      const jsonStartIndex = cleanedTemplate.indexOf('{');
      const jsonEndIndex = cleanedTemplate.lastIndexOf('}') + 1;

      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        // JSONオブジェクト部分のみを抽出
        cleanedTemplate = cleanedTemplate.substring(
          jsonStartIndex,
          jsonEndIndex
        );
      }

      try {
        JSON.parse(cleanedTemplate);
      } catch (jsonError: any) {
        console.error('JSONパースエラー:', jsonError);
        // JSONパースエラーの詳細を返す
        return NextResponse.json(
          {
            error: '生成されたテンプレートが有効なJSONではありません',
            details: jsonError.message,
            generatedTemplate: generatedTemplate,
          },
          { status: 422 }
        );
      }

      // もう処理済みのJSONテキストをそのまま返す
      return NextResponse.json({
        text: cleanedTemplate,
        rawOutput: generatedTemplate,
      });
    } catch (parseError: any) {
      console.error('処理エラー:', parseError);
      return NextResponse.json(
        {
          error: 'テンプレートの処理中にエラーが発生しました',
          details: parseError.message,
        },
        { status: 422 }
      );
    }
  } catch (error: any) {
    console.error('リクエスト処理エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error.message },
      { status: 500 }
    );
  }
}
