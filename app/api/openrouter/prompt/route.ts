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

    // 改善したプロンプト生成用のシステムプロンプト
    const systemPrompt = `あなたは高品質でクリエイティブなPDFテンプレートのプロンプト生成AIです。
ユーザーの要望に基づき、技術的指示に留まらず、感性に訴える表現やインスピレーションを喚起するアイデアを盛り込んだ、魅力的なデザインプロンプトを作成してください。

以下の点を考慮して、具体的かつ豊かな表現で詳細なプロンプトを生成してください：
1. テンプレートの種類: ${templateType || 'ユーザーの希望に合わせた種類'}
2. ドキュメントサイズ: ${documentSize || 'A4サイズ（210mm × 297mm）'}
3. カラースキーム: ${
      colorScheme || 'プロフェッショナルで見やすい配色（例: #336699, #FFFFFF）'
    }
4. デザインスタイル: ${style || 'モダンでクリーン、あるいは温かみのある雰囲気'}

【デザイン詳細】
- レイアウト構成: ヘッダー、本文、フッターのバランスと比率、視覚的アクセントを加える配置
- 視覚的階層: 情報の重要度に応じた強弱付け、比喩的表現を検討
- 余白設定: 読みやすさと美しさを両立する具体的な余白（上下左右の推奨値）
- グリッドシステム: 一貫性ある柔軟な配置提案
- タイポグラフィ: 見出し、本文、注釈などの適切なフォント（例: 'Noto Sans JP', 'Noto Serif JP','Roboto')とサイズ
- アクセントカラー: メインカラーを引き立てる補助色の使用方法
- ビジュアル要素: ロゴ、アイコン、区切り線、背景パターンなど、独自のアート要素も取り入れる
- 印刷適性: 印刷時の視認性や美しさを考慮した調整

【追加クリエイティブ指示】
- 未来的、クラシック、ミニマル、レトロなど多様なデザインコンセプトの可能性を示すこと
- ターゲットユーザーや利用シーンを想起させる具体的な表現を盛り込むこと
- 印象に残る独自のアート的要素や色彩のアクセントを加えること

【重要】テンプレートは必ず1ページに収まるように設計してください。スキーマは以下の形式で記述してください：
schema: [
  [要素配列]
]

ページに収まるように以下の点に注意してください：
- 要素数を必要最小限に抑える（25個以下を推奨）
- テキストフィールドは簡潔に
- テーブルを使用する場合は行数を制限（最大3行程度）
- 余白を適切に設定（読みやすさを確保する：推奨値として上下5mm、左右10mm程度）
- フォントサイズを調整（見出し：12-16pt、本文：10-12pt、注釈：8-9pt程度）

【テーブル作成時の重要注意点】
テーブルを含める場合は、必ずcontentプロパティにダミーデータを含めてください。
例：
"content": "[[\"商品A\",\"1\",\"1000\",\"1000\"],[\"商品B\",\"2\",\"2000\",\"4000\"],[\"商品C\",\"3\",\"1500\",\"4500\"],[\"　\",\"　\",\"　\",\"　\"],[\"　\",\"　\",\"　\",\"　\"]]"

空のセルでも必ず値（空白文字など）を入れてください。undefinedや空の文字列だけにしないでください。
テーブルの各行は必ず列数を合わせてください。

${
  templateType
    ? `【${templateType}向け特別デザイン提案】
${templateType}に最適な以下の要素も検討してください：
- 業界標準のレイアウトパターン
- ${templateType}特有の必須項目と配置
- 専門性を感じさせるデザイン要素
- 記入のしやすさと読みやすさの両立`
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
      promptPrefix = `${randomType}のPDFテンプレートを生成するためのプロンプトを作成してください。プロフェッショナルで美しく、かつ機能的なデザインにしてください。必ず1ページに収まるようにコンパクトで効率的なレイアウトにし、テーブルを含む場合はダミーデータを必ず挿入してください。視覚的階層を意識し、独自のアート要素やカラフルなアクセントを取り入れた、魅力的なデザインを目指してください。`;
    } else {
      promptPrefix = `${templateType}のPDFテンプレートを生成するためのプロンプトを作成してください。プロフェッショナルで美しく、かつ機能的なデザインにしてください。必ず1ページに収まるようにコンパクトで効率的なレイアウトにし、テーブルを含む場合はダミーデータを必ず挿入してください。視覚的階層を意識し、独自のアート要素やカラフルなアクセントを取り入れた、魅力的なデザインを目指してください。`;
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
