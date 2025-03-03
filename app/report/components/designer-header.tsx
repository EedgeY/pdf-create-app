'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DesignerHeaderProps {
  onChangeBasePDF: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dataSourceName: string;
  setDataSourceName: (name: string) => void;
  queryDataCount?: number;
  isDesignerLoading: boolean;
  designerError: string | null;
}

export function DesignerHeader({
  onChangeBasePDF,
  dataSourceName,
  setDataSourceName,
  queryDataCount,
  isDesignerLoading,
  designerError,
}: DesignerHeaderProps) {
  return (
    <div className='p-4 bg-gray-50 border-b'>
      <div className='flex flex-wrap items-center gap-4'>
        <div>
          <Label htmlFor='basePdfUpload' className='mr-2 block text-sm'>
            ベースPDF変更:
          </Label>
          <Input
            id='basePdfUpload'
            type='file'
            accept='application/pdf'
            onChange={onChangeBasePDF}
            className='w-full max-w-xs'
          />
        </div>

        <div>
          <Label htmlFor='dataSourceName' className='mr-2 block text-sm'>
            データソース名:
          </Label>
          <Input
            id='dataSourceName'
            placeholder='queryData'
            value={dataSourceName}
            onChange={(e) => setDataSourceName(e.target.value)}
            className='w-40'
          />
        </div>

        {queryDataCount !== undefined && queryDataCount > 0 && (
          <div className='text-sm text-green-600 flex items-end pb-1'>
            {queryDataCount}件のデータが利用可能
          </div>
        )}

        {/* ローディングインジケータをツールバーにも表示 */}
        {isDesignerLoading && (
          <div className='ml-auto text-sm text-blue-600 flex items-center'>
            <svg
              className='animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600'
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
            テンプレート読み込み中...
          </div>
        )}

        {designerError && !isDesignerLoading && (
          <div className='ml-auto text-sm text-red-600 flex items-center'>
            <svg
              className='h-4 w-4 text-red-600 mr-1'
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
            エラーが発生しました
          </div>
        )}
      </div>
    </div>
  );
}
