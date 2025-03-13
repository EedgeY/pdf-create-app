import type {
  Plugin,
  Schema,
  UIRenderProps,
  PDFRenderProps,
  PropPanel,
} from '@pdfme/common';
import { image } from '@pdfme/schemas';

// URLImageスキーマの定義
interface URLImageSchema extends Schema {
  imageUrl?: string;
  name: string;
  position: { x: number; y: number }; // positionは必須
  width: number;
  height: number;
  type: string;
  content?: string; // 画像のデータURL（Base64）
}

// プレースホルダー画像（Base64エンコード）- 小さな灰色の画像
const PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA50lEQVR4nO3bQQ6CMBRF0Y/7X6dxIH9AFBqo5ZyZScw1YdCXEHIcAAAAAAAAAAAAAAAAwL+7nO24P86+xdfdrq+dYvZ9uXe+3PsFhEgJkRIiJURKiJQQKSFSQqSESAmREiIlREqIlBApIVJCpIRICZESIiVESoiUECkhUkKkhEgJkRIiJURKiJQQKSFSQqSESAmREiIlREqIlBApIVJCpIRICZESIiVESoiUECkhUkKkhEgJkRIiJURKiNTsD9S4zbexn/1iOHtutNkvi82+r9k/MphNiJQQKSFSQqSESAmRWiLkNnm/5TsLAAAAAAAAAAAAAAAAYGcvn9kWyq9Yb3wAAAAASUVORK5CYII=';

// キャッシュのためのMap（グローバルスコープに定義）
const imageCache = new Map<string, string>();

// URLから画像をフェッチしてData URLに変換する関数
const fetchImageAsDataURL = async (url: string): Promise<string | null> => {
  if (!url || url.trim() === '') {
    console.warn('空のURLが指定されました');
    return PLACEHOLDER_IMAGE;
  }

  // キャッシュにある場合はそれを返す
  if (imageCache.has(url)) {
    console.log(`キャッシュされた画像を使用: ${url}`);
    return imageCache.get(url)!;
  }

  // データURLの場合は、直接それを返す
  if (url.startsWith('data:')) {
    console.log('データURLを直接使用');
    return url;
  }

  try {
    // サーバーサイドのAPIを使用して画像をBase64に変換
    console.log(`サーバーを通じて画像変換中: ${url}`);

    // URLエンコードして安全に渡す
    const encodedUrl = encodeURIComponent(url);

    // URLが長すぎる場合はPOSTリクエストを使用
    let response;
    if (encodedUrl.length > 1500) {
      // POSTリクエストを使用（URLが長い場合）
      response = await fetch('/api/image-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: url }),
      });
    } else {
      // GETリクエストを使用（URLが短い場合）
      response = await fetch(`/api/image-proxy?url=${encodedUrl}`);
    }

    if (!response.ok) {
      console.error(`画像プロキシAPIエラー: ${response.status}`);
      return PLACEHOLDER_IMAGE;
    }

    const result = await response.json();

    if (result.error) {
      console.warn(`画像変換エラー: ${result.error}`);
    }

    // 変換されたデータURLを取得
    const dataUrl = result.dataUrl;

    if (!dataUrl) {
      console.error('データURLが返されませんでした');
      return PLACEHOLDER_IMAGE;
    }

    // キャッシュに保存
    imageCache.set(url, dataUrl);
    console.log(`画像をデータURLに変換しました: ${url}`);
    return dataUrl;
  } catch (error) {
    console.error('画像の取得エラー:', error);
    return PLACEHOLDER_IMAGE;
  }
};

// URLからデータURLへの自動変換処理関数
const convertImageUrlToDataUrl = async (
  imageUrl: string | undefined,
  onChange: ((change: { key: string; value: any }) => void) | undefined
) => {
  if (!onChange || !imageUrl || imageUrl.trim() === '') {
    return;
  }

  console.log(`画像URL変換開始: ${imageUrl}`);

  try {
    const dataUrl = await fetchImageAsDataURL(imageUrl);
    if (dataUrl) {
      console.log('content値を更新します');
      onChange({ key: 'content', value: dataUrl });
    } else {
      console.warn('データURLへの変換に失敗しました');
      onChange({ key: 'content', value: PLACEHOLDER_IMAGE });
    }
  } catch (error) {
    console.error('画像変換エラー:', error);
    onChange({ key: 'content', value: PLACEHOLDER_IMAGE });
  }
};

