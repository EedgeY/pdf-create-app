import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, model, elementType } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json({ error: 'モデルが必要です' }, { status: 400 });
    }

    if (
      !elementType ||
      (elementType !== 'text' &&
        elementType !== 'table' &&
        elementType !== 'multi' &&
        elementType !== 'multi-text' &&
        elementType !== 'multi-table')
    ) {
      return NextResponse.json(
        {
          error:
            '有効な要素タイプが必要です (text, table, multi, multi-text, multi-table)',
        },
        { status: 400 }
      );
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'API設定が不完全です' },
        { status: 500 }
      );
    }

    // 要素タイプに基づいてシステムプロンプトを設定
    let systemPrompt = '';

    if (elementType === 'text') {
      systemPrompt = `あなたはPDFテンプレートの単一テキスト要素作成の専門家です。
ユーザーの要求に従い、PDFmeライブラリのテキスト要素JSONスキーマを作成してください。

以下のスキーマに準拠したテキスト要素のJSONオブジェクトのみを返してください：
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
}

使用可能なフォント一覧：
- NotoSerifJP-Regular (日本語セリフフォント、デフォルト)
- NotoSansJP-Regular (日本語サンセリフフォント)
- NotoSansKR-Regular (韓国語サンセリフフォント)
- MeaCulpa-Regular (筆記体の装飾フォント)
- MonsieurLaDoulaise-Regular (エレガントな筆記体フォント)
- RozhaOne-Regular (太くて強調されたセリフフォント)
- Roboto (標準的な欧文フォント)

注意点：
1. 位置（position）は通常、x:10～180mm, y:10～280mm範囲内で指定
2. 幅と高さは内容に合わせて適切に設定
3. ユーザーの要求に応じて適切なフォントを選択してください

純粋なJSONオブジェクトのみを返し、マークダウン表記や説明文は含めないでください。`;
    } else if (elementType === 'table') {
      systemPrompt = `あなたはPDFテンプレートの単一テーブル要素作成の専門家です。
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
    "borderWidth": 数値,
    "borderColor": "カラーコード"
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

重要な注意点：
1. contentは必ずJSON.stringify()で文字列化した2次元配列にしてください
   例：JSON.stringify([["項目1", "項目2"], ["値1", "値2"]])
2. head配列とheadWidthPercentagesの長さは一致させ、後者の合計は必ず100になるようにしてください
3. 位置（position）は通常、x:10～50mm, y:10～280mm範囲内で指定
4. ユーザーの要求に応じて適切なフォントを選択してください
5. headStylesとbodyStylesには必ず必要なすべてのプロパティを含めてください
6. columnStylesには列ごとの配置を必ず指定してください（テキスト列は左揃え、数値列は右揃えが一般的）

純粋なJSONオブジェクトのみを返し、マークダウン表記や説明文は含めないでください。`;
    } else if (elementType === 'multi') {
      systemPrompt = `あなたはPDFテンプレートの複数要素作成の専門家です。
ユーザーの要求に従い、PDFmeライブラリの複数の要素（テキストとテーブル）のJSONスキーマを作成してください。

【重要】以下の厳格なフォーマットルールに従ってください：
1. 各JSONオブジェクトは完全な形式で記述し、プロパティ間には必ずカンマを入れてください
2. 各JSONオブジェクトの最後には必ず閉じ括弧 } を入れてください
3. 複数のJSONオブジェクトは、間に空行を入れて区切ってください
4. マークダウン記法（\`\`\`json など）は使用しないでください
5. 配列記号 ([]) は使用せず、個々のJSONオブジェクトをそのまま返してください
6. 各JSONオブジェクトは以下のテンプレートに厳密に従ってください
7. 各プロパティの後には必ずカンマを入れ、最後のプロパティの後にはカンマを入れないでください

利用可能な要素タイプ:

1. テキスト要素:
{
  "name": "要素名",
  "type": "text",
  "position": {"x": 数値, "y": 数値},
  "width": 数値,
  "height": 数値,
  "content": "テキスト内容",
  "fontName": "フォント名",
  "fontSize": 数値,
  "alignment": "left/center/right",
  "verticalAlignment": "top/middle/bottom",
  "lineHeight": 数値,
  "fontColor": "カラーコード"
}

2. テーブル要素:
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
    "borderWidth": 数値,
    "borderColor": "カラーコード"
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

注意点：
1. 位置（position）は通常、x:10～180mm, y:10～280mm範囲内で指定
2. 幅と高さは内容に合わせて適切に設定
3. ユーザーの要求に応じて適切なフォントを選択してください
4. テーブル要素のheadとheadWidthPercentagesの長さは一致させ、合計が100%になるようにしてください
5. 必ず2つ以上の要素を作成してください
6. テーブルのcontentは必ずJSON.stringify()で文字列化した2次元配列にしてください

以下は正しい例です：
{
  "name": "heading1",
  "type": "text",
  "position": {"x": 20, "y": 20},
  "width": 160,
  "height": 10,
  "content": "タイトル",
  "fontName": "NotoSansJP-Regular",
  "fontSize": 14,
  "alignment": "center",
  "verticalAlignment": "middle",
  "lineHeight": 1.3,
  "fontColor": "#333333"
}

{
  "name": "table1",
  "type": "table",
  "position": {"x": 20, "y": 40},
  "width": 160,
  "height": 40,
  "content": "[[\"項目\", \"値\"], [\"A\", \"100\"], [\"B\", \"200\"]]",
  "showHead": true,
  "head": ["項目", "値"],
  "headWidthPercentages": [50, 50],
  "fontName": "NotoSerifJP-Regular",
  "tableStyles": {
    "borderWidth": 0.2,
    "borderColor": "#000000"
  },
  "headStyles": {
    "fontName": "NotoSerifJP-Regular",
    "fontSize": 12,
    "alignment": "center",
    "verticalAlignment": "middle",
    "fontColor": "#000000",
    "backgroundColor": "#f3f4f6",
    "lineHeight": 1.3,
    "characterSpacing": 0,
    "borderWidth": {
      "top": 0.5,
      "right": 0.5,
      "bottom": 0.5,
      "left": 0.5
    },
    "padding": {
      "top": 5,
      "right": 5,
      "bottom": 5,
      "left": 5
    }
  },
  "bodyStyles": {
    "fontName": "NotoSerifJP-Regular",
    "fontSize": 10,
    "alignment": "left",
    "verticalAlignment": "middle",
    "fontColor": "#000000",
    "backgroundColor": "#ffffff",
    "lineHeight": 1.2,
    "characterSpacing": 0,
    "borderWidth": {
      "top": 0.2,
      "right": 0.2,
      "bottom": 0.2,
      "left": 0.2
    },
    "padding": {
      "top": 3,
      "right": 5,
      "bottom": 3,
      "left": 5
    }
  },
  "columnStyles": {
    "alignment": {
      "0": "left",
      "1": "right"
    }
  }
}

純粋なJSONオブジェクトのみを返し、マークダウン表記や説明文は含めないでください。`;
    } else if (elementType === 'multi-text') {
      systemPrompt = `あなたはPDFテンプレートの複数テキスト要素作成の専門家です。
ユーザーの要求に従い、PDFmeライブラリの複数のテキスト要素のJSONスキーマを作成してください。

【重要】以下の厳格なフォーマットルールに従ってください：
1. 各JSONオブジェクトは完全な形式で記述し、プロパティ間には必ずカンマを入れてください
2. 各JSONオブジェクトの最後には必ず閉じ括弧 } を入れてください
3. 複数のJSONオブジェクトは、間に空行を入れて区切ってください
4. マークダウン記法（\`\`\`json など）は使用しないでください
5. 配列記号 ([]) は使用せず、個々のJSONオブジェクトをそのまま返してください
6. 各JSONオブジェクトは以下のテンプレートに厳密に従ってください
7. 各プロパティの後には必ずカンマを入れ、最後のプロパティの後にはカンマを入れないでください
8. 複数の要素を返す場合、各要素の後にカンマを入れ、最後の要素の後にはカンマを入れないでください

テキスト要素のテンプレート:
{
  "name": "要素名",
  "type": "text",
  "position": {"x": 数値, "y": 数値},
  "width": 数値,
  "height": 数値,
  "content": "テキスト内容",
  "fontName": "フォント名",
  "fontSize": 数値,
  "alignment": "left/center/right",
  "verticalAlignment": "top/middle/bottom",
  "lineHeight": 数値,
  "fontColor": "カラーコード"
}

使用可能なフォント一覧：
- NotoSerifJP-Regular (日本語セリフフォント、デフォルト)
- NotoSansJP-Regular (日本語サンセリフフォント)
- NotoSansKR-Regular (韓国語サンセリフフォント)
- MeaCulpa-Regular (筆記体の装飾フォント)
- MonsieurLaDoulaise-Regular (エレガントな筆記体フォント)
- RozhaOne-Regular (太くて強調されたセリフフォント)
- Roboto (標準的な欧文フォント)

注意点：
1. 位置（position）は通常、x:10～180mm, y:10～280mm範囲内で指定
2. 幅と高さは内容に合わせて適切に設定
3. ユーザーの要求に応じて適切なフォントを選択してください
4. 必ず2つ以上のテキスト要素を作成してください
5. テーブル要素は作成しないでください、必ずすべてtext要素としてください
6. 各プロパティの後には必ずカンマを入れ、最後のプロパティの後にはカンマを入れないでください

以下は正しい例です（複数要素の場合、最後の要素以外の後にカンマを入れる）：
{
  "name": "heading1",
  "type": "text",
  "position": {"x": 20, "y": 20},
  "width": 160,
  "height": 10,
  "content": "タイトル",
  "fontName": "NotoSansJP-Regular",
  "fontSize": 14,
  "alignment": "center",
  "verticalAlignment": "middle",
  "lineHeight": 1.3,
  "fontColor": "#333333"
},
{
  "name": "paragraph1",
  "type": "text",
  "position": {"x": 20, "y": 40},
  "width": 160,
  "height": 30,
  "content": "本文テキスト",
  "fontName": "NotoSerifJP-Regular",
  "fontSize": 12,
  "alignment": "left",
  "verticalAlignment": "top",
  "lineHeight": 1.4,
  "fontColor": "#555555"
}

純粋なJSONオブジェクトのみを返し、マークダウン表記や説明文は含めないでください。`;
    } else if (elementType === 'multi-table') {
      systemPrompt = `あなたはPDFテンプレートの複数テーブル要素作成の専門家です。
ユーザーの要求に従い、PDFmeライブラリの複数のテーブル要素のJSONスキーマを作成してください。

【重要】以下の厳格なフォーマットルールに従ってください：
1. 各JSONオブジェクトは完全な形式で記述し、プロパティ間には必ずカンマを入れてください
2. 各JSONオブジェクトの最後には必ず閉じ括弧 } を入れてください
3. 複数のJSONオブジェクトは、間に空行を入れて区切ってください
4. マークダウン記法（\`\`\`json など）は使用しないでください
5. 配列記号 ([]) は使用せず、個々のJSONオブジェクトをそのまま返してください
6. 各JSONオブジェクトは以下のテンプレートに厳密に従ってください
7. 各プロパティの後には必ずカンマを入れ、最後のプロパティの後にはカンマを入れないでください
8. 複数の要素を返す場合、各要素の後にカンマを入れ、最後の要素の後にはカンマを入れないでください

テーブル要素のテンプレート:
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

重要な注意点：
1. contentは必ずJSON.stringify()で文字列化した2次元配列にしてください
   例：JSON.stringify([["項目1", "項目2"], ["値1", "値2"]])
2. head配列とheadWidthPercentagesの長さは一致させ、後者の合計は必ず100になるようにしてください
3. 位置（position）は通常、x:10～50mm, y:10～280mm範囲内で指定
4. ユーザーの要求に応じて適切なフォントを選択してください
5. headStylesとbodyStylesには必ず必要なすべてのプロパティを含めてください
6. columnStylesには列ごとの配置を必ず指定してください（テキスト列は左揃え、数値列は右揃えが一般的）
7. 必ず2つ以上のテーブル要素を作成してください

以下は正しい例です（複数要素の場合、最後の要素以外の後にカンマを入れる）：
{
  "name": "table1",
  "type": "table",
  "position": {"x": 20, "y": 20},
  "width": 170,
  "height": 40,
  "content": "[[\"商品A\", \"1000\"], [\"商品B\", \"1500\"]]",
  "showHead": true,
  "head": ["商品名", "価格"],
  "headWidthPercentages": [60, 40],
  "fontName": "NotoSerifJP-Regular",
  "tableStyles": {
    "borderWidth": 0,
    "borderColor": "#ffffff"
  },
  "headStyles": {
    "fontName": "NotoSerifJP-Regular",
    "fontSize": 12,
    "alignment": "center",
    "verticalAlignment": "middle",
    "fontColor": "#000000",
    "backgroundColor": "#f3f4f6",
    "lineHeight": 1.3,
    "characterSpacing": 0,
    "borderWidth": {
      "top": 0.5,
      "right": 0.5,
      "bottom": 0.5,
      "left": 0.5
    },
    "padding": {
      "top": 5,
      "right": 5,
      "bottom": 5,
      "left": 5
    }
  },
  "bodyStyles": {
    "fontName": "NotoSerifJP-Regular",
    "fontSize": 10,
    "alignment": "left",
    "verticalAlignment": "middle",
    "fontColor": "#000000",
    "backgroundColor": "#ffffff",
    "lineHeight": 1.2,
    "characterSpacing": 0,
    "borderWidth": {
      "top": 0.2,
      "right": 0.2,
      "bottom": 0.2,
      "left": 0.2
    },
    "padding": {
      "top": 3,
      "right": 5,
      "bottom": 3,
      "left": 5
    }
  },
  "columnStyles": {
    "alignment": {
      "0": "left",
      "1": "right"
    }
  }
},
{
  "name": "table2",
  "type": "table",
  "position": {"x": 20, "y": 70},
  "width": 170,
  "height": 40,
  "content": "[[\"項目A\", \"説明\"], [\"項目B\", \"説明\"]]",
  "showHead": true,
  "head": ["項目", "説明"],
  "headWidthPercentages": [30, 70],
  "fontName": "NotoSerifJP-Regular",
  "tableStyles": {
    "borderWidth": 0.2,
    "borderColor": "#000000"
  },
  "headStyles": {
    "fontName": "NotoSerifJP-Regular",
    "fontSize": 12,
    "alignment": "center",
    "verticalAlignment": "middle",
    "fontColor": "#000000",
    "backgroundColor": "#f3f4f6",
    "lineHeight": 1.3,
    "characterSpacing": 0,
    "borderWidth": {
      "top": 0.5,
      "right": 0.5,
      "bottom": 0.5,
      "left": 0.5
    },
    "padding": {
      "top": 5,
      "right": 5,
      "bottom": 5,
      "left": 5
    }
  },
  "bodyStyles": {
    "fontName": "NotoSerifJP-Regular",
    "fontSize": 10,
    "alignment": "left",
    "verticalAlignment": "middle",
    "fontColor": "#000000",
    "backgroundColor": "#ffffff",
    "lineHeight": 1.2,
    "characterSpacing": 0,
    "borderWidth": {
      "top": 0.2,
      "right": 0.2,
      "bottom": 0.2,
      "left": 0.2
    },
    "padding": {
      "top": 3,
      "right": 5,
      "bottom": 3,
      "left": 5
    }
  },
  "columnStyles": {
    "alignment": {
      "0": "left",
      "1": "left"
    }
  }
}

### "tableStyles"は必ず"borderWidth": 0, "borderColor": "#ffffff"にしてください


純粋なJSONオブジェクトのみを返し、マークダウン表記や説明文は含めないでください。`;
    }

    // OpenRouter APIに送信するペイロード
    const payload = {
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
      model: model,
      temperature: 0.3,
      max_tokens: 1500,
    };

    // OpenRouter APIにリクエスト
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://your-app-url.com',
          'X-Title': 'PDF Template App',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      return NextResponse.json(
        { error: 'AIモデルからの応答がありません' },
        { status: 500 }
      );
    }

    const messageContent = data.choices[0].message.content;

    try {
      // レスポンスからJSONを解析
      const text = messageContent
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();

      console.log('AIからの応答テキスト:', text);

      // JSONオブジェクトを抽出
      const jsonObjects: string[] = [];
      let depth = 0;
      let startIndex = -1;

      // 文字列を1文字ずつ処理して、完全なJSONオブジェクトを抽出
      for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '{') {
          if (depth === 0) {
            startIndex = i;
          }
          depth++;
        } else if (char === '}') {
          depth--;
          if (depth === 0 && startIndex !== -1) {
            // 完全なJSONオブジェクトを抽出
            const jsonObj = text.substring(startIndex, i + 1);
            jsonObjects.push(jsonObj);
            startIndex = -1;
          }
        }
      }

      if (jsonObjects.length === 0) {
        return NextResponse.json(
          { error: '有効なJSONオブジェクトが見つかりませんでした' },
          { status: 400 }
        );
      }

      console.log(`${jsonObjects.length}個のJSONオブジェクトを検出しました`);

      const elements = [];
      for (const jsonStr of jsonObjects) {
        try {
          const element = JSON.parse(jsonStr);
          if (element && element.type) {
            // 要素タイプのフィルタリングを削除
            elements.push(element);
          }
        } catch (parseError) {
          console.warn('JSONパースエラーでスキップします:', parseError);
          // カンマ不足の可能性があるため、自動的に追加して再試行
          try {
            // "Expected ',' or '}' after property value in JSON" エラーの場合
            if (
              parseError instanceof SyntaxError &&
              parseError.message.includes("Expected ',' or '}'")
            ) {
              console.log('カンマ不足の可能性があります。修正を試みます...');

              // プロパティ間にカンマを追加
              const fixedJson = jsonStr.replace(
                /(["}0-9])\s*"([a-zA-Z])/g,
                '$1,"$2'
              );
              console.log('修正したJSON:', fixedJson);

              const element = JSON.parse(fixedJson);
              if (element && element.type) {
                // 要素タイプのフィルタリングを削除
                console.log('JSONの修正に成功しました');
                elements.push(element);
              }
            }
          } catch (fixError) {
            console.warn('JSON修正にも失敗しました:', fixError);
          }
        }
      }

      if (elements.length > 0) {
        return NextResponse.json({
          elements,
          model: data.model,
        });
      } else {
        return NextResponse.json(
          { error: '有効な要素が見つかりませんでした' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('要素生成エラー:', error);
      return NextResponse.json(
        { error: '要素生成中にエラーが発生しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('要素生成エラー:', error);
    return NextResponse.json(
      { error: '要素生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
