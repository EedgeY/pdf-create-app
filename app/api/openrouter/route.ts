import { NextRequest, NextResponse } from 'next/server';

// 利用可能なモデルのリスト
const AVAILABLE_MODELS = ['google/gemini-2.0-flash-001'];

export async function POST(req: NextRequest) {
  try {
    const { templateType, documentSize } = await req.json();

    if (!templateType && !documentSize) {
      return NextResponse.json(
        { error: 'テンプレートタイプまたはドキュメントサイズが必要です' },
        { status: 400 }
      );
    }

    // プロンプト生成用のシステムプロンプト
    const systemPrompt = `あなたは高品質なPDFテンプレートのプロンプト生成AIです。
ユーザーの要望に基づいて、PDFテンプレート生成AIへの詳細なプロンプトを作成してください。

以下の点を考慮して、具体的で詳細なプロンプトを生成してください：
1. テンプレートの種類: ${templateType || 'ユーザーの希望に合わせた種類'}
2. ドキュメントサイズ: ${documentSize || 'A4サイズ（210mm × 297mm）'}
3. レイアウト: ヘッダー、本文、フッターの構成と配置
4. 必要なフィールド: テンプレートに含める情報フィールド
5. テーブル: 必要な場合、列名と内容の説明
6. デザイン要素: 色使い、余白、フォントサイズなどの指定

【重要】必ず複数ページのテンプレートとして設計してください。スキーマは以下の形式で必ず記述してください：
schema: [
  [1ページ目の要素配列],
  [2ページ目の要素配列]
]

各ページの要素は独立して配置する必要があります。1ページ目と2ページ目で異なる内容や要素を含めることで、複数ページの特性を活かしたテンプレートにしてください。単一のページ内容を2つに分けるのではなく、それぞれのページに意味のある異なるコンテンツを配置してください。

出力形式は単純なテキストのみで、マークダウンや装飾は不要です。
日本語で300文字から500文字程度の具体的なプロンプトを生成してください。`;

    // テンプレートタイプが指定されていない場合はランダムなタイプを生成
    let promptPrefix = '';
    if (!templateType) {
      const templateTypes = [
        '請求書',
        '見積書',
        '診断書',
        '報告書',
        '履歴書',
        '契約書',
        '証明書',
        '申請書',
        '議事録',
        'カタログ',
      ];
      const randomType =
        templateTypes[Math.floor(Math.random() * templateTypes.length)];
      promptPrefix = `${randomType}の複数ページPDFテンプレートを生成するためのプロンプトを作成してください。必ず2ページ以上に分かれる構成にし、1ページ目と2ページ目で異なる情報を表示するようにしてください。`;
    } else {
      promptPrefix = `${templateType}の複数ページPDFテンプレートを生成するためのプロンプトを作成してください。必ず2ページ以上に分かれる構成にし、1ページ目と2ページ目で異なる情報を表示するようにしてください。`;
    }

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
          model: AVAILABLE_MODELS[0],
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: promptPrefix,
            },
          ],
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content || '';

    return NextResponse.json({
      text: generatedText,
      model: AVAILABLE_MODELS[0],
    });
  } catch (error: any) {
    console.error('プロンプト生成エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error.message },
      { status: 500 }
    );
  }
}
