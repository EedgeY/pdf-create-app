import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

// 環境変数からFAL APIキーを設定
if (process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_KEY,
  });
} else {
  console.warn('警告: FAL_KEY環境変数が設定されていません。');
}

interface GenerateImagesRequest {
  prompt: string;
  count: number;
  aspect_ratio?: string;
  negative_prompt?: string;
}

// FAL AIのレスポンス型を定義
interface FalImageFile {
  url: string;
  content_type?: string;
  file_name?: string;
  file_size?: number;
  file_data?: string;
}

interface FalImagen3Response {
  images: FalImageFile[];
  seed: number;
}

export async function POST(req: Request) {
  try {
    // リクエストデータを解析
    const {
      prompt,
      count,
      aspect_ratio = '1:1',
      negative_prompt = '',
    } = (await req.json()) as GenerateImagesRequest;

    // バリデーション
    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      );
    }

    // 画像数を1〜4に制限（API制限に合わせる）
    const numImages = Math.min(Math.max(1, count), 4);

    console.log('FAL AIへのリクエスト準備:', {
      prompt,
      numImages,
      aspect_ratio,
      negative_prompt,
    });

    // FAL AIで画像生成
    const response = await fal.subscribe('fal-ai/imagen3', {
      input: {
        prompt,
        num_images: numImages,
        aspect_ratio,
        negative_prompt,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log(
            '処理中...',
            update.logs.map((log) => log.message)
          );
        }
      },
    });

    // 結果データを取得
    const result = response.data as FalImagen3Response;

    // 結果をログに出力
    console.log('FAL AI応答結果:', {
      imageCount: result.images?.length || 0,
      seed: result.seed,
    });

    // クライアントへのレスポンス作成
    const images = result.images?.map((img) => img.url) || [];

    return NextResponse.json({
      images,
      seed: result.seed,
    });
  } catch (error: any) {
    console.error('FAL AI画像生成エラー:', error);
    return NextResponse.json(
      {
        error: error.message || '画像生成中にエラーが発生しました',
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
