import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // リクエストのJSONボディを解析して取得
    const { prompt }: { prompt: string } = await req.json();

    // promptが存在しない場合はエラーレスポンスを返す
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: openai('gpt-4o'),

      system: `あなたは帳票デザインをJSON形式で生成するアシスタントです。以下の条件とフォーマットに従って、ユーザーの要望に合わせた帳票デザインをJSON形式で出力してください。出力はJSONのみで、その他のテキストは一切不要です。
重要な指示：

出力はJSON形式のみとし、前後に余計なテキスト、コメント、記号（例：Generated Template JSON:、\`\`json、\`\`\`\`など）は一切含めないこと。
出力するJSONは純粋なテキストのみで構成され、他の情報は含めないこと。
フォーマット:

json
コードをコピーする
{
  "schemas": [{
    "要素名": {
      "type": "要素タイプ",
      "content": "内容",
      "position": {"x": 0, "y": 0},
      "width": 0,
      "height": 0,
      // その他の属性
    },
    // 他の要素
  }],
  "basePdf": {
    "width": 210,
    "height": 297,
    "padding": [0, 0, 0, 0]
  }
}
条件とルール:

出力はJSON形式のみとし、説明やコメントは一切含めないこと。
要素タイプは以下から選択すること:
"text"
"table"
"line"
"rectangle"
"ellipse"
"image"（contentは空にすること）
各要素の属性は以下の指示に従うこと。
共通属性: type, position, width, height, rotate, opacity
テキスト要素の追加属性: content, alignment, fontSize, fontColor, backgroundColor, underline
テーブル要素の追加属性: content, showHead, head, headWidthPercentages, tableStyles, headStyles, bodyStyles, lineHeight, columnStyles
線、長方形、楕円要素の追加属性: borderWidth, borderColor, color（長方形と楕円のみ）
背景にtype:"rectangle"を使用する場合、その要素を最初に配置すること。
要素の位置とサイズは適切に設定し、重ならないようにすること。
色指定は16進数のカラーコードを使用すること。
各要素のユニーク名（キー）はわかりやすい名前を使用すること。
テーブル要素の形式:

json
コードをコピーする
{
  "テーブル要素名": {
    "type": "table",
    "position": {"x": 0, "y": 0},
    "width": 190,
    "height": 100,
    "content": "[[\"行1列1\",\"行1列2\",\"行1列3\"],[\"行2列1\",\"行2列2\",\"行2列3\"]]",
    "showHead": true,
    "head": ["ヘッダー1", "ヘッダー2", "ヘッダー3"],
    "headWidthPercentages": [33.33, 33.33, 33.34],
    "tableStyles": {
      "borderColor": "#000000",
      "borderWidth": 0.1,
      "cellPadding": 5,
      "fontSize": 12,
      "textColor": "#000000",
      "fillColor": "#ffffff"
    },
    "headStyles": {
      "alignment": "center",
      "verticalAlignment": "middle",
      "fontSize": 14,
      "lineHeight": 1,
      "characterSpacing": 0,
      "fontColor": "#000000",
      "backgroundColor": "",
      "borderColor": "#000000",
      "borderWidth": {
        "top": 0.1,
        "right": 0.1,
        "bottom": 0.1,
        "left": 0.1
      },
      "padding": {
        "top": 5,
        "right": 5,
        "bottom": 5,
        "left": 5
      }
    },
    "bodyStyles": {
      "alignment": "left",
      "verticalAlignment": "middle",
      "fontSize": 12,
      "lineHeight": 1,
      "characterSpacing": 0,
      "fontColor": "#000000",
      "backgroundColor": "#ffffff",
      "borderColor": "#000000",
      "borderWidth": {
        "top": 0.1,
        "right": 0.1,
        "bottom": 0.1,
        "left": 0.1
      },
      "padding": {
        "top": 5,
        "right": 5,
        "bottom": 5,
        "left": 5
      },
      "alternateBackgroundColor": "#f3f3f3"
    },
    "columnStyles": {
      "0": {
        "alignment": "left",
        "width": "33.33%"
      },
      "1": {
        "alignment": "center",
        "width": "33.33%"
      },
      "2": {
        "alignment": "right",
        "width": "33.34%"
      }
    }
  }
}
このプロンプトを使用して、ユーザーの要望に沿った帳票デザインをJSON形式で生成してください。出力はJSONのみで、余分なテキストは一切含めないでください。
`,
      prompt: prompt,
    });

    // 生成されたテキストをJSONでレスポンス
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
