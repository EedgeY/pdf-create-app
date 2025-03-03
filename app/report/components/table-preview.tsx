'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TablePreviewProps {
  tableColumns: string[];
  queryData: {
    columns: string[];
    rows: Record<string, any>[];
    pageSize?: number;
  };
  columnMapping: { targetColumn: string; sourceColumn: string }[];
}

export function TablePreview({
  tableColumns,
  queryData,
  columnMapping,
}: TablePreviewProps) {
  if (
    !queryData ||
    queryData.rows.length === 0 ||
    columnMapping.filter((m) => m.sourceColumn).length === 0
  ) {
    return null;
  }

  return (
    <Card className='mt-4 bg-blue-50'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>テーブルデータプレビュー</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='text-xs mb-2'>
          マッピングを適用した場合のテーブル内容プレビュー（最初の3行）
        </div>

        <div className='overflow-auto max-h-60 border rounded bg-white'>
          <Table>
            <TableHeader>
              <TableRow>
                {tableColumns.map((column) => (
                  <TableHead key={column} className='py-1 px-2 text-xs'>
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryData.rows.slice(0, 3).map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columnMapping.map((mapping, colIndex) => (
                    <TableCell key={colIndex} className='py-1 px-2 text-xs'>
                      {mapping.sourceColumn ? (
                        String(row[mapping.sourceColumn] || '')
                      ) : (
                        <span className='text-gray-400'>-</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className='mt-3 text-xs text-blue-600'>
          全{queryData.rows.length}行のデータを
          {queryData.pageSize || 10}行ごとに分割し、
          {Math.ceil(queryData.rows.length / (queryData.pageSize || 10))}
          ページのPDFとして生成されます
        </div>
      </CardContent>
    </Card>
  );
}
