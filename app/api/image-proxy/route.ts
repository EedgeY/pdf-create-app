import { NextResponse } from 'next/server';

// プレースホルダー画像（Base64エンコード）- 小さな灰色の画像
const PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA50lEQVR4nO3bQQ6CMBRF0Y/7X6dxIH9AFBqo5ZyZScw1YdCXEHIcAAAAAAAAAAAAAAAAwL+7nO24P86+xdfdrq+dYvZ9uXe+3PsFhEgJkRIiJURKiJQQKSFSQqSESAmREiIlREqIlBApIVJCpIRICZESIiVESoiUECkhUkKkhEgJkRIiJURKiJQQKSFSQqSESAmREiIlREqIlBApIVJCpIRICZESIiVESoiUECkhUkKkhEgJkRIiJURKiNTsD9S4zbexn/1iOHtutNkvi82+r9k/MphNiJQQKSFSQqSESAmRWiLkNnm/5TsLAAAAAAAAAAAAAAAAYGcvn9kWyq9Yb3wAAAAASUVORK5CYII=';

/**
 * 画像をBase64にエンコードするAPIエンドポイント
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json(
      { error: '画像URLが指定されていません' },
      { status: 400 }
    );
  }

  console.log(`サーバー側で画像を取得中: ${imageUrl}`);

  try {
    // 画像をフェッチ
    const response = await fetch(imageUrl, {
      headers: {
        Accept: 'image/*',
      },
      next: { revalidate: 3600 }, // 1時間キャッシュ
    });

    if (!response.ok) {
      console.error(`HTTP エラー: ${response.status} (${imageUrl})`);
      // プレースホルダー画像を返す
      return NextResponse.json({
        dataUrl: PLACEHOLDER_IMAGE,
        error: `HTTP エラー: ${response.status}`,
      });
    }

    // 画像のMIMEタイプを取得
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.error(`無効なコンテンツタイプ: ${contentType} (${imageUrl})`);
      return NextResponse.json({
        dataUrl: PLACEHOLDER_IMAGE,
        error: '無効なコンテンツタイプ',
      });
    }

    // 画像のバイナリデータを取得
    const imageBuffer = await response.arrayBuffer();

    // サイズチェック（空でないか）
    if (imageBuffer.byteLength === 0) {
      console.error(`空の画像データ (${imageUrl})`);
      return NextResponse.json({
        dataUrl: PLACEHOLDER_IMAGE,
        error: '空の画像データ',
      });
    }

    // Base64にエンコード
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    console.log(`画像変換成功: ${imageUrl.substring(0, 30)}...`);
    return NextResponse.json({ dataUrl });
  } catch (error) {
    console.error('画像取得エラー:', error);
    return NextResponse.json({
      dataUrl: PLACEHOLDER_IMAGE,
      error: '画像取得エラー',
    });
  }
}

/**
 * POST リクエストでも同じ処理を実行（URLが長い場合のため）
 */
export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: '画像URLが指定されていません' },
        { status: 400 }
      );
    }

    console.log(`サーバー側で画像を取得中: ${imageUrl}`);

    // 画像をフェッチ
    const response = await fetch(imageUrl, {
      headers: {
        Accept: 'image/*',
      },
      next: { revalidate: 3600 }, // 1時間キャッシュ
    });

    if (!response.ok) {
      console.error(`HTTP エラー: ${response.status} (${imageUrl})`);
      return NextResponse.json({
        dataUrl: PLACEHOLDER_IMAGE,
        error: `HTTP エラー: ${response.status}`,
      });
    }

    // 画像のMIMEタイプを取得
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      console.error(`無効なコンテンツタイプ: ${contentType} (${imageUrl})`);
      return NextResponse.json({
        dataUrl: PLACEHOLDER_IMAGE,
        error: '無効なコンテンツタイプ',
      });
    }

    // 画像のバイナリデータを取得
    const imageBuffer = await response.arrayBuffer();

    // Base64にエンコード
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    console.log(`画像変換成功: ${imageUrl.substring(0, 30)}...`);
    return NextResponse.json({ dataUrl });
  } catch (error) {
    console.error('リクエスト処理エラー:', error);
    return NextResponse.json({
      dataUrl: PLACEHOLDER_IMAGE,
      error: 'リクエスト処理エラー',
    });
  }
}
