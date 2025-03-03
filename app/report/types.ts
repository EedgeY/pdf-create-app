import { Template } from '@pdfme/common';
import { Designer } from '@pdfme/ui';

// デザイナー拡張型
export interface ExtendedDesigner extends Designer {
  getDisplaySettings?: () => any;
  setDisplaySettings?: (settings: any) => void;
}

// 表示条件の型定義
export type DisplayCondition =
  | 'all'
  | 'first-only'
  | 'not-first'
  | 'even-only'
  | 'odd-only';

// 表示条件の選択肢
export const DISPLAY_CONDITIONS: { value: DisplayCondition; label: string }[] =
  [
    { value: 'all', label: '全ページに表示' },
    { value: 'first-only', label: '最初のページのみ' },
    { value: 'not-first', label: '最初のページ以外' },
    { value: 'even-only', label: '偶数ページのみ' },
    { value: 'odd-only', label: '奇数ページのみ' },
  ];

// テーブルデータ型
export interface TableInfo {
  position: { x: number; y: number };
  width: number;
  height: number;
  name: string;
}

// カラムマッピング型
export interface ColumnMapping {
  targetColumn: string;
  sourceColumn: string;
}

// クエリデータ型
export interface QueryData {
  columns: string[];
  rows: Record<string, any>[];
  pageSize?: number;
}

// テンプレート保存形式
export interface TemplateWithSettings {
  template: Template;
  displaySettings?: Record<string, DisplayCondition>;
  pageSize?: number;
  columnMapping?: ColumnMapping[];
}
