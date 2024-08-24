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

これらの基本構成とルールに従って、ユーザーの要望に合わせたPDFテンプレート（帳票）デザインをJSONフォーマットで作成してください。

tableを使う際は、
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
      "borderWidth": 1,
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
      "fontColor": "#ffffff",
      "backgroundColor": "#4a86e8",
      "borderColor": "#000000",
      "borderWidth": {
        "top": 1,
        "right": 1,
        "bottom": 1,
        "left": 1
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
}この形式で作成してください。`,
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
