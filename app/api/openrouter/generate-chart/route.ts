import { NextResponse } from 'next/server';

// Edge Runtimeを使用しない
// export const runtime = 'edge';

// ChartDataItemの型を定義（フロントエンドと同期）
interface ChartDataItem {
  name: string;
  value: number;
}

export async function POST(req: Request) {
  try {
    console.log('チャート生成APIが呼び出されました');
    const { prompt, chartType, dataFormat, model } = await req.json();
    console.log('受信したリクエスト:', {
      prompt,
      chartType,
      dataFormat,
      model,
    });

    if (!prompt) {
      console.log('エラー: プロンプトが提供されていません');
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      );
    }

    // OpenRouterのAPIキーを環境変数から取得
    const API_KEY = process.env.OPENROUTER_API_KEY;
    if (!API_KEY) {
      console.log('エラー: OpenRouter APIキーが設定されていません');
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is not defined' },
        { status: 500 }
      );
    }

    // 明示的な型情報をプロンプトに含める
    const typeDefinition = `
# チャートプラグインの実装と期待されるデータ形式

## 1. チャート要素の完全な構造
\`\`\`json
{
  "type": "chart",          // 要素タイプは常に "chart"
  "name": "string",         // 要素の名前（例: "売上グラフ"）
  "chartType": "bar" | "line" | "pie",  // チャートの種類
  "chartData": "string",    // JSONデータの文字列化された配列（下記の形式）
  "chartOptions": "string", // 追加オプション（通常は空のオブジェクト "{}"）
  "content": "string",      // 生成された画像のデータURL（base64）
  "position": {             // PDFにおける位置（mm単位）
    "x": number,
    "y": number
  },
  "width": number,          // 幅（mm単位）
  "height": number,         // 高さ（mm単位）
  "required": boolean       // 必須かどうか
}
\`\`\`

## 2. chartDataの期待される形式（文字列化される前）
\`\`\`typescript
interface ChartDataItem {
  name: string;  // カテゴリ名、ラベル、時間軸の値など（必ず文字列型）
  value: number; // 対応する数値（必ず数値型、引用符なし）
}

// サンプルデータ形式
const sampleData: ChartDataItem[] = [
  { name: '1月', value: 400 },
  { name: '2月', value: 300 },
  { name: '3月', value: 600 },
  { name: '4月', value: 800 },
  { name: '5月', value: 500 },
  { name: '6月', value: 350 },
];

interface ChartSchema extends Schema {
  name: string;
  chartType?: 'bar' | 'line' | 'pie'; // サポートされているチャートタイプ
  chartData?: string;                 // JSONデータ（文字列化されたChartDataItem配列）
  chartOptions?: string;              // オプション設定
}
\`\`\`

## 3. チャートタイプと特徴

### 棒グラフ (bar)
- 項目間の大きさや量を比較するのに適しています
- X軸にカテゴリ、Y軸に値を表示します
- 水平または垂直の棒で値を表現します
- 各カテゴリ（name）には独立した数値（value）が必要です

### 折れ線グラフ (line)
- 時系列データや連続的な変化を表示するのに適しています
- X軸に時間や連続するカテゴリ、Y軸に値を表示します
- ポイントを線で結んで傾向を表現します
- 名前は通常、時間や順序を示す要素（例: 月、四半期、年など）です

### 円グラフ (pie)
- 全体に対する割合や構成比を表すのに適しています
- 円を扇形に分割して各項目の割合を表現します
- 各項目の値の合計が全体（100%）を構成します
- あまりに項目が多いと見づらくなるため、5〜7項目程度が理想的です

## 4. chartDataの期待される出力形式（JSONのみ）
データは以下の形式の有効なJSONのみを返してください：

\`\`\`json
[
  { "name": "カテゴリ1", "value": 42 },
  { "name": "カテゴリ2", "value": 56 },
  { "name": "カテゴリ3", "value": 23 }
  // 推奨: 5〜10項目
]
\`\`\`

## 5. 完全なチャート要素の例
\`\`\`json
{
  "type": "chart",
  "name": "月間売上",
  "chartType": "bar",
  "chartData": "[{\"name\":\"1月\",\"value\":400},{\"name\":\"2月\",\"value\":300},{\"name\":\"3月\",\"value\":600},{\"name\":\"4月\",\"value\":800},{\"name\":\"5月\",\"value\":500},{\"name\":\"6月\",\"value\":350}]",
  "chartOptions": "{}",
  "content": "data:image/png;base64,iVBORw0KGgoA...",
  "position": {"x": 20, "y": 20},
  "width": 150,
  "height": 100,
  "required": false
}
\`\`\`

ただし、あなたはchartDataに入れるJSONデータのみを生成すればよく、他のプロパティはフロントエンドで処理されます。`;

    // チャートタイプに関する情報を追加
    const chartTypeInfo = chartType
      ? `
# チャートタイプ: ${chartType}
以下のチャートタイプに適したデータを生成してください：
${
  chartType === 'bar'
    ? '- 棒グラフ: カテゴリ比較に適しています。各カテゴリ（name）と対応する値（value）のペアを提供してください。'
    : ''
}
${
  chartType === 'line'
    ? '- 折れ線グラフ: 時系列や連続データに適しています。各時点/位置（name）と対応する値（value）のペアを提供してください。'
    : ''
}
${
  chartType === 'pie'
    ? '- 円グラフ: 全体に対する割合を示すのに適しています。各カテゴリ（name）と対応する値（value）のペアを提供してください。値の合計は100%となります。'
    : ''
}
`
      : '';

    // データフォーマットに関する情報を追加
    const dataFormatInfo = dataFormat
      ? `
# データ形式: ${dataFormat}
データは以下の形式で返してください：
${dataFormat}`
      : `
# データ形式
データは以下の形式で返してください：
[
  { "name": "項目名1", "value": 数値1 },
  { "name": "項目名2", "value": 数値2 },
  ...
]`;

    console.log('システムプロンプトを構築しています');

    // システムプロンプトの構築
    const systemPrompt = `あなたはチャートデータを生成する専門家です。
ユーザーのリクエストに基づいて、要求された形式で正確なJSONデータを生成してください。
データは実際の統計情報に基づいていることが望ましいですが、ユーザーの要望に応じて適切な架空のデータも生成できます。

${typeDefinition}
${chartTypeInfo}
${dataFormatInfo}

## 4. リクエストと応答の例

### 例1: 棒グラフ用データ
リクエスト: 「2023年の日本の四半期GDP成長率のデータを棒グラフ用に生成してください」

正しい応答:
[
  {"name": "2023年Q1", "value": 0.4},
  {"name": "2023年Q2", "value": 1.2},
  {"name": "2023年Q3", "value": -0.7},
  {"name": "2023年Q4", "value": 0.1}
]

### 例2: 折れ線グラフ用データ
リクエスト: 「2019年から2023年までの日本の年間平均気温の変化を折れ線グラフで表示したい」

正しい応答:
[
  {"name": "2019年", "value": 15.3},
  {"name": "2020年", "value": 15.7},
  {"name": "2021年", "value": 15.1},
  {"name": "2022年", "value": 15.9},
  {"name": "2023年", "value": 16.2}
]

### 例3: 円グラフ用データ
リクエスト: 「日本のモバイルOSシェアを円グラフで表示したい」

正しい応答:
[
  {"name": "iOS", "value": 68.5},
  {"name": "Android", "value": 31.1},
  {"name": "その他", "value": 0.4}
]

注意事項:
- 出力は必ず上記のJSON形式のみを返してください
- 余計な説明文やマークダウン記法は含めないでください
- 適切なデータ量は5〜10項目です
- チャートタイプに合わせて適切なデータを生成してください
- 値は適切な範囲内に収めてください
- 項目名は簡潔で分かりやすくしてください
- 数値データは現実的な値にしてください
- 生成されるJSONは直接解析されるため、構文エラーが発生しないようにしてください

【最重要】生成するのはJSON形式のデータのみです。コードブロック(\`\`\`json)、説明文、前後の文章は一切含めないでください。`;

    console.log('OpenRouter APIへのリクエストを準備しています');

    // Streamingレスポンスを作成
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // OpenRouter APIを呼び出してチャートデータを生成
    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'PDF Chart Generator',
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-3-opus:beta',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `以下のリクエストに基づいて、有効なJSONデータのみを生成してください:

