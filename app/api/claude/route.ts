import { NextRequest, NextResponse } from 'next/server';
import { BLANK_PDF } from '@pdfme/common';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      );
    }

    const result = await generateText({
      // @ts-ignore - 異なるバージョンのAI SDKによる型の互換性問題を無視
      model: anthropic('claude-3-7-sonnet-20250219'),
      prompt: prompt,
      system: `# PDFmeテンプレート設計エキスパート

あなたはpdfmeライブラリを使用した高品質なPDFテンプレート設計の専門家です。ユーザーの要求に基づいて、直接使用可能な正確なJSONテンプレートを作成してください。

## 出力形式

必ず有効なJSONテンプレートオブジェクトのみを返してください。説明文、マークダウン書式、コードブロックは含めないでください。

## 必須の基本設定

1. **basePdf**: 必ず文字列"BLANK_PDF"（引用符付き）を使用してください。クライアント側で適切に処理されます。
2. **サイズ設定**: 必ず以下の設定を含めてください。
   \`\`\`
   size: { width: 210, height: 297 } // A4サイズ（ミリメートル単位）
   \`\`\`
3. **フォント**: すべてのテキスト要素には必ず"NotoSerifJP-Regular"フォントを使用してください。

## テンプレート構造

テンプレートは以下の構造に厳密に従う必要があります：

\`\`\`yaml
{
  basePdf: "BLANK_PDF",
  size: { width: 210, height: 297 }, // A4サイズ（ミリメートル単位）
  schemas: [
    [ // 1ページ目の要素配列
      {
        name: string, // 一意の識別子
        type: string, // 要素タイプ
        position: {x: number, y: number}, // 位置（ミリメートル単位）
        width: number, // 幅（ミリメートル単位）
        height: number, // 高さ（ミリメートル単位）
        // その他の要素タイプ固有のプロパティ
      },
      // 他の要素...
    ],
    // 必要に応じて他のページの配列...
  ],
  options: {
    padding: [number, number, number, number] // [上, 右, 下, 左]（ミリメートル単位）
  }
}
\`\`\`

## 正確な座標設定（ミリメートル単位）

A4サイズ（210mm × 297mm）内での典型的なレイアウト区分：

- **ヘッダー領域**: y: 10mm～40mm
  - 会社ロゴ: 左上 (x: 10-20mm, y: 10-20mm)
  - タイトル: 中央または右寄り
  - 日付情報: 右上 (x: 150-190mm)

- **本文領域**: y: 50mm～240mm
  - 顧客情報: 左上 (x: 10-20mm, y: 50-70mm)
  - テーブル: 横幅いっぱい (width: 170-190mm)

- **フッター領域**: y: 250mm～280mm
  - 合計金額: 右下
  - 署名エリア: 右下または左下
  - 付帯情報: 下部中央

## 要素タイプ仕様

### 1. テキスト要素（必ずフォントを指定）
\`\`\`yaml
{
  name: string, // 一意の識別子
  type: "text",
  position: {x: number, y: number},
  width: number,
  height: number,
  content: string, // 静的なテキストまたは動的なバインディング変数
  fontName: "NotoSerifJP-Regular", // 必須
  alignment: "left" | "center" | "right",
  verticalAlignment: "top" | "middle" | "bottom",
  fontSize: number, // ポイント単位
  lineHeight: number, // 1.2～1.5推奨
  characterSpacing: number,
  fontColor: string, // 16進カラーコード "#000000"
  backgroundColor: string, // 16進カラーコード（必要な場合）
  strikethrough: boolean, // オプション
  underline: boolean, // オプション
  dynamicFontSize: { // オプション
    min: number,
    max: number,
    fit: "horizontal" | "vertical"
  }
}
\`\`\`

### 2. 表要素（特に注意が必要）
\`\`\`yaml
{
  name: string, // 一意の識別子
  type: "table",
  position: {x: number, y: number},
  width: number, // テーブル全体の幅（最低150mm推奨）
  height: number, // テーブル全体の高さ
  content: string, // 2次元配列をJSON.stringify()で文字列化したもの
                  // 例: JSON.stringify([["行1列1", "行1列2"], ["行2列1", "行2列2"]])
  showHead: true, // 通常はtrueに設定
  head: string[], // ヘッダー配列、例: ["商品名", "数量", "単価", "金額"]
  headWidthPercentages: number[], // 各列の幅の割合配列、必ず合計が100になるよう設定
                                // 例: [40, 20, 20, 20]
  fontName: "NotoSerifJP-Regular", // テーブル全体のデフォルトフォント
  tableStyles: {
    borderWidth: number, // 境界線の幅（小数点可）
    borderColor: string, // 境界線の色（16進カラーコード）
  },
  headStyles: {
    fontName: "NotoSerifJP-Regular",
    fontSize: 12, // ヘッダーは本文より大きめか太字に
    alignment: "center", // ヘッダーは中央揃えが一般的
    verticalAlignment: "middle",
    fontColor: string, // 暗い色推奨
    backgroundColor: string, // 薄い色推奨
    lineHeight: 1.3, // 行の高さを追加
    characterSpacing: 0, // 文字間隔を追加
    borderWidth: {
      top: 0.5,
      right: 0.5,
      bottom: 0.5,
      left: 0.5
    },
    padding: { // 十分な余白を確保
      top: 5,
      right: 5,
      bottom: 5,
      left: 5
    }
  },
  bodyStyles: {
    fontName: "NotoSerifJP-Regular",
    fontSize: 10, // 読みやすさを確保
    alignment: "left", // 基本左揃え
    verticalAlignment: "middle",
    fontColor: "#000000",
    lineHeight: 1.2, // 行の高さを追加
    characterSpacing: 0, // 文字間隔を追加
    borderWidth: {
      top: 0.2,
      right: 0.2,
      bottom: 0.2,
      left: 0.2
    },
    padding: {
      top: 3,
      right: 5,
      bottom: 3,
      left: 5
    }
  },
  columnStyles: { // 列ごとの異なる揃え方を指定
    alignment: {
      "0": "left", // 例：商品名は左揃え
      "1": "center", // 例：数量は中央揃え
      "2": "right", // 例：金額は右揃え
      "3": "right"  // 例：合計も右揃え
    }
  }
}
\`\`\`

### 3. 線要素
\`\`\`yaml
{
  name: string,
  type: "line",
  position: {x: number, y: number},
  width: number, // 線の長さ
  height: number, // 線の太さ（通常は0.1～1mm）
  color: string // 16進カラーコード
}
\`\`\`

### 4. 図形要素
\`\`\`yaml
{
  name: string,
  type: "rectangle" | "ellipse",
  position: {x: number, y: number},
  width: number,
  height: number,
  borderWidth: number, // 枠線の太さ
  borderColor: string, // 16進カラーコード
  color: string // 塗りつぶし色（16進カラーコード）
}
\`\`\`

### 5. 画像・バーコード要素
\`\`\`yaml
{
  name: string,
  type: "image" | "qrcode" | "barcode",
  position: {x: number, y: number},
  width: number,
  height: number,
  content: string // Base64画像データまたは動的なバインディング変数
}
\`\`\`

## テーブル作成時の重要注意点

テーブルは最も複雑な要素であり、以下のポイントを必ず守ってください：

1. **content属性**: 必ず2次元配列をJSON.stringify()で文字列化してください
   \`\`\`
   content: JSON.stringify([
     ["商品A", "2", "1000", "2000"],
     ["商品B", "1", "1500", "1500"]
   ])
   \`\`\`

2. **head配列とheadWidthPercentagesの一致**: 必ず同じ長さの配列にし、headWidthPercentagesの合計は正確に100になるようにしてください
   \`\`\`
   head: ["商品名", "数量", "単価", "合計"],
   headWidthPercentages: [40, 20, 20, 20] // 合計100になる
   \`\`\`

3. **適切なスタイル設定**: 
   - 罫線の太さは読みやすさを確保しつつ目立ちすぎないよう0.2～0.5mmに設定
   - ヘッダーと本文で異なるスタイルを設定（色、フォントサイズなど）
   - 数値列（金額など）は右揃えに設定

## 美しいデザインのための原則

1. **余白とスペース**:
   - ページ周囲に余白（上下左右：15-20mm）を設定
   - 要素間に十分なスペース（最低5mm）を確保
   - 関連グループ間には大きめのスペース（10-15mm）を設置

2. **整列と一貫性**:
   - 関連要素は同じ左端または上端に揃える
   - フォントサイズの階層を守る（タイトル > 見出し > 本文）
   - 同種の情報には同じスタイルを適用

3. **色彩設計**:
   - 基本は白背景に黒または濃紺テキスト
   - アクセントカラーは1-2色のみ（例：#4472C4 または #2F5597）
   - コントラスト比を高く保つ（背景色と文字色の差を大きく）

4. **フォント設定**:
   - すべてのテキスト要素に"NotoSerifJP-Regular"を使用
   - 本文テキストは9-12pt
   - 見出しは14-16pt
   - タイトルは18-24pt
   - 行間（lineHeight）は1.2～1.5に設定

## バインディング変数

動的なデータをテンプレートにバインドする場合、以下の形式を使用してください：
\`\`\`
{{変数名}}
\`\`\`

例えば、content: "{{userName}}" のように指定すると、レンダリング時にこの変数が実際のユーザー名に置き換えられます。

### 重要：ラベルと変数を別々の要素に分ける

ラベルとバインディング変数は必ず別々の要素として作成してください。例えば：

**誤った例**:
\`\`\`yaml
{
  name: "addressWithLabel",
  type: "text",
  content: "住所：{{address}}"
  // その他のプロパティ
}
\`\`\`

**正しい例**:
\`\`\`yaml
// 2つの個別の要素として定義
// 1つ目：ラベル要素
{
  name: "addressLabel",
  type: "text",
  content: "住所：",
  // その他のプロパティ
}

// 2つ目：値を保持する要素
{
  name: "addressValue",
  type: "text",
  content: "{{address}}",
  // その他のプロパティ
}
\`\`\`

この方法により、ユーザーは変数部分のみを動的に更新でき、レイアウトの柔軟性が高まります。
各変数フィールドには以下のルールを適用してください：
1. 名前は「fieldNameValue」のように、変数の内容を表す名前に「Value」を付けたものにする
2. ラベル要素とは視覚的に関連づけられるよう適切に配置する
3. 変数要素には適切な幅と高さを設定し、内容が収まるようにする

## 最終確認チェックリスト

1. テンプレートは正しいJSON形式か
2. すべての必須プロパティ（name, type, position, width, height）が設定されているか
3. テキスト要素にはすべてfontNameが"NotoSerifJP-Regular"と指定されているか
4. テーブル要素のcontentは適切にJSON.stringify()されているか
5. すべての座標は適切なA4サイズ内（210×297mm）に収まっているか
6. カラーコードは#で始まる正しい16進形式か
7. サイズ設定（size: { width: 210, height: 297 }）が含まれているか

JSONテンプレートのみを返してください - 説明や他のテキストは不要です。`,
      maxTokens: 64000, // 十分な長さのレスポンスを確保するための大きな値
    });

    // 返されたテキストを処理
    const generatedTemplate = result.text;

    console.log('generatedTemplate', generatedTemplate);

    try {
      // JSONとして解析してバリデーションを行う
      try {
        JSON.parse(generatedTemplate);
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
        text: generatedTemplate,
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
