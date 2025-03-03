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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QueryExecutionData {
  columns: string[];
  rows: Record<string, any>[];
  pageSize?: number;
}

interface QuerySelectorProps {
  onExecuteQuery: (data: QueryExecutionData) => void;
}

export default function QuerySelector({ onExecuteQuery }: QuerySelectorProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [conditions, setConditions] = useState<string>('');
  const [limit, setLimit] = useState<string>('100');
  const [previewData, setPreviewData] = useState<{
    columns: string[];
    rows: any[];
  }>({
    columns: [],
    rows: [],
  });
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState<string>('10');

  // テーブル一覧を取得
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('/api/report/tables');
        if (!response.ok) throw new Error('テーブル一覧の取得に失敗しました');
        const data = await response.json();
        setTables(data.tables);
      } catch (error) {
        console.error('テーブル取得エラー:', error);
        toast({
          title: 'エラー',
          description: 'テーブル一覧の取得に失敗しました',
          variant: 'destructive',
        });
        // 開発用のデモテーブル
        setTables(['cattle', 'farms', 'deposits', 'billing_items', 'users']);
      }
    };

    fetchTables();
  }, [toast]);

  const executeQuery = async () => {
    if (!selectedTable) {
      toast({
        title: '注意',
        description: 'テーブルを選択してください',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/report/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: selectedTable,
          conditions: conditions,
          limit: parseInt(limit) || 100,
        }),
      });

      if (!response.ok) throw new Error('クエリの実行に失敗しました');

      const data = await response.json();

      // プレビューデータをセット
      setPreviewData({
        columns: data.columns,
        rows: data.rows,
      });

      // 親コンポーネントにデータを渡す
      onExecuteQuery({
        columns: data.columns,
        rows: data.rows,
        pageSize: parseInt(pageSize) || 10,
      });

      toast({
        title: '成功',
        description: `${data.rows.length}件のデータを取得しました`,
      });
    } catch (error) {
      console.error('クエリ実行エラー:', error);
      toast({
        title: 'エラー',
        description: '検索の実行に失敗しました',
        variant: 'destructive',
      });

      // 開発用のデモデータ
      const demoData = generateDemoData(selectedTable);
      setPreviewData(demoData);
      onExecuteQuery({
        ...demoData,
        pageSize: parseInt(pageSize) || 10,
      });
    } finally {
      setLoading(false);
    }
  };

  // 開発用のデモデータ生成
  const generateDemoData = (table: string) => {
    const demoData: { columns: string[]; rows: any[] } = {
      columns: [],
      rows: [],
    };

    switch (table) {
      case 'cattle':
        demoData.columns = [
          'id',
          'cattle_number',
          'name',
          'birth_date',
          'gender',
          'farm_id',
        ];
        demoData.rows = Array(20)
          .fill(0)
          .map((_, i) => ({
            id: i + 1,
            cattle_number: `JP-${1000000 + i}`,
            name: `牛${i + 1}`,
            birth_date: new Date(2020, i % 12, (i % 28) + 1)
              .toISOString()
              .split('T')[0],
            gender: i % 2 === 0 ? '雄' : '雌',
            farm_id: (i % 3) + 1,
          }));
        break;
      case 'farms':
        demoData.columns = ['id', 'name', 'address', 'phone'];
        demoData.rows = Array(5)
          .fill(0)
          .map((_, i) => ({
            id: i + 1,
            name: `農場${i + 1}`,
            address: `〒123-456${i} 東京都千代田区${i + 1}`,
            phone: `03-1234-567${i}`,
          }));
        break;
      default:
        demoData.columns = ['id', 'name', 'created_at'];
        demoData.rows = Array(10)
          .fill(0)
          .map((_, i) => ({
            id: i + 1,
            name: `サンプル${i + 1}`,
            created_at: new Date().toISOString(),
          }));
    }

    return demoData;
  };

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle>データベース連携設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='table'>テーブル選択</Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger id='table'>
                  <SelectValue placeholder='テーブルを選択' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {tables.map((table) => (
                      <SelectItem key={table} value={table}>
                        {table}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='limit'>取得件数上限</Label>
              <Input
                id='limit'
                type='number'
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                min='1'
                max='1000'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='conditions'>検索条件 (SQL WHERE句)</Label>
            <Textarea
              id='conditions'
              placeholder="例: status = 'active' AND created_at > '2023-01-01'"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              className='h-20'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='pageSize'>1ページあたりの行数</Label>
              <Input
                id='pageSize'
                type='number'
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                min='1'
                max='100'
              />
            </div>
            <div className='flex items-end'>
              <Button
                onClick={executeQuery}
                disabled={loading}
                className='w-full'
              >
                {loading ? '実行中...' : 'クエリ実行'}
              </Button>
            </div>
          </div>
        </div>

        {previewData.rows.length > 0 && (
          <div className='mt-6 border rounded'>
            <div className='p-2 bg-gray-50 border-b font-medium'>
              プレビュー（最初の5件）
            </div>
            <div className='overflow-auto max-h-60'>
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewData.columns.map((column) => (
                      <TableHead key={column}>{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.rows.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {previewData.columns.map((column) => (
                        <TableCell key={column}>
                          {typeof row[column] === 'object'
                            ? JSON.stringify(row[column])
                            : String(row[column] ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
