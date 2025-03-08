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
- 主要色（ヘッダーテキスト色、ボーダー色など）: ${colorPattern.primary}
- 二次色（背景色など）: ${colorPattern.secondary}
- アクセント色（ヘッダー背景色など）: ${colorPattern.accent}
`
      : '';

    // テーブル要素用のシステムプロンプト
    const systemPrompt = `あなたはPDFテンプレートの単一テーブル要素作成の専門家です。
ユーザーの要求に従い、PDFmeライブラリのテーブル要素JSONスキーマを作成してください。

【重要】以下の厳格なフォーマットルールに従ってください：
1. JSONオブジェクトは完全な形式で記述し、プロパティ間には必ずカンマを入れてください
2. JSONオブジェクトの最後には必ず閉じ括弧 } を入れてください
3. マークダウン記法（\`\`\`json など）は使用しないでください
4. 各プロパティの後には必ずカンマを入れ、最後のプロパティの後にはカンマを入れないでください

以下のスキーマに準拠したテーブル要素のJSONオブジェクトのみを返してください：
{
  "name": "テーブル名",
  "type": "table",
  "position": {"x": 数値, "y": 数値},
  "width": 数値,
  "height": 数値,
  "content": "文字列化した2次元配列",
  "showHead": true/false,
  "head": ["列見出し1", "列見出し2", ...],
  "headWidthPercentages": [数値, 数値, ...],
  "fontName": "フォント名",
  "tableStyles": {
    "borderWidth": 0,
    "borderColor": "#ffffff"
  },
  "headStyles": {
    "fontName": "フォント名",
    "fontSize": 数値,
    "alignment": "left/center/right",
    "verticalAlignment": "top/middle/bottom",
    "fontColor": "カラーコード",
    "backgroundColor": "カラーコード",
    "lineHeight": 数値,
    "characterSpacing": 数値,
    "borderWidth": {
      "top": 数値,
      "right": 数値,
      "bottom": 数値,
      "left": 数値
    },
    "padding": {
      "top": 数値,
      "right": 数値,
      "bottom": 数値,
      "left": 数値
    }
  },
  "bodyStyles": {
    "fontName": "フォント名",
    "fontSize": 数値,
    "alignment": "left/center/right",
    "verticalAlignment": "top/middle/bottom",
    "fontColor": "カラーコード",
    "backgroundColor": "カラーコード",
    "lineHeight": 数値,
    "characterSpacing": 数値,
    "borderWidth": {
      "top": 数値,
      "right": 数値,
      "bottom": 数値,
      "left": 数値
    },
    "padding": {
      "top": 数値,
      "right": 数値,
      "bottom": 数値,
      "left": 数値
    }
  },
  "columnStyles": {
    "alignment": {
      "0": "left/center/right",
      "1": "left/center/right",
      "2": "left/center/right"
    }
  }
}

使用可能なフォント一覧：
- NotoSerifJP-Regular (日本語セリフフォント、デフォルト)
- NotoSansJP-Regular (日本語サンセリフフォント)
- NotoSansKR-Regular (韓国語サンセリフフォント)
- MeaCulpa-Regular (筆記体の装飾フォント)
- MonsieurLaDoulaise-Regular (エレガントな筆記体フォント)
- RozhaOne-Regular (太くて強調されたセリフフォント)
- Roboto (標準的な欧文フォント)
${colorInfo}
重要な注意点：
1. contentは必ずJSON.stringify()で文字列化した2次元配列にしてください
   例：JSON.stringify([["項目1", "項目2"], ["値1", "値2"]])
2. head配列とheadWidthPercentagesの長さは一致させ、後者の合計は必ず100になるようにしてください
3. 位置（position）は通常、x:10～50mm, y:10～280mm範囲内で指定
4. ユーザーの要求に応じて適切なフォントを選択してください
5. headStylesとbodyStylesには必ず必要なすべてのプロパティを含めてください
6. columnStylesには列ごとの配置を必ず指定してください（テキスト列は左揃え、数値列は右揃えが一般的）
7. tableBodyのborderstyleには${colorInfo}に従ってください
8. tableStylesは必ず"borderWidth": 0, "borderColor": "#ffffff"にしてください

純粋なJSONオブジェクトのみを返し、マークダウン表記や説明文は含めないでください。`;

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
      // テーブル要素のレスポンスを処理
      const element = await processTableResponse(data);

      if (element) {
        return NextResponse.json({
          element,
          model: data.model,
        });
      } else {
        return NextResponse.json(
          { error: '有効なテーブル要素が生成されませんでした' },
          { status: 400 }
        );
      }
    } catch (error: any) {
      console.error('テーブル応答処理エラー:', error);
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

// テーブル要素のレスポンスを処理する関数
const processTableResponse = async (response: any) => {
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

    // テーブル要素の特別な処理
    try {
      // 文字列をJSON形式に変換する前に、一般的な問題を修正
      jsonContent = jsonContent.replace(
        /(['"])?([a-zA-Z0-9_]+)(['"])?:/g,
        '"$2":'
      );

      // シングルクォートをダブルクォートに置換
      jsonContent = jsonContent.replace(/'/g, '"');

      // 末尾のカンマを修正
      jsonContent = jsonContent.replace(/,(\s*[}\]])/g, '$1');

      // contentプロパティの値が文字列化されていない場合の修正
      const contentMatch = jsonContent.match(/"content"\s*:\s*(\[\[.*?\]\])/);
      if (contentMatch && contentMatch[1]) {
        const arrayContent = contentMatch[1];
        try {
          // 配列をパースして文字列化
          const parsedArray = JSON.parse(arrayContent);
          const stringifiedArray = JSON.stringify(parsedArray);
          // 元のJSONで置換
          jsonContent = jsonContent.replace(
            /"content"\s*:\s*\[\[.*?\]\]/,
            `"content": "${stringifiedArray.replace(/"/g, '\\"')}"`
          );
        } catch (e) {
          console.error('配列のパースに失敗:', e);
        }
      }

      console.log('修正後のJSON:', jsonContent);
    } catch (e) {
      console.error('テーブルJSONの前処理に失敗:', e);
    }

    // JSONをパース
    let element;
    try {
      element = JSON.parse(jsonContent);
    } catch (e) {
      console.error('JSONパースエラー:', e);
      console.error('パースに失敗したJSON:', jsonContent);

      // 最後の手段として、正規表現でJSONオブジェクトを抽出
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          element = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error('2回目のJSONパースにも失敗:', e2);
          throw new Error('AIの応答をJSONとして解析できませんでした');
        }
      } else {
        throw new Error('AIの応答からJSONオブジェクトを抽出できませんでした');
      }
    }

    // テーブル要素の必須プロパティを確認
    if (element.type === 'table') {
      // contentの最小限の変換（文字列化）
      if (typeof element.content !== 'string') {
        element.content = JSON.stringify(element.content);
      }

      // 必須プロパティの存在確認
      if (!element.name) {
        element.name = 'table_' + Math.random().toString(36).substring(2, 9);
      }

      // サーバーサイドでの処理をログに残す
      console.log(
        'サーバーサイドで処理したテーブル要素:',
        JSON.stringify(element, null, 2)
      );
    } else {
      throw new Error('生成された要素はテーブル要素ではありません');
    }

    return element;
  } catch (error) {
    console.error('テーブル応答処理エラー:', error);
    throw error;
  }
};
