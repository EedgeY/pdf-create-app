'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

import { toast } from '@/hooks/use-toast';
import { Designer } from '@pdfme/ui';
import { LayoutTemplateIcon } from 'lucide-react';
import { getTemplateById, getTemplates, saveTemplate } from '../actions';

// Designer拡張型の定義
interface ExtendedDesigner extends Designer {
  getDisplaySettings?: () => any;
  setDisplaySettings?: (settings: any) => void;
}

interface SaveTemplateDialogProps {
  currentRef: ExtendedDesigner | null;
  farmId?: string;
  onTemplateLoad: (template: any) => void;
  pageSize?: number;
  templatePresetKey?: string;
  columnMapping?: { targetColumn: string; sourceColumn: string }[];
  tableInfo?: { name: string } | null;
  dataSourceName?: string;
  onSettingsLoaded?: (settings: {
    templatePresetKey: string;
    pageSize: number;
    columnMapping: any[];
    displaySettings: any;
    dataSourceName?: string;
  }) => void;
  onRequestQueryReload?: (query?: string) => void;
}

export function TemplateActionsDialog({
  currentRef,
  farmId,
  onTemplateLoad,
  pageSize,
  templatePresetKey,
  columnMapping,
  tableInfo,
  dataSourceName,
  onSettingsLoaded,
  onRequestQueryReload,
}: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<any>({});
  const [showMappingDetails, setShowMappingDetails] = useState(false);

  const [currentPageSize, setCurrentPageSize] = useState<number | undefined>(
    pageSize
  );
  const [currentColumnMapping, setCurrentColumnMapping] = useState<
    { targetColumn: string; sourceColumn: string }[] | undefined
  >(columnMapping);
  const [currentTemplatePresetKey, setCurrentTemplatePresetKey] = useState<
    string | undefined
  >(templatePresetKey);

  useEffect(() => {
    if (pageSize !== undefined) setCurrentPageSize(pageSize);
    if (columnMapping !== undefined) setCurrentColumnMapping(columnMapping);
    if (templatePresetKey !== undefined)
      setCurrentTemplatePresetKey(templatePresetKey);
  }, [pageSize, columnMapping, templatePresetKey]);

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(
        'current_element_display_settings'
      );
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        console.log('localStorageから前回の表示設定を復元:', parsedSettings);
        setCurrentSettings(parsedSettings);
      }

      const storedPageSize = localStorage.getItem('current_page_size');
      if (storedPageSize) {
        const parsedPageSize = JSON.parse(storedPageSize);
        console.log('localStorageからページサイズを復元:', parsedPageSize);
        setCurrentPageSize(parsedPageSize);
      }

      const storedColumnMapping = localStorage.getItem(
        'current_column_mapping'
      );
      if (storedColumnMapping) {
        const parsedColumnMapping = JSON.parse(storedColumnMapping);
        console.log(
          'localStorageからカラムマッピングを復元:',
          parsedColumnMapping
        );
        setCurrentColumnMapping(parsedColumnMapping);
      }

      const storedPresetKey = localStorage.getItem('templatePreset');
      if (storedPresetKey) {
        console.log(
          'localStorageからテンプレートプリセットキーを復元:',
          storedPresetKey
        );
        setCurrentTemplatePresetKey(storedPresetKey);
      }
    } catch (e) {
      console.error('設定の復元に失敗:', e);
    }
  }, []);

  const handleSaveTemplate = async () => {
    if (!currentRef || !templateName) return;

    setIsLoading(true);
    try {
      const template = currentRef.getTemplate();
      console.log('保存するテンプレート:', template);

      const hasGetDisplaySettings =
        typeof currentRef.getDisplaySettings === 'function';
      console.log(
        'getDisplaySettings メソッドは存在するか:',
        hasGetDisplaySettings
      );

      let displaySettings: any = null;
      if (hasGetDisplaySettings) {
        displaySettings = currentRef.getDisplaySettings?.() || {
          elementDisplaySettings: {},
        };
        console.log('取得した表示設定(生):', displaySettings);

        setCurrentSettings(displaySettings);

        try {
          localStorage.setItem(
            'last_saved_display_settings',
            JSON.stringify(displaySettings)
          );
          console.log('表示設定をローカルストレージに保存しました');
        } catch (e) {
          console.error('表示設定の保存に失敗:', e);
        }

        if (displaySettings?.elementDisplaySettings) {
          const settingsCount = Object.keys(
            displaySettings.elementDisplaySettings
          ).length;
          console.log(
            `elementDisplaySettings 内の項目数: ${settingsCount}`,
            displaySettings.elementDisplaySettings
          );
        } else {
          console.log('elementDisplaySettings プロパティが見つかりません');

          if (
            currentSettings?.elementDisplaySettings &&
            Object.keys(currentSettings.elementDisplaySettings).length > 0
          ) {
            console.log(
              'コンポーネント状態から表示設定を使用:',
              currentSettings.elementDisplaySettings
            );
            displaySettings = {
              elementDisplaySettings: currentSettings.elementDisplaySettings,
            };
          } else {
            displaySettings = { elementDisplaySettings: {} };
          }
        }
      } else {
        console.log('警告: getDisplaySettings メソッドが見つかりません');
        if (
          currentSettings?.elementDisplaySettings &&
          Object.keys(currentSettings.elementDisplaySettings).length > 0
        ) {
          console.log(
            'コンポーネント状態から表示設定を使用:',
            currentSettings.elementDisplaySettings
          );
          displaySettings = currentSettings;
        } else {
          displaySettings = { elementDisplaySettings: {} };
        }
      }

      const elementDisplaySettings =
        displaySettings?.elementDisplaySettings || {};

      console.log('保存に使用する表示設定:', elementDisplaySettings);

      if (Object.keys(elementDisplaySettings).length === 0) {
        try {
          const lastSettings = localStorage.getItem('last_display_settings');
          if (lastSettings) {
            const parsedSettings = JSON.parse(lastSettings);
            console.log('最後に保存した表示設定を使用:', parsedSettings);
            if (Object.keys(parsedSettings).length > 0) {
              const elementDisplaySettings = parsedSettings;
              console.log('復元した表示設定で上書き:', elementDisplaySettings);
            }
          }
        } catch (e) {
          console.error('前回の設定の取得に失敗:', e);
        }
      }

      let finalPageSize = currentPageSize;
      if (finalPageSize === undefined) {
        try {
          const storedPageSize = localStorage.getItem('current_page_size');
          if (storedPageSize) {
            finalPageSize = JSON.parse(storedPageSize);
            console.log('localStorageからページサイズを取得:', finalPageSize);
          } else {
            finalPageSize = 10;
            console.log('デフォルトのページサイズを使用:', finalPageSize);
          }
        } catch (e) {
          console.error('ページサイズの取得に失敗:', e);
          finalPageSize = 10;
        }
      }

      let finalTemplatePresetKey = currentTemplatePresetKey;
      if (!finalTemplatePresetKey) {
        try {
          const storedPresetKey = localStorage.getItem('templatePreset');
          if (storedPresetKey) {
            finalTemplatePresetKey = storedPresetKey;
            console.log(
              'localStorageからテンプレートプリセットキーを取得:',
              finalTemplatePresetKey
            );
          } else {
            finalTemplatePresetKey = 'custom';
            console.log(
              'デフォルトのテンプレートプリセットキーを使用:',
              finalTemplatePresetKey
            );
          }
        } catch (e) {
          console.error('テンプレートプリセットキーの取得に失敗:', e);
          finalTemplatePresetKey = 'custom';
        }
      }

      let finalColumnMapping = currentColumnMapping || [];
      if (finalColumnMapping.length === 0) {
        try {
          const storedMapping = localStorage.getItem('current_column_mapping');
          if (storedMapping) {
            finalColumnMapping = JSON.parse(storedMapping);
            console.log(
              'localStorageからカラムマッピングを取得:',
              finalColumnMapping
            );
          }
        } catch (e) {
          console.error('カラムマッピングの取得に失敗:', e);
        }
      }

      const templateData = {
        templateName,
        template,
        templatePresetKey: finalTemplatePresetKey,
        elementDisplaySettings,
        columnMapping: finalColumnMapping,
        pageSize: finalPageSize,
        farmId,
      };

      console.log('保存リクエスト:', JSON.stringify(templateData, null, 2));

      try {
        if (finalPageSize) {
          localStorage.setItem(
            'current_page_size',
            JSON.stringify(finalPageSize)
          );
        }
        if (finalColumnMapping && finalColumnMapping.length > 0) {
          localStorage.setItem(
            'current_column_mapping',
            JSON.stringify(finalColumnMapping)
          );
        }
        console.log('追加設定をlocalStorageに保存しました');
      } catch (e) {
        console.error('追加設定の保存に失敗:', e);
      }

      const result = await saveTemplate(templateData);
      console.log('保存レスポンス:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      setTemplateName('');
      toast({
        title: 'テンプレート保存成功',
        description: 'テンプレートが保存されました',
        variant: 'default',
      });
    } catch (error) {
      console.error('テンプレート保存エラー:', error);
      toast({
        title: 'エラー',
        description: `テンプレート保存に失敗しました: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getTemplates(farmId);
      if (error) throw new Error(error);
      setSavedTemplates(data || []);
    } catch (error) {
      console.error('テンプレート読み込みエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadTemplate = async (templateId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await getTemplateById(templateId);
      if (error) throw new Error(error);

      if (data) {
        console.log('読み込んだテンプレートデータ:', data);

        // 型アサーション追加
        type TemplateData = {
          element_display_settings: any;
          page_size?: number;
          column_mapping: any;
          template_preset_key?: string;
          template: any;
          template_name: string;
          db_query?: string;
        };

        const templateData = data as unknown as TemplateData;

        const displaySettings = templateData.element_display_settings || {};
        const loadedPageSize = templateData.page_size || 10;
        const loadedColumnMapping = Array.isArray(templateData.column_mapping)
          ? templateData.column_mapping.map((item: any) => ({
              targetColumn: String(item.targetColumn || ''),
              sourceColumn: String(item.sourceColumn || ''),
            }))
          : [];
        const loadedTemplatePresetKey =
          templateData.template_preset_key || 'custom';
        const loadedDataSourceName = dataSourceName || '';
        const loadedQuery = templateData.db_query || '';

        setCurrentSettings({ elementDisplaySettings: displaySettings });
        setCurrentPageSize(loadedPageSize);
        setCurrentColumnMapping(loadedColumnMapping);
        setCurrentTemplatePresetKey(loadedTemplatePresetKey);

        try {
          localStorage.setItem(
            'current_element_display_settings',
            JSON.stringify(displaySettings)
          );
          localStorage.setItem(
            'current_page_size',
            JSON.stringify(loadedPageSize)
          );
          localStorage.setItem(
            'current_column_mapping',
            JSON.stringify(loadedColumnMapping)
          );
          localStorage.setItem('templatePreset', loadedTemplatePresetKey);
          if (loadedDataSourceName)
            localStorage.setItem('dataSourceName', loadedDataSourceName);
        } catch (e) {
          console.error('設定の保存に失敗:', e);
        }

        const templateToLoad = {
          template: templateData.template,
          displaySettings: { elementDisplaySettings: displaySettings },
          pageSize: loadedPageSize,
          columnMapping: loadedColumnMapping,
          templatePresetKey: loadedTemplatePresetKey,
          dataSourceName: loadedDataSourceName,
        };

        onTemplateLoad(templateToLoad);

        if (onSettingsLoaded) {
          onSettingsLoaded({
            templatePresetKey: loadedTemplatePresetKey,
            pageSize: loadedPageSize,
            columnMapping: loadedColumnMapping,
            displaySettings: { elementDisplaySettings: displaySettings },
            dataSourceName: loadedDataSourceName,
          });
        }

        if (onRequestQueryReload && loadedQuery) {
          onRequestQueryReload(loadedQuery);
        }

        toast({
          title: 'テンプレート読み込み成功',
          description: `"${templateData.template_name}" を読み込みました。関連する設定も更新されました。`,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('テンプレート読み込みエラー:', error);
      toast({
        title: 'エラー',
        description: `テンプレート読み込みに失敗しました: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size='icon' variant='ghost' onClick={loadTemplates}>
          <LayoutTemplateIcon className='w-4 h-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>テンプレート管理</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 mt-4'>
          <div className='space-y-2'>
            <h3 className='text-sm font-medium'>新規テンプレート保存</h3>
            <div className='flex gap-2'>
              <Input
                placeholder='テンプレート名'
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <Button
                onClick={handleSaveTemplate}
                disabled={isLoading || !templateName}
              >
                保存
              </Button>
            </div>
          </div>

          <div className='space-y-2'>
            <h3 className='text-sm font-medium'>保存済みテンプレート</h3>
            {savedTemplates.length === 0 ? (
              <p className='text-sm text-gray-500'>
                保存されたテンプレートはありません
              </p>
            ) : (
              <div className='space-y-2 max-h-[300px] overflow-y-auto'>
                {savedTemplates.map((template) => (
                  <div
                    key={template.id}
                    className='flex justify-between items-center p-2 border rounded'
                  >
                    <span>{template.template_name}</span>
                    <Button
                      size='sm'
                      onClick={() => handleLoadTemplate(template.id)}
                      disabled={isLoading}
                    >
                      読み込み
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='space-y-2 mt-4'>
            <h3 className='text-sm font-medium'>現在の設定</h3>
            <div className='bg-gray-50 p-3 rounded-md text-xs space-y-2'>
              <div>
                <span className='font-medium'>ページサイズ:</span>{' '}
                {currentPageSize || 10}行/ページ
              </div>
              <div>
                <span className='font-medium'>テンプレートタイプ:</span>{' '}
                {currentTemplatePresetKey || 'custom'}
              </div>
              <div>
                <span className='font-medium'>カラムマッピング:</span>{' '}
                {currentColumnMapping?.length || 0}項目設定済み
                {currentColumnMapping && currentColumnMapping.length > 0 && (
                  <Button
                    variant='link'
                    className='p-0 h-auto text-xs'
                    onClick={() => setShowMappingDetails(true)}
                  >
                    詳細を表示
                  </Button>
                )}
              </div>
              <div>
                <span className='font-medium'>表示条件:</span>{' '}
                {currentSettings?.elementDisplaySettings
                  ? Object.keys(currentSettings.elementDisplaySettings).length
                  : 0}
                項目設定済み
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* マッピング詳細ダイアログ */}
      <Dialog open={showMappingDetails} onOpenChange={setShowMappingDetails}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>カラムマッピング詳細</DialogTitle>
          </DialogHeader>
          <div className='mt-4 space-y-2 max-h-[300px] overflow-y-auto'>
            {currentColumnMapping?.map((mapping, idx) => (
              <div key={idx} className='text-sm border-b pb-2'>
                <div>
                  <span className='font-medium'>対象カラム:</span>{' '}
                  {mapping.targetColumn}
                </div>
                <div>
                  <span className='font-medium'>ソースカラム:</span>{' '}
                  {mapping.sourceColumn || '未設定'}
                </div>
              </div>
            ))}
          </div>
          <div className='mb-4 bg-blue-50 p-3 rounded text-sm'>
            <div>
              <span className='font-medium'>テーブル名:</span>{' '}
              {tableInfo?.name || '未設定'}
            </div>
            <div>
              <span className='font-medium'>データソース名:</span>{' '}
              {dataSourceName || 'queryData'}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
