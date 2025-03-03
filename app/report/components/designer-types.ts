import { Designer } from '@pdfme/ui';
import { Template } from '@pdfme/common';

// Designer拡張型の定義
export interface ExtendedDesigner extends Designer {
  getDisplaySettings?: () => any;
  setDisplaySettings?: (settings: any) => void;
}

// クエリデータの型定義
export interface QueryData {
  columns: string[];
  rows: Record<string, any>[];
  pageSize?: number;
}

// テーブル情報の型定義
export interface TableInfo {
  position: { x: number; y: number };
  width: number;
  height: number;
  name: string;
}

// カラムマッピングの型定義
export interface ColumnMappingItem {
  targetColumn: string;
  sourceColumn: string;
}

// テンプレート保存データの型定義
export interface TemplateWithSettings {
  template: Template;
  displaySettings?: Record<string, any>;
  pageSize?: number;
  columnMapping?: ColumnMappingItem[];
}

// 表示設定の型定義
export interface DisplaySettings {
  elementDisplaySettings: Record<string, string>;
  [key: string]: any;
}
