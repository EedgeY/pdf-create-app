import { NextRequest, NextResponse } from 'next/server';

// 利用可能なモデルのリスト
const AVAILABLE_MODELS = ['google/gemini-2.0-flash-001'];

export async function POST(req: NextRequest) {
  try {
    const { templateType, documentSize, colorScheme, style } = await req.json();

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
3. カラースキーム: ${colorScheme || 'プロフェッショナルで見やすい配色'}
4. デザインスタイル: ${style || 'モダンでクリーンなデザイン'}

【デザイン詳細】
- レイアウト構成: ヘッダー、本文、フッターの詳細な配置と比率
- 視覚的階層: 情報の重要度に応じた視覚的な強弱をつける方法
- 余白設定: 読みやすさと美しさを両立する適切な余白設定（上下左右それぞれ推奨値を指定）
- グリッドシステム: 整列と一貫性のある要素配置のためのグリッド提案
- タイポグラフィ: 見出し、本文、注釈などに適したフォントファミリーとサイズの組み合わせ
- アクセントカラー: メインカラーに対して効果的なアクセントカラーの使用方法
- ビジュアル要素: ロゴ、アイコン、区切り線、背景パターンなどの効果的な使用方法
- 印刷適性: 印刷時の見やすさを考慮した色調や線の太さの指定

【重要】テンプレートは必ず1ページに収まるように設計してください。スキーマは以下の形式で記述してください：
schema: [
  [要素配列]
]

ページに収まるように以下の点に注意してください：
- 要素数を必要最小限に抑える（10個以下を推奨）
- テキストフィールドは簡潔に
- テーブルを使用する場合は行数を制限（最大5行程度）
- 余白を適切に設定（読みやすさを確保する：推奨値として上下20mm、左右15mm程度）
- フォントサイズを調整（見出し：14-18pt、本文：10-12pt、注釈：8-9pt程度）

【テーブル作成時の重要注意点】
テーブルを含める場合は、必ずcontentプロパティにダミーデータを含めてください。
例：
"content": "[[\"商品A\",\"1\",\"1000\",\"1000\"],[\"商品B\",\"2\",\"2000\",\"4000\"],[\"商品C\",\"3\",\"1500\",\"4500\"],[\"　\",\"　\",\"　\",\"　\"],[\"　\",\"　\",\"　\",\"　\"]]"

空のセルでも必ず値（空白文字など）を入れてください。undefinedや空の文字列だけにしないでください。
テーブルの各行は必ず列数を合わせてください。

【デザイン要素の具体的な指定方法】
- 色指定: HEX値または RGB値で具体的に（例: #336699, rgb(51, 102, 153)）
- フォント: 日本語環境で使いやすいフォントファミリー（例: 'Noto Sans JP', 'Hiragino Sans', 'Meiryo'）
- 線種: 実線/点線/破線の使い分けと太さ（例: 「solid 1px」「dashed 2px」）
- 角丸: 要素の角を丸める程度（例: 「border-radius: 4px」）
- 影効果: 立体感を出すためのシャドウ効果（例: 「box-shadow: 0 2px 4px rgba(0,0,0,0.1)」）
- 強調手法: 重要情報の視認性を高める方法（枠線、背景色、フォントウェイトなど）

${
  templateType
    ? `【${templateType}向け特別デザイン提案】
${templateType}に最適な以下の要素も検討してください：
- 業界標準のレイアウトパターン
- ${templateType}特有の必須項目と配置
- 専門性を感じさせる適切なデザイン要素
- 記入のしやすさと読みやすさのバランス`
    : ''
}

出力形式は単純なテキストのみで、マークダウンや装飾は不要です。
日本語で400文字から600文字程度の具体的なプロンプトを生成してください。`;

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
        '名刺',
        'チラシ',
        'メニュー表',
        '予約表',
        '案内状',
      ];
      const randomType =
        templateTypes[Math.floor(Math.random() * templateTypes.length)];
      promptPrefix = `${randomType}のPDFテンプレートを生成するためのプロンプトを作成してください。プロフェッショナルで美しく、かつ機能的なデザインにしてください。必ず1ページに収まるようにコンパクトで効率的なレイアウトにしてください。テーブルを含める場合は、必ずダミーデータを入れてください。視覚的階層を意識した、読みやすく情報が整理されたデザインを心がけてください。`;
    } else {
      promptPrefix = `${templateType}のPDFテンプレートを生成するためのプロンプトを作成してください。プロフェッショナルで美しく、かつ機能的なデザインにしてください。必ず1ページに収まるようにコンパクトで効率的なレイアウトにしてください。テーブルを含める場合は、必ずダミーデータを入れてください。視覚的階層を意識した、読みやすく情報が整理されたデザインを心がけてください。`;
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
          max_tokens: 1500,
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
