# PDF 生成 AI プロンプトガイド（完全版・修正）

## 1. 基本要件

- 請求書テンプレートは A4 サイズ（210mm x 297mm）
- 日本語フォント（NotoSerifJP-Regular）を使用
- 標準的な請求書要素を含む
  - ヘッダー（ロゴ、タイトル）
  - 請求先情報
  - 請求書情報（番号、発行日）
  - 商品明細表
  - 合計金額（小計、消費税、総額）
  - 支払情報

## 2. 必須フィールドと仕様

### 2.1 ヘッダー

```json
{
  "type": "text",
  "position": { "x": 120, "y": 20 },
  "width": 70,
  "height": 23,
  "content": "INVOICE",
  "fontSize": 40,
  "fontName": "NotoSerifJP-Regular",
  "alignment": "left"
}
```

### 2.2 請求先情報

```json
{
  "type": "text",
  "position": { "x": 20, "y": 68 },
  "width": 85,
  "height": 34,
  "content": "株式会社サンプル\n東京都新宿区1-2-3\nTEL: 03-1234-5678",
  "fontSize": 13,
  "fontName": "NotoSerifJP-Regular",
  "lineHeight": 1.2
}
```

### 2.3 商品明細表（必須仕様）

```json
{
  "type": "table",
  "position": { "x": 20, "y": 111 },
  "width": 170,
  "height": "auto",
  "content": "[{\"商品名\":\"商品A\",\"数量\":2,\"単価\":5000,\"合計\":10000}]",
  "showHead": true,
  "head": ["商品", "数量", "単価", "合計"],
  "headWidthPercentages": [50, 15, 20, 15],
  "tableStyles": {
    "borderWidth": 0.1,
    "borderColor": "#000000"
  },
  "headStyles": {
    "fontSize": 13,
    "alignment": "center",
    "backgroundColor": "#f3f4f6",
    "padding": {
      "top": 5,
      "bottom": 5
    }
  },
  "bodyStyles": {
    "fontSize": 13,
    "alignment": {
      "0": "left",
      "3": "right"
    },
    "padding": {
      "top": 5,
      "bottom": 5
    }
  }
}
```

## 3. エラーハンドリング仕様

| エラー種別           | 検出条件                   | 対応策                                 |
| -------------------- | -------------------------- | -------------------------------------- |
| 必須フィールド欠如   | 必須プロパティが存在しない | エラーメッセージを表示し、処理を中断   |
| データ形式不正       | JSON 形式が不正            | エラーメッセージと共に不正な箇所を指摘 |
| フォント読み込み失敗 | 指定フォントが存在しない   | デフォルトフォントを使用し警告を表示   |
| 画像読み込み失敗     | 画像ファイルが存在しない   | プレースホルダーを表示し警告を記録     |

## 4. 動作確認項目

1. テーブルが正しく表示されること
2. 日本語フォントが適切に表示されること
3. 動的データが正しく挿入されること
4. 計算フィールドが正しく動作すること
5. PDF 生成時にエラーが発生しないこと
