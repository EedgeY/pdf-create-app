'use client';

import React from 'react';

interface DesignerErrorProps {
  errorMessage: string;
  onRetry: () => void;
}

export function DesignerError({ errorMessage, onRetry }: DesignerErrorProps) {
  return (
    <div className='flex items-center justify-center h-[400px] bg-red-50 rounded-lg border-2 border-dashed border-red-300'>
      <div className='text-center p-6 max-w-lg'>
        <div className='inline-block mb-4 text-red-500'>
          <svg
            className='h-12 w-12'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
        </div>
        <div className='mb-3 text-xl font-medium text-red-700'>
          PDFテンプレートの読み込みエラー
        </div>
        <div className='text-sm text-red-600 mb-4 p-3 bg-red-100 rounded-md overflow-auto'>
          {errorMessage}
        </div>
        <div className='space-y-2'>
          <div className='text-sm text-gray-600 mb-1'>
            以下を試してみてください:
          </div>
          <ul className='text-xs text-left list-disc pl-4 space-y-1 text-gray-600'>
            <li>ブラウザのキャッシュをクリアする</li>
            <li>ページを再読み込みする</li>
            <li>別のテンプレートプリセットを選択する</li>
            <li>フォントが使用できない場合は標準フォントを使用します</li>
            <li>
              チャンク読み込みエラーが発生した場合は、数秒待ってから再試行してください
            </li>
            <li>ネットワーク接続を確認してください</li>
            <li>
              <strong>チャンク読み込みエラーの場合:</strong>{' '}
              ブラウザのシークレットモードで開くか、別のブラウザで試してください
            </li>
            <li>
              <strong>PDFmeライブラリエラーの場合:</strong>{' '}
              小さなテンプレートから始めて、徐々に要素を追加してください
            </li>
          </ul>
        </div>
        <div className='mt-4'>
          <button
            onClick={onRetry}
            className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors'
          >
            再試行
          </button>
          <button
            onClick={() => {
              // ローカルストレージをクリアして再試行
              if (typeof window !== 'undefined') {
                localStorage.removeItem('template');
                localStorage.removeItem('current_element_display_settings');
                localStorage.removeItem('last_display_settings');
              }
              onRetry();
            }}
            className='ml-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors'
          >
            設定をリセットして再試行
          </button>
        </div>
      </div>
    </div>
  );
}