${prompt}

【生成指示】
- 必ず${chartType || 'チャート'}に適したデータ形式で返してください
- データは[{"name": "項目名", "value": 数値}, ...]の形式のみで返してください
- 説明文、コードブロック、マークダウン記法は含めないでください
- JSONデータのみを返してください`,
          },
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })
      .then(async (response) => {
        console.log('OpenRouter APIからの応答を受信しました:', response.status);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('OpenRouter APIエラー:', errorData);
          const errorMessage = JSON.stringify({
            error: errorData.error || 'AIモデルからの応答に失敗しました',
          });
          writer.write(encoder.encode(errorMessage));
          writer.close();
          return;
        }

        if (!response.body) {
          console.error('OpenRouter APIのレスポンスボディがありません');
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
            console.log('受信チャンク:', chunk);

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
                    writer.write(encoder.encode(contentDelta));
                  }
                } catch (err) {
                  console.error('ストリーミングデータの解析エラー:', err, line);
                }
              } else if (line === 'data: [DONE]') {
                // ストリーミング完了
                console.log('ストリーミング完了');
              }
            }
          }

          console.log('応答データの累積:', accumulatedContent);

          // 空の応答チェックと最終データ送信
          if (!accumulatedContent.trim()) {
            console.error('生成されたデータが空です');
            // 空の場合はデフォルトのダミーデータを返す
            const dummyData = JSON.stringify([
              { name: 'データ1', value: 100 },
              { name: 'データ2', value: 200 },
              { name: 'データ3', value: 150 },
            ]);
            writer.write(encoder.encode(dummyData));
            console.log('ダミーデータを返します:', dummyData);
          } else {
            // 累積データがJSON形式かどうかチェック（デバッグ用）
            try {
              const parsedData = JSON.parse(accumulatedContent.trim());
              console.log('生成されたデータは有効なJSONです:', parsedData);

              // データが適切な形式かチェック
              if (Array.isArray(parsedData)) {
                const isValid = parsedData.every(
                  (item) =>
                    typeof item === 'object' &&
                    item !== null &&
                    'name' in item &&
                    'value' in item &&
                    typeof item.name === 'string' &&
                    typeof item.value === 'number'
                );
                console.log('データが期待される形式に準拠しているか:', isValid);

                // データが期待される形式でない場合は修正を試みる
                if (!isValid) {
                  console.log('データ形式の修正を試みます');
                  const fixedData = Array.isArray(parsedData)
                    ? parsedData.map((item) => ({
                        name: String(
                          item.name ||
                            `項目${Math.random().toString(36).substring(2, 7)}`
                        ),
                        value: Number(
                          item.value || Math.floor(Math.random() * 100)
                        ),
                      }))
                    : [
                        { name: 'データ1', value: 100 },
                        { name: 'データ2', value: 200 },
                        { name: 'データ3', value: 150 },
                      ];
                  const fixedDataString = JSON.stringify(fixedData);
                  writer.write(encoder.encode(fixedDataString));
                  console.log('修正されたデータを返します:', fixedDataString);
                }
              } else {
                console.log('生成されたデータは配列ではありません');
                const dummyData = JSON.stringify([
                  { name: 'データ1', value: 100 },
                  { name: 'データ2', value: 200 },
                  { name: 'データ3', value: 150 },
                ]);
                writer.write(encoder.encode(dummyData));
                console.log(
                  '配列でないため、ダミーデータを返します:',
                  dummyData
                );
              }
            } catch (e) {
              console.error('生成されたデータは有効なJSONではありません:', e);

              // 無効なJSONの場合はJSON形式に変換を試みる
              try {
                // JSON風の内容を抽出（sフラグなし）
                const jsonPattern = /\[(.*?)\]/g;
                const match = accumulatedContent.match(jsonPattern);
                if (match) {
                  const extractedJson = match[0].trim();
                  console.log('抽出されたJSON風テキスト:', extractedJson);

                  try {
                    // パースして検証
                    const fixedData = JSON.parse(extractedJson);
                    const validatedData = Array.isArray(fixedData)
                      ? fixedData.map((item) => ({
                          name: String(
                            item.name ||
                              `項目${Math.random()
                                .toString(36)
                                .substring(2, 7)}`
                          ),
                          value: Number(
                            item.value || Math.floor(Math.random() * 100)
                          ),
                        }))
                      : [
                          { name: 'データ1', value: 100 },
                          { name: 'データ2', value: 200 },
                          { name: 'データ3', value: 150 },
                        ];
                    const validatedDataString = JSON.stringify(validatedData);
                    writer.write(encoder.encode(validatedDataString));
                    console.log(
                      '修正されたJSONデータを返します:',
                      validatedDataString
                    );
                  } catch {
                    // 抽出してもパースできない場合
                    throw new Error('JSON抽出に失敗しました');
                  }
                } else {
                  throw new Error('JSON構造が見つかりません');
                }
              } catch (extractError) {
                console.error('JSONデータの抽出と修正に失敗:', extractError);
                // 最終手段としてダミーデータを返す
                const dummyData = JSON.stringify([
                  { name: 'データ1', value: 100 },
                  { name: 'データ2', value: 200 },
                  { name: 'データ3', value: 150 },
                ]);
                writer.write(encoder.encode(dummyData));
                console.log(
                  '修正失敗のため、ダミーデータを返します:',
                  dummyData
                );
              }
            }
          }
        } catch (error) {
          console.error('ストリーミング読み取りエラー:', error);
          writer.write(
            encoder.encode(
              JSON.stringify({
                error: `エラーが発生しました: ${
                  error instanceof Error ? error.message : '不明なエラー'
                }`,
              })
            )
          );
        } finally {
          writer.close();
        }
      })
      .catch((error) => {
        console.error('ストリーミングAPIリクエストエラー:', error);
        writer.write(
          encoder.encode(
            `エラーが発生しました: ${
              error instanceof Error ? error.message : '不明なエラー'
            }`
          )
        );
        writer.close();
      });

    // ストリーミングレスポンスを返す
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('チャートデータ生成エラー:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'チャートデータの生成中にエラーが発生しました',
      },
      { status: 500 }
    );
  }
}
