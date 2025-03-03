'use client';

import React from 'react';

interface DesignerLoadingProps {
  message?: string;
  subMessage?: string;
}

export function DesignerLoading({
  message = 'テンプレートを準備中...',
  subMessage = 'テンプレートとフォントを読み込んでいます',
}: DesignerLoadingProps) {
  return (
    <div className='flex items-center justify-center h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
      <div className='text-center p-6'>
        <div className='inline-block mb-4'>
          <svg
            className='animate-spin h-12 w-12 text-blue-500'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
        </div>
        <div className='mb-2 text-xl font-medium text-gray-700'>{message}</div>
        <div className='text-gray-500 mb-1'>{subMessage}</div>
        <div className='text-xs text-gray-400'>
          この処理には数秒かかることがあります
        </div>
      </div>
    </div>
  );
}
