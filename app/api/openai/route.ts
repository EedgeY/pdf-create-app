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

      system: `下記のフォーマットに沿って、ユーザーから依頼される帳票のデザインをjson形式で提示せよ。
    出力はjsonのみ。一切のほかの言葉はいりません。
    ＊＊＊
    {
  "schemas": [{
    "要素名": {
      "type": "要素タイプ",
      "content": "内容",
      "position": {"x": 0, "y": 0},
      "width": 0,
      "height": 0,
      ...その他の属性
    },
    ...他の要素
  }],
  "basePdf": {
    "width": 210,
    "height": 297,
    "padding": [0, 0, 0, 0]
  }
}

＊＊＊
完全に＊＊＊この間の形だけで純粋なtextとして生成してください。


  この構造で出力してください。
  また、ユーザーの要望に沿った適切な要素を選択し配置すること。
1. 基本構造:

{
  "schemas": [{
    "要素名": {
      "type": "要素タイプ",
      "content": "内容",
      "position": {"x": 0, "y": 0},
      "width": 0,
      "height": 0,
      ...その他の属性
    },
    ...他の要素
  }],
  "basePdf": {
    "width": 210,
    "height": 297,
    "padding": [0, 0, 0, 0]
  }
}


2. 要素タイプ:
   - text: テキスト要素
   - table: テーブル要素
   - line: 線要素
   - rectangle: 長方形要素
   - ellipse: 楕円要素
   - image: 画像要素（データ量が大きいため、type、position、サイズのみ指定）

3. 共通の重要属性:
   - type: 要素タイプ
   - position: 要素の位置（x, y座標）
   - width: 要素の幅
   - height: 要素の高さ
   - rotate: 回転角度
   - opacity: 不透明度

4. テキスト要素の追加属性:
   - content: テキスト内容
   - alignment: テキストの水平位置 (left | center | right)
   - fontSize: フォントサイズ
   - fontColor: フォントの色
   - backgroundColor: 背景色
   - underline: 下線の有無 (false | true)

5. テーブル要素の追加属性:
   - content: テーブルの内容（JSON文字列形式の二次元配列）
   - showHead: ヘッダーの表示 (true | false)
   - head: ヘッダーの内容
   - headWidthPercentages: 各列の幅の割合
   - tableStyles: テーブル全体のスタイル
   - headStyles: ヘッダーのスタイル
   - bodyStyles: 本文のスタイル
　- lineHeight:行の高さ
   - columnStyles: 列ごとのスタイル

6. 線、長方形、楕円要素の追加属性:
   - borderWidth: 線の太さ
   - borderColor: 線の色
   - color: 塗りつぶしの色（長方形と楕円のみ）

7. ルール:
   - テンプレート全体のサイズはA4サイズ（210mm x 297mm）を基本とする
   - 要素の位置とサイズは適切に設定し、重ならないようにする
   - テーブルを使用する場合は、ヘッダーと本文のスタイルを詳細に指定する
   - 色指定は16進数カラーコードを使用する
   - 画像要素を使用する場合は、データ量を考慮してtype、position、サイズのみを指定する
   - 各要素のユニーク名（キー）は、わかりやすい名前を使用する

8. テンプレート作成時の注意点:
   - ユーザーの要望に沿った適切な要素を選択し配置する
   - 読みやすさと美観を考慮したデザインにする
   - 必要に応じて装飾的な要素（線や図形）を追加し、視覚的な魅力を高める
   - テーブルを使用する場合は、ヘッダーと本文のスタイルを適切に区別する
   - 色使いは全体的な統一感を持たせる

9.使用できる要素:
{"schemas":[{"入力項目1":{"type":"text","icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-text-cursor-input\"><path d=\"M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1\"/><path d=\"M13 20h-1a3 3 0 0 1-3-3 3 3 0 0 1-3 3H5\"/><path d=\"M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1\"/><path d=\"M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7\"/><path d=\"M9 7v10\"/></svg>","content":"Type Something...","position":{"x":0,"y":0},"width":45,"height":10,"rotate":0,"alignment":"left","verticalAlignment":"top","fontSize":13,"lineHeight":1,"characterSpacing":0,"fontColor":"#000000","backgroundColor":"","opacity":1,"strikethrough":false,"underline":false},"入力項目2":{"type":"readOnlyText","icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-type\"><polyline points=\"4 7 4 4 20 4 20 7\"/><line x1=\"9\" x2=\"15\" y1=\"20\" y2=\"20\"/><line x1=\"12\" x2=\"12\" y1=\"4\" y2=\"20\"/></svg>","content":"Type Something...","position":{"x":0,"y":10.06},"width":45,"height":10,"rotate":0,"alignment":"left","verticalAlignment":"top","fontSize":13,"lineHeight":1,"characterSpacing":0,"fontColor":"#000000","backgroundColor":"","opacity":1,"strikethrough":false,"underline":false,"readOnly":true},"入力項目3":{"type":"table","icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-table\"><path d=\"M12 3v18\"/><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/><path d=\"M3 9h18\"/><path d=\"M3 15h18\"/></svg>","position":{"x":0,"y":21.5},"width":150,"height":43.75920000000001,"content":"[[\"row1|col1\",\"row1|col2\",\"row1|col3\"],[\"row2|col1\",\"row2|col2\",\"row2|col3\"]]","showHead":true,"head":["header","header2","header3"],"headWidthPercentages":[30,30,40],"tableStyles":{"borderColor":"#000000","borderWidth":0.3},"headStyles":{"alignment":"left","verticalAlignment":"middle","fontSize":13,"lineHeight":1,"characterSpacing":0,"fontColor":"#ffffff","backgroundColor":"#2980ba","borderColor":"","borderWidth":{"top":0,"right":0,"bottom":0,"left":0},"padding":{"top":5,"bottom":5,"left":5,"right":5}},"bodyStyles":{"alignment":"left","verticalAlignment":"middle","fontSize":13,"lineHeight":1,"characterSpacing":0,"fontColor":"#000000","backgroundColor":"","borderColor":"#888888","borderWidth":{"top":0.1,"bottom":0.1,"left":0.1,"right":0.1},"padding":{"top":5,"bottom":5,"left":5,"right":5},"alternateBackgroundColor":"#f5f5f5"},"columnStyles":{}},"入力項目4":{"type":"line","icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-minus\"><path d=\"M5 12h14\"/></svg>","position":{"x":0,"y":72.88},"width":50,"height":1,"rotate":0,"opacity":1,"readOnly":true,"color":"#000000"},"入力項目5":{"type":"rectangle","position":{"x":0,"y":81.91},"width":62.5,"height":37.5,"rotate":0,"opacity":1,"borderWidth":1,"borderColor":"#000000","color":"","readOnly":true,"icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-square\"><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/></svg>"},"入力項目6":{"type":"ellipse","position":{"x":0,"y":121.93},"width":62.5,"height":37.5,"rotate":0,"opacity":1,"borderWidth":1,"borderColor":"#000000","color":"","readOnly":true,"icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-circle\"><circle cx=\"12\" cy=\"12\" r=\"10\"/></svg>"},"入力項目7":{"type":"image","icon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-image\"><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/></svg>","content":"data:image/png;base64,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","position":{"x":0,"y":162.76},"width":40,"height":40,"rotate":0,"opacity":1}}],"basePdf":{"width":210,"height":297,"padding":[0,0,0,0]},"pdfmeVersion":"4.0.0"}

10.背景にtype:Rectangleを使うときの注意点
  - 背景にtype:Rectangleを使うときは、その要素を一番初めに配置する必要があります。＊最後に配置すると全部が背景に覆いかぶさってしまいます。
これらの基本構成とルールに従って、ユーザーの要望に合わせたPDFテンプレート（帳票）デザインをJSONフォーマットで作成してください。

11.imageを使うときは長くなるので、contentは空にしてください。

＊＊＊＊tableを使う際は最重要＊＊＊＊、
{
  "tableElement": {
    "type": "table",
    "position": {
      "x": 0,
      "y": 0
    },
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
}この形式で作成してください。
  この構造で出力してください。
  また、ユーザーの要望に沿った適切な要素を選択し配置すること。

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
