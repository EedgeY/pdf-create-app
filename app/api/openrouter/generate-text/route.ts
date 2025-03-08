import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model, colorPattern } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json({ error: 'モデルが必要です' }, { status: 400 });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'API設定が不完全です' },
        { status: 500 }
      );
    }

    // カラーパターン情報を追加
    const colorInfo = colorPattern
      ? `
指定されたカラーパターンを使用してください：
- 主要色（テキスト色など）: ${colorPattern.primary}
- 二次色（背景色など）: ${colorPattern.secondary}
- アクセント色（強調など）: ${colorPattern.accent}
`
      : '';

    // テキスト要素用のシステムプロンプト
    const systemPrompt = `あなたはPDFテンプレートのテキスト要素作成の専門家です。
ユーザーの要望を分析し、最適な複数のテキスト要素を提案してください。
ユーザーが求める内容を単一のテキストではなく、論理的に分割された複数のテキスト要素として設計してください。

以下のスキーマに準拠したテキスト要素のJSONオブジェクトの配列を返してください：
[
  {
    "name": "string", // 一意の識別子（例：heading1, paragraph1など）
    "type": "text", // 必ず"text"としてください
    "position": {"x": number, "y": number}, // 位置（mm単位）
    "width": number, // 幅（mm単位）
    "height": number, // 高さ（mm単位）
    "content": "string", // テキスト内容
    "fontName": "string", // 以下のフォントリストから選択してください
    "fontSize": number, // ポイントサイズ（通常10-16）
    "alignment": "left" | "center" | "right", // テキスト揃え
    "verticalAlignment": "top" | "middle" | "bottom", // 垂直揃え
    "lineHeight": number, // 推奨値：1.2～1.5
    "fontColor": "string" // 16進カラーコード（例："#000000"）
  },
  // 複数の要素を追加
]

使用可能なフォント一覧：
- NotoSerifJP-Regular (日本語セリフフォント、デフォルト)
- NotoSansJP-Regular (日本語サンセリフフォント)
- NotoSansKR-Regular (韓国語サンセリフフォント)
- MeaCulpa-Regular (筆記体の装飾フォント)
- MonsieurLaDoulaise-Regular (エレガントな筆記体フォント)
- RozhaOne-Regular (太くて強調されたセリフフォント)
- Roboto (標準的な欧文フォント)
${colorInfo}
注意点：
1. ユーザーの要望を分析し、適切に複数のテキスト要素に分割してください（見出し、本文、注釈など）
2. 各要素の位置関係を考慮し、読みやすく美しいレイアウトを設計してください
3. 位置（position）は通常、x:10～180mm, y:10～280mm範囲内で指定
4. 幅と高さは内容に合わせて適切に設定
5. 要素の重要度に応じてフォントサイズや種類を調整してください
6. 見出しと本文で異なるフォントを使用するなど、視覚的階層を作成してください
7. 要素間の間隔を適切に保ち、読みやすさを確保してください

純粋なJSONオブジェクトの配列のみを返し、マークダウン表記や説明文は含めないでください。`;

    // OpenRouterにリクエストを送信
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://pdfme-app.vercel.app/',
          'X-Title': 'PDFme App',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API エラー:', errorData);
      return NextResponse.json(
        { error: 'AIモデルからの応答に失敗しました' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const messageContent = data.choices[0]?.message?.content || '';

    if (!messageContent) {
      return NextResponse.json(
        { error: 'AIモデルからの応答が空です' },
        { status: 400 }
      );
    }

    try {
      // テキスト要素のレスポンスを処理
      const elements = await processTextResponse(data);

      if (elements) {
        return NextResponse.json({
          elements,
          model: data.model,
        });
      } else {
        return NextResponse.json(
          { error: '有効なテキスト要素が生成されませんでした' },
          { status: 400 }
        );
      }
    } catch (error: any) {
      console.error('テキスト応答処理エラー:', error);
      return NextResponse.json(
        { error: error.message || 'AIの応答を処理できませんでした' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('API処理エラー:', error);
    return NextResponse.json(
      { error: error.message || '不明なエラーが発生しました' },
      { status: 500 }
    );
  }
}

// テキスト要素のレスポンスを処理する関数
const processTextResponse = async (response: any) => {
  try {
    let content = response.choices[0]?.message?.content || '';
    console.log('AIからの応答テキスト:', content);

    // JSONオブジェクトを抽出
    let jsonContent = content;

    // マークダウンコードブロックを削除
    if (content.includes('```json')) {
      jsonContent = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonContent = content.split('```')[1].split('```')[0].trim();
    }

    // JSONをパース
    let parsedContent;
    try {
      parsedContent = JSON.parse(jsonContent);
    } catch (e) {
      console.error('JSONパースエラー:', e);
      console.error('パースに失敗したJSON:', jsonContent);

      // 最後の手段として、正規表現でJSONオブジェクトを抽出
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedContent = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error('2回目のJSONパースにも失敗:', e2);
          throw new Error('AIの応答をJSONとして解析できませんでした');
        }
      } else {
        throw new Error('AIの応答からJSONオブジェクトを抽出できませんでした');
      }
    }

    // 配列かどうかを確認
    const elements = Array.isArray(parsedContent)
      ? parsedContent
      : [parsedContent];

    // 各要素を検証
    elements.forEach((element, index) => {
      // テキスト要素の必須プロパティを確認
      if (element.type === 'text') {
        // 必須プロパティの存在確認
        if (!element.name) {
          element.name = 'text_' + Math.random().toString(36).substring(2, 9);
        }

        // 位置情報の検証
        if (
          !element.position ||
          typeof element.position.x !== 'number' ||
          typeof element.position.y !== 'number'
        ) {
          console.warn(
            `要素 ${index + 1} の位置情報が不正です、デフォルト値を設定します`
          );
          element.position = { x: 10 + index * 5, y: 10 + index * 10 };
        }

        // サイズ情報の検証
        if (!element.width || typeof element.width !== 'number') {
          element.width = 100;
        }
        if (!element.height || typeof element.height !== 'number') {
          element.height = 20;
        }

        // フォント情報の検証
        if (!element.fontName) {
          element.fontName = 'NotoSerifJP-Regular';
        }
        if (!element.fontSize || typeof element.fontSize !== 'number') {
          element.fontSize = 12;
        }
      } else {
        throw new Error('生成された要素はテキスト要素ではありません');
      }
    });

    return elements;
  } catch (error) {
    console.error('テキスト応答処理エラー:', error);
    throw error;
  }
};
