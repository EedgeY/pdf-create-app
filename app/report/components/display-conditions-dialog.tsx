'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Template } from '@pdfme/common';

// 表示条件の型定義
export type DisplayCondition =
  | 'all'
  | 'first-only'
  | 'not-first'
  | 'even-only'
  | 'odd-only';

// 表示条件の選択肢
const displayConditionOptions = [
  { value: 'all', label: 'すべてのページ' },
  { value: 'first-only', label: '最初のページのみ' },
  { value: 'not-first', label: '2ページ目以降' },
  { value: 'even-only', label: '偶数ページのみ' },
  { value: 'odd-only', label: '奇数ページのみ' },
];

// 表示条件設定ダイアログのコンポーネント
export function DisplayConditionsDialog({
  isOpen,
  onClose,
  template,
  settings,
  onSaveSettings,
}: {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
  settings: Record<string, string>;
  onSaveSettings: (settings: Record<string, string>) => void;
}) {
  const [localSettings, setLocalSettings] = useState<Record<string, string>>(
    {}
  );

  // settingsが変更されたときに同期する
  useEffect(() => {
    console.log(
      'DisplayConditionsDialog - 親から新しい設定を受け取りました:',
      settings
    );
    setLocalSettings(settings);
  }, [settings]);

  // マウント時にsettingsの内容をログに記録
  useEffect(() => {
    console.log('DisplayConditionsDialog - マウントしました');
    console.log('DisplayConditionsDialog - 初期設定:', settings);

    // settingsが空の場合、localStorageから復元を試みる
    if (Object.keys(settings).length === 0) {
      try {
        const storedSettings = localStorage.getItem('last_display_settings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          console.log('localStorageから表示設定を復元:', parsedSettings);
          setLocalSettings(parsedSettings);
        }
      } catch (e) {
        console.error('保存された設定の取得に失敗:', e);
      }
    } else {
      setLocalSettings(settings);
    }
  }, []);

  // テンプレートから要素を抽出
  const elements: string[] = [];
  if (template.schemas && template.schemas.length > 0) {
    template.schemas[0].forEach((schema) => {
      if (schema.name && schema.type !== 'table') {
        elements.push(schema.name);
      }
    });
  }

  const handleSaveSettings = () => {
    console.log('DisplayConditionsDialog - 保存する設定:', localSettings);

    // 設定をlocalStorageにもバックアップ (デバッグ用)
    try {
      localStorage.setItem(
        'last_display_settings',
        JSON.stringify(localSettings)
      );
      console.log('表示設定をlocalStorageに保存しました');
    } catch (e) {
      console.error('表示設定の保存に失敗:', e);
    }

    onSaveSettings(localSettings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>要素の表示条件設定</DialogTitle>
          <DialogDescription>
            各要素がどのページに表示されるかを設定します
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4 max-h-[60vh] overflow-auto'>
          {elements.map((name) => (
            <div key={name} className='grid grid-cols-2 items-center gap-4'>
              <Label>{name}</Label>
              <Select
                value={localSettings[name] || 'all'}
                onValueChange={(value) =>
                  setLocalSettings({
                    ...localSettings,
                    [name]: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {displayConditionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleSaveSettings}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
