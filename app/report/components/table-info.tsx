'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TableInfoProps {
  hasTableElement: boolean;
  tableColumns: string[];
  tableInfo: {
    position: { x: number; y: number };
    width: number;
    height: number;
    name: string;
  } | null;
  queryData: {
    columns: string[];
    rows: Record<string, any>[];
    pageSize?: number;
  } | null;
  columnMapping: { targetColumn: string; sourceColumn: string }[];
}

export function TableInfo({
  hasTableElement,
  tableColumns,
  tableInfo,
  queryData,
  columnMapping,
}: TableInfoProps) {
  return (
    <Card className='mt-4 mb-6'>
      <CardContent className='pt-4'>
        {hasTableElement ? (
          <div className='text-sm text-green-600 mb-2'>
            テーブル要素が検出されました（{tableColumns.length}列）
            {tableInfo && (
              <div className='mt-1 text-xs text-gray-600'>
                <div>名称: {tableInfo.name}</div>
                <div>
                  位置: x={tableInfo.position.x}, y=
                  {tableInfo.position.y}
                </div>
                <div>
                  サイズ: 幅={tableInfo.width}, 高さ={tableInfo.height}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className='text-sm text-orange-600 mb-2'>
            テンプレートにテーブル要素が見つかりません
          </div>
        )}

        {queryData && queryData.rows.length > 0 && columnMapping.length > 0 && (
          <div className='mt-2 text-xs'>
            <div className='font-medium mb-1'>現在のマッピング:</div>
            <ul className='list-disc list-inside space-y-1 pl-2'>
              {columnMapping.map((mapping, index) => (
                <li key={index}>
                  {mapping.targetColumn} →
                  {mapping.sourceColumn ? (
                    <span className='text-blue-600'>
                      {' '}
                      {mapping.sourceColumn}
                    </span>
                  ) : (
                    <span className='text-gray-400'> 未設定</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
