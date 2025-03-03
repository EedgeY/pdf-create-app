'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Designer } from '@pdfme/ui';
import {
  Download,
  FileOutput,
  FileText,
  Layers,
  Layout,
  MoreHorizontal,
  Save,
  Upload,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { TemplateActionsDialog } from './template-action-dialog';

interface FloatingToolbarProps {
  position?: 'top' | 'bottom' | 'center';
  onGeneratePDF: () => void;
  onSaveTemplate: () => void;
  onDownloadTemplate: () => void;
  onLoadTemplate: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePadding: () => void;
  onDisplaySettings: () => void;
  onGenerateWithData: () => void;
  hasQueryData: boolean;
  designerInstance: Designer | null;
  onTemplateLoad?: (template: any) => void;
  pageSize?: number;
  templatePresetKey?: string;
  columnMapping?: { targetColumn: string; sourceColumn: string }[];
}

export function FloatingToolbar({
  position = 'bottom',
  onGeneratePDF,
  onSaveTemplate,
  onDownloadTemplate,
  onLoadTemplate,
  onChangePadding,
  onDisplaySettings,
  onGenerateWithData,
  hasQueryData,
  designerInstance,
  onTemplateLoad,
  pageSize,
  templatePresetKey,
  columnMapping,
}: FloatingToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // Determine position class based on the position prop
  const positionClass =
    position === 'bottom'
      ? 'bottom-4'
      : position === 'center'
      ? 'bottom-1/2 -translate-y-1/2'
      : 'bottom-4';

  // ファイル入力のハンドラー
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLoadTemplate(e);
    // キーを更新して同じファイルを再度選択できるようにする
    setFileInputKey(Date.now());
  };

  // テンプレートロードハンドラー
  const handleTemplateLoad = (template: any) => {
    if (onTemplateLoad) {
      onTemplateLoad(template);
    }
  };

  return (
    <div
      className={`fixed ${positionClass} left-1/2 -translate-x-1/2 z-50 transition-all duration-200`}
    >
      <div className='flex items-center bg-background/80 backdrop-blur-sm rounded-full shadow-lg border p-1.5'>
        {isExpanded ? (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-full h-9 w-9'
                    onClick={onGeneratePDF}
                  >
                    <FileText className='h-5 w-5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>PDF生成</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-full h-9 w-9'
                    onClick={onSaveTemplate}
                  >
                    <Save className='h-5 w-5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>テンプレート保存</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-full h-9 w-9'
                    onClick={onDownloadTemplate}
                  >
                    <Download className='h-5 w-5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>テンプレートダウンロード</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className='relative'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='rounded-full h-9 w-9'
                      onClick={() =>
                        document.getElementById('templateFileInput')?.click()
                      }
                    >
                      <Upload className='h-5 w-5' />
                    </Button>
                    <input
                      id='templateFileInput'
                      type='file'
                      key={fileInputKey}
                      accept='application/json'
                      className='hidden'
                      onChange={handleFileInputChange}
                      aria-label='テンプレートファイルをアップロード'
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>テンプレートをアップロード</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className='mx-1'>
              <TemplateActionsDialog
                currentRef={designerInstance}
                onTemplateLoad={handleTemplateLoad}
                pageSize={pageSize}
                templatePresetKey={templatePresetKey}
                columnMapping={columnMapping}
              />
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-full h-9 w-9'
                    onClick={onChangePadding}
                  >
                    <Layout className='h-5 w-5' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>パディング変更</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {hasQueryData && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='rounded-full h-9 w-9'
                        onClick={onDisplaySettings}
                      >
                        <Layers className='h-5 w-5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>表示条件設定</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='default'
                        size='icon'
                        className='rounded-full h-10 w-10'
                        onClick={onGenerateWithData}
                      >
                        <FileOutput className='h-5 w-5' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>データ連携PDF生成</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            <Button
              variant='ghost'
              size='icon'
              className='rounded-full h-9 w-9 ml-1'
              onClick={() => setIsExpanded(false)}
            >
              <X className='h-4 w-4' />
            </Button>
          </>
        ) : (
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full h-9 w-9'
            onClick={() => setIsExpanded(true)}
          >
            <MoreHorizontal className='h-5 w-5' />
          </Button>
        )}
      </div>
    </div>
  );
}
