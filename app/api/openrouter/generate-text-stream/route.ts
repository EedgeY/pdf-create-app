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

利用可能なフォント:
- Helvetica
- Times-Roman
- Courier
- IPAMincho
- IPAGothic

${colorInfo}

純粋なJSONオブジェクトの配列のみを返し、マークダウン表記や説明文は含めないでください。`;

    // Streamingレスポンスを作成
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // 非同期でOpenRouterのストリーミングAPIにリクエストを送信
    fetch('https://openrouter.ai/api/v1/chat/completions', {
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
        stream: true, // ストリーミングモードを有効化
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = JSON.stringify({
            error: errorData.error || 'AIモデルからの応答に失敗しました',
          });
          writer.write(encoder.encode(errorMessage));
          writer.close();
          return;
        }

        if (!response.body) {
          writer.write(
            encoder.encode(
              JSON.stringify({ error: 'レスポンスボディがありません' })
            )
          );
          writer.close();
          return;
        }

        const reader = response.body.getReader();
        let accumulatedContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // バイナリデータをテキストに変換
            const chunk = new TextDecoder().decode(value);

            // OpenRouterのストリーミングレスポンスは "data: {...}" の形式
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.substring(6));
                  const contentDelta = data.choices[0]?.delta?.content || '';
                  if (contentDelta) {
                    accumulatedContent += contentDelta;

                    // 累積コンテンツをクライアントに送信
                    writer.write(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          content: accumulatedContent,
                          delta: contentDelta,
                          model: data.model,
                        })}\n\n`
                      )
                    );
                  }
                } catch (err) {
                  console.error('ストリーミングデータの解析エラー:', err);
                }
              } else if (line === 'data: [DONE]') {
                // ストリーミング完了
                writer.write(encoder.encode(`data: [DONE]\n\n`));
              }
            }
          }
        } catch (err) {
          console.error('ストリーミング読み取りエラー:', err);
          writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                error: '読み取りエラーが発生しました',
              })}\n\n`
            )
          );
        } finally {
          writer.close();
        }
      })
      .catch((err) => {
        console.error('ストリーミングAPIリクエストエラー:', err);
        writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              error: err.message || '不明なエラーが発生しました',
            })}\n\n`
          )
        );
        writer.close();
      });

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('API処理エラー:', error);
    return NextResponse.json(
      { error: error.message || '不明なエラーが発生しました' },
      { status: 500 }
    );
  }
}
