'use client';

import { Plugin, Schema, ZOOM, UIRenderProps } from '@pdfme/common';
import { image } from '@pdfme/schemas';

// PDF反映用のイメージプラグインをインポート
const basePdfPlugin = image.pdf;

// SVGをPNGデータURLに変換する関数
export const svgToPngDataURL = (svgElement: SVGElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // サイズ制限を設定
      const maxWidth = 1200;
      const maxHeight = 1200;

      // SVG文字列を作成
      const svgString = new XMLSerializer().serializeToString(svgElement);

      // Base64エンコードしたSVGデータURL
      const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
      const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

      // タイムアウト処理の追加
      const timeout = setTimeout(() => {
        reject(new Error('画像の読み込みがタイムアウトしました'));
      }, 5000);

      const image = new Image();

      // 画像サイズを制限
      const originalWidth = svgElement.clientWidth || 500; // デフォルト値を設定
      const originalHeight = svgElement.clientHeight || 400;

      // アスペクト比を維持しながらサイズを制限
      let width = originalWidth * 2; // 高解像度化
      let height = originalHeight * 2;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }

      image.onload = () => {
        clearTimeout(timeout);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        // スケーリング係数を計算
        const scaleX = width / originalWidth;
        const scaleY = height / originalHeight;

        ctx.scale(scaleX, scaleY);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);

        try {
          // PNGのみを使用し、品質パラメータを調整
          const dataUrl = canvas.toDataURL('image/png', 0.9);

          // データURLの形式を検証
          if (!dataUrl.startsWith('data:image/png;base64,')) {
            reject(new Error('無効なデータURL形式です'));
            return;
          }

          resolve(dataUrl);
        } catch (e) {
          console.error('データURL生成エラー:', e);
          reject(e);
        }
      };

      image.onerror = (e) => {
        clearTimeout(timeout);
        console.error('画像読み込みエラー:', e);
        reject(e);
      };

      // Base64エンコードされたデータURLを使用（CORS問題を回避）
      image.src = svgDataUrl;
    } catch (error) {
      console.error('SVG変換エラー:', error);
      reject(error);
    }
  });
};

// 一意のIDを生成する関数
function generateStableId() {
  return Math.random().toString(36).substring(2, 11);
}

// スキーマの定義
interface ReactTailwindSchema extends Schema {
  name: string;
  reactCode?: string; // Reactコード
  svgData?: string; // SVG形式のデータ
  instanceId?: string; // インスタンスID
}

// デフォルトのReactコード
const defaultReactCode = `
import React from 'react';

export default function Component() {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">サンプルコンポーネント</h2>
      <p className="text-gray-600">Reactで作成したUIをPDFに変換できます</p>
    </div>
  );
}
`;

// Reactプラグインの定義
export const reactTailwind = {
  name: 'react-tailwind',

  schema: {
    reactCode: {
      type: 'string',
      title: 'Reactコード',
      format: 'multiline',
      allowEmpty: true,
      onDropFile: false,
    },
    svgData: {
      type: 'string',
      title: 'SVGデータ',
      format: 'multiline',
      readOnly: true,
      allowEmpty: true,
      visible: false,
    },
    instanceId: {
      type: 'string',
      title: 'インスタンスID',
      readOnly: true,
      visible: false,
    },
  },
  // UI描画プラグイン
  ui: (args: UIRenderProps<ReactTailwindSchema>) => {
    const { value, onChange, schema } = args;

    // インスタンスIDがない場合は生成
    if (!schema.instanceId && onChange) {
      // onChangeの使用方法の修正
      onChange({ key: 'instanceId', value: generateStableId() });
    }

    // コンテナ要素の作成
    const container = document.createElement('div');
    container.className = 'react-tailwind-container';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.padding = '10px';
    container.style.boxSizing = 'border-box';
    container.style.backgroundColor = '#f9fafb';
    container.style.border = '1px dashed #d1d5db';
    container.style.borderRadius = '4px';

    if (value) {
      try {
        // SVGデータが存在する場合は表示
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(value, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        // SVG要素のスタイルを調整
        svgElement.style.maxWidth = '100%';
        svgElement.style.maxHeight = '100%';

        // コンテナに追加
        container.appendChild(svgElement);
      } catch (error) {
        console.error('SVG描画エラー:', error);

        // エラーメッセージを表示
        const errorMsg = document.createElement('div');
        errorMsg.style.color = 'red';
        errorMsg.style.padding = '10px';
        errorMsg.textContent = 'SVGの描画に失敗しました';
        container.appendChild(errorMsg);
      }
    } else {
      // SVGデータがない場合はプレースホルダーを表示
      const placeholder = document.createElement('div');
      placeholder.style.color = '#6b7280';
      placeholder.style.textAlign = 'center';
      placeholder.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-code" style="margin-bottom: 8px;">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
        <p style="margin: 0;">Reactコードから生成されたSVGがここに表示されます</p>
      `;
      container.appendChild(placeholder);
    }

    // ここで処理は完了するが、void型を返す必要がある
    return;
  },
  // PDF生成用プラグイン
  pdf: (arg) => {
    const { value, schema, pdfDoc, page, _cache } = arg;

    // コンテンツを確認（デバッグ用）
    if (value) {
      console.log('PDF生成: コンテンツあり', value.substring(0, 50) + '...');
    } else {
      console.warn('PDF生成: コンテンツなし');
    }

    // 標準のimage.pdfプラグインを使用
    return image.pdf(arg);
  },
  propPanel: {
    schema: {
      reactCode: {
        type: 'string',
        title: 'Reactコード',
        format: 'multiline',
        allowEmpty: true,
      },
    },
    defaultSchema: {
      type: 'react-tailwind',
      name: 'Reactコンポーネント',
      reactCode: defaultReactCode,
      svgData: '',
      instanceId: '',
      content: '',
      position: { x: 0, y: 0 },
      width: 150,
      height: 100,
    },
  },
} as Plugin<ReactTailwindSchema>;

export default reactTailwind;
