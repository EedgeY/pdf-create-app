'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ColumnMappingItem {
  targetColumn: string;
  sourceColumn: string;
}

interface ColumnMapperProps {
  templateColumns: string[];
  dataColumns: string[];
  onMappingChange: (mapping: ColumnMappingItem[]) => void;
  initialMapping?: ColumnMappingItem[];
}

export default function ColumnMapper({
  templateColumns,
  dataColumns,
  onMappingChange,
  initialMapping = [],
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<ColumnMappingItem[]>(initialMapping);

  useEffect(() => {
    // 初期マッピングがない場合、テンプレート列名ごとに空のマッピングを作成
    if (initialMapping.length === 0 && templateColumns.length > 0) {
      const newMapping = templateColumns.map((column) => ({
        targetColumn: column,
        sourceColumn: '',
      }));
      setMapping(newMapping);
    }
  }, [templateColumns, initialMapping]);

  const handleMappingChange = (targetColumn: string, sourceColumn: string) => {
    const updatedMapping = mapping.map((item) =>
      item.targetColumn === targetColumn ? { ...item, sourceColumn } : item
    );
    setMapping(updatedMapping);
    onMappingChange(updatedMapping);
  };

  // 自動マッピング（同じ名前や類似名の列を自動的にマッピング）
  const autoMap = () => {
    const updatedMapping = mapping.map((item) => {
      // 同一名のカラムを探す
      const exactMatch = dataColumns.find(
        (col) => col.toLowerCase() === item.targetColumn.toLowerCase()
      );
      if (exactMatch) {
        return { ...item, sourceColumn: exactMatch };
      }

      // 部分一致するカラムを探す
      const partialMatch = dataColumns.find(
        (col) =>
          col.toLowerCase().includes(item.targetColumn.toLowerCase()) ||
          item.targetColumn.toLowerCase().includes(col.toLowerCase())
      );
      if (partialMatch) {
        return { ...item, sourceColumn: partialMatch };
      }

      return item;
    });

    setMapping(updatedMapping);
    onMappingChange(updatedMapping);
    toast({
      title: '自動マッピング完了',
      description: 'カラム名の類似性に基づいてマッピングしました',
    });
  };

  const clearMapping = () => {
    const clearedMapping = mapping.map((item) => ({
      ...item,
      sourceColumn: '',
    }));
    setMapping(clearedMapping);
    onMappingChange(clearedMapping);
  };

  return (
    <Card className='mb-6'>
      <CardHeader className='pb-3'>
        <div className='flex justify-between items-center'>
          <CardTitle>カラムマッピング設定</CardTitle>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={autoMap}>
              自動マッピング
            </Button>
            <Button variant='outline' size='sm' onClick={clearMapping}>
              クリア
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-sm mb-4 text-gray-600'>
          テーブルの各列にデータベースのどのカラムを対応させるか設定します
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>テーブル列名</TableHead>
              <TableHead>データソースのカラム</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mapping.map((item, index) => (
              <TableRow key={index}>
                <TableCell className='font-medium'>
                  {item.targetColumn}
                </TableCell>
                <TableCell>
                  <Select
                    value={item.sourceColumn}
                    onValueChange={(value) =>
                      handleMappingChange(item.targetColumn, value)
                    }
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue
                        placeholder='カラムを選択'
                        defaultValue={''}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {dataColumns.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {mapping.filter((item) => item.sourceColumn).length === 0 && (
          <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm'>
            マッピングが設定されていません。各テーブル列に対応するデータソースのカラムを選択してください。
          </div>
        )}
      </CardContent>
    </Card>
  );
}