// UIにレンダリングするための関数
const uiRender = async ({
  schema,
  value,
  rootElement,
  mode,
  onChange,
}: UIRenderProps<URLImageSchema>) => {
  // 既存の内容をクリア
  rootElement.innerHTML = '';
  rootElement.style.overflow = 'hidden';

  const { imageUrl } = schema;

  // valueからcontentを取得（anyでキャスト）
  const anyValue = value as any;
  const content = anyValue?.content;

  // 型安全な方法でデータURLチェック
  const isDataUrl = typeof content === 'string' && content.startsWith('data:');

  // スキーマにimageUrlがあり、contentがない場合は変換実行
  if (onChange && imageUrl && !isDataUrl) {
    console.log('初期レンダリング時のURL変換を実行します');
    convertImageUrlToDataUrl(imageUrl, onChange);
  }

  if (!imageUrl) {
    // 画像URLがない場合のプレースホルダー表示
    showPlaceholder(rootElement, 'URLを入力してください');
    return;
  }

  try {
    // フォームモードの場合はURLの入力フィールドを表示
    if (mode === 'form' || mode === 'designer') {
      const wrapper = document.createElement('div');
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';

      // 画像プレビューを表示
      const preview = document.createElement('div');
      preview.style.flex = '1';
      preview.style.display = 'flex';
      preview.style.justifyContent = 'center';
      preview.style.alignItems = 'center';
      preview.style.overflow = 'hidden';

      const img = document.createElement('img');
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.objectFit = 'contain';

      // contentがあればそれを優先して表示
      img.src = isDataUrl ? content : imageUrl;
      img.alt = 'URL Image';

      // 画像読み込みエラー時のフォールバック
      img.onerror = () => {
        console.error('画像の読み込みに失敗しました:', imageUrl);
        img.src = PLACEHOLDER_IMAGE;
        if (onChange) {
          onChange({ key: 'content', value: PLACEHOLDER_IMAGE });
        }
      };

      preview.appendChild(img);
      wrapper.appendChild(preview);

      // デザイナーモードの場合は入力フィールドも表示
      if (mode === 'designer') {
        const inputContainer = document.createElement('div');
        inputContainer.style.padding = '4px';
        inputContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = imageUrl || '';
        input.placeholder = '画像URLを入力';
        input.style.width = '100%';
        input.style.padding = '4px';
        input.style.boxSizing = 'border-box';

        // URLが変更されたときのイベントハンドラ
        input.addEventListener('change', () => {
          if (onChange) {
            // 画像URLを更新
            onChange({ key: 'imageUrl', value: input.value });

            // URL変更時にデータURLに変換してcontentを更新
            convertImageUrlToDataUrl(input.value, onChange);
          }
        });

        inputContainer.appendChild(input);
        wrapper.appendChild(inputContainer);
      }

      rootElement.appendChild(wrapper);
    } else {
      // ビューアーモードの場合は画像のみ表示
      const img = document.createElement('img');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      img.src = isDataUrl ? content : imageUrl;
      img.alt = 'URL Image';

      // 画像読み込みエラー時のフォールバック
      img.onerror = () => {
        console.error('ビューアーモードで画像の読み込みに失敗しました');
        img.src = PLACEHOLDER_IMAGE;
      };

      rootElement.appendChild(img);
    }

    // 画像URLがあり、まだデータURLに変換されていない場合は変換を実行
    if (onChange && imageUrl && !isDataUrl) {
      console.log('レンダリング後のURL変換を実行します');
      convertImageUrlToDataUrl(imageUrl, onChange);
    }
  } catch (error) {
    console.error('UIでの画像レンダリングエラー:', error);
    showPlaceholder(rootElement, '画像の読み込みエラー');
  }
};

// プレースホルダー表示用のヘルパー関数
const showPlaceholder = (element: HTMLElement, text: string) => {
  element.style.display = 'flex';
  element.style.justifyContent = 'center';
  element.style.alignItems = 'center';
  element.style.backgroundColor = '#f0f0f0';
  element.style.color = 'red';
  element.style.fontSize = '12px';
  element.style.padding = '8px';
  element.style.textAlign = 'center';
  element.textContent = text;
};

// プロパティパネルの設定
const propPanel: PropPanel<URLImageSchema> = {
  defaultSchema: {
    type: 'urlimage',
    name: 'URL Image',
    width: 100,
    height: 100,
    position: { x: 0, y: 0 },
    imageUrl: '',
    content: PLACEHOLDER_IMAGE, // プレースホルダー画像をデフォルトで設定
  },
  schema: {
    imageUrl: {
      title: '画像URL',
      type: 'string',
      format: 'input',
      placeholder: 'https://example.com/image.jpg',
    },
    width: {
      title: '幅',
      type: 'number',
      widget: 'slider',
      min: 10,
      max: 1000,
    },
    height: {
      title: '高さ',
      type: 'number',
      widget: 'slider',
      min: 10,
      max: 1000,
    },
    rotate: {
      title: '回転',
      type: 'number',
      widget: 'slider',
      min: 0,
      max: 360,
    },
  },
};

// アイコンの定義（SVG）
const icon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path fill="none" d="M0 0h24v24H0z"/>
  <path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor"/>
  <path d="M6 3h12l4 4v10l-4 4H6l-4-4V7l4-4z" fill="none" stroke="currentColor" stroke-width="1"/>
  <path d="M12 7v10M7 12h10" fill="none" stroke="currentColor" stroke-width="1"/>
</svg>
`;

// プラグインの定義
const urlimage: Plugin<URLImageSchema> = {
  // 標準のimage.pdfレンダラーを使用
  pdf: image.pdf,
  ui: uiRender,
  propPanel,
  icon,
};

export default urlimage;
