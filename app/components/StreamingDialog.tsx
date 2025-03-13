'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShikiCode } from './ShikiCode';

interface StreamingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamData: string;
  isLoading: boolean;
  onApply: (normalizedData: string) => void;
  title?: string;
  errorMessage?: string | null;
}

export function StreamingDialog({
  open,
  onOpenChange,
  streamData,
  isLoading,
  onApply,
  title = 'AIがJSONを生成中',
  errorMessage = null,
}: StreamingDialogProps) {
  // 整形されたJSONの状態
  const [formattedJson, setFormattedJson] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // streamDataが変更されたときに整形されたJSONを更新
  useEffect(() => {
    try {
      if (streamData) {
        // JSONデータをパースして整形
        const parsedData = JSON.parse(streamData);
        const formatted = JSON.stringify(parsedData, null, 2);
        setFormattedJson(formatted);
      } else {
        setFormattedJson('');
      }
    } catch (err) {
      // パースに失敗した場合は生データをそのまま表示
      setFormattedJson(streamData);
    }
  }, [streamData]);

  // isLoadingが変化した時にisCompleteを更新
  useEffect(() => {
    if (!isLoading && streamData) {
      setIsComplete(true);
    } else {
      setIsComplete(false);
    }
  }, [isLoading, streamData]);

  // 「PDFに反映」ボタンのクリックハンドラ
  const handleApply = () => {
    // ストリームデータがマークダウンコードブロックで囲まれている可能性があるため、
    // streamDataを正規化してからonApplyに渡す
    const normalizedData = normalizeJsonString(streamData);
    // カスタム関数を作成して、親コンポーネントに正規化されたデータを渡す
    onApply(normalizedData);
    onOpenChange(false);
  };

  // JSONデータをマークダウンコードブロックから抽出する関数
  const normalizeJsonString = (input: string): string => {
    if (!input) return '';

    // マークダウンのコードブロック（```json...```）から内容を抽出
    const codeBlockMatch = input.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    return input;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        className='sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] w-[95vw] h-[90vh] max-h-[90vh] p-4 flex flex-col gap-4'
        style={{ overflow: 'hidden' }}
      >
        <DialogHeader className='px-2'>
          <DialogTitle className='text-xl'>
            {isComplete ? '生成完了！内容を確認してください' : title}
          </DialogTitle>
        </DialogHeader>

        {errorMessage && (
          <Alert variant='destructive' className='my-0'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div
          className='flex-1 w-full'
          style={{
            height: 'calc(100% - 120px)',
            position: 'relative',
          }}
        >
          <ShikiCode
            code={formattedJson || '// 生成中...'}
            language='json'
            theme='github-dark'
            lineNumbers={true}
            autoScroll={!isComplete}
            maxHeight='calc(100vh - 200px)'
          />
        </div>

        <DialogFooter className='flex flex-col sm:flex-row gap-2 items-stretch mt-auto py-2 px-0'>
          {isComplete && (
            <Button onClick={handleApply} size='lg' className='sm:flex-1'>
              PDFに反映する
            </Button>
          )}
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            size='lg'
            className='sm:flex-1'
          >
            {isComplete ? 'キャンセル' : '閉じる'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
