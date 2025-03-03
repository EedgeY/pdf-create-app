'use client';

import { Template } from '@pdfme/common';
import { getFontsData, getPlugins } from '../helper';
import { ColumnMapping, DisplayCondition, QueryData } from '../types';

/**
 * クエリデータとテンプレートを使用してPDFを生成する
 */
export async function generatePDFWithData({
  template,
  queryData,
  columnMapping,
  elementDisplaySettings,
  tableInfo,
}: {
  template: Template;
  queryData: QueryData;
  columnMapping: ColumnMapping[];
  elementDisplaySettings: Record<string, DisplayCondition>;
  tableInfo: {
    name: string;
    hasTable: boolean;
  } | null;
}) {
  if (!queryData || queryData.rows.length === 0) {
    throw new Error(
      'データが取得されていません。先にクエリを実行してください。'
    );
  }

  try {
    const font = await getFontsData();

    const pageSize = queryData.pageSize || 10;

    // データをページサイズごとに分割
    const chunkedData = [];
    for (let i = 0; i < queryData.rows.length; i += pageSize) {
      chunkedData.push(queryData.rows.slice(i, i + pageSize));
    }

    // 各ページ用のinputs配列を構築
    const formattedInputs = [];

    // テンプレート内の全要素からデフォルト値を抽出
    const templateDefaultValues: Record<string, string> = {};

    // 最初のページのスキーマから要素情報を収集
    if (template.schemas && template.schemas.length > 0) {
      const firstPageSchemas = template.schemas[0];
      firstPageSchemas.forEach((schema) => {
        if (schema.name) {
          // contentが存在する場合はそのままデフォルト値として使用
          if (schema.content !== undefined && schema.type !== 'table') {
            templateDefaultValues[schema.name] = String(schema.content);
          }
        }
      });
    }

    // ページごとにinputsオブジェクトを作成
    for (let pageIndex = 0; pageIndex < chunkedData.length; pageIndex++) {
      const pageData = chunkedData[pageIndex];
      const pageInput: Record<string, any> = {};

      // 各要素の表示条件に基づいてinputsに追加
      Object.entries(templateDefaultValues).forEach(([name, value]) => {
        const condition = elementDisplaySettings[name] || 'all';
        const isFirstPage = pageIndex === 0;
        const isEvenPage = pageIndex % 2 === 1;

        const shouldDisplay =
          condition === 'all' ||
          (condition === 'first-only' && isFirstPage) ||
          (condition === 'not-first' && !isFirstPage) ||
          (condition === 'even-only' && isEvenPage) ||
          (condition === 'odd-only' && !isEvenPage);

        if (shouldDisplay) {
          pageInput[name] = value;
        }
      });

      // テーブル要素の処理
      if (tableInfo?.hasTable && tableInfo.name) {
        const tableName = tableInfo.name;
        // マッピングに基づいてテーブルデータを作成
        pageInput[tableName] = pageData.map((row) => {
          return columnMapping.map((mapping) => {
            return mapping.sourceColumn
              ? String(row[mapping.sourceColumn] || '')
              : '';
          });
        });
      }

      // クエリデータでフィールドを上書き（最初の行のデータを使用）
      if (pageData.length > 0) {
        const firstRow = pageData[0];
        Object.keys(firstRow).forEach((key) => {
          if (firstRow[key] !== undefined) {
            // 条件に基づいて表示するフィールドのみ上書き
            const condition = elementDisplaySettings[key] || 'all';
            const isFirstPage = pageIndex === 0;
            const isEvenPage = pageIndex % 2 === 1;

            const shouldDisplay =
              condition === 'all' ||
              (condition === 'first-only' && isFirstPage) ||
              (condition === 'not-first' && !isFirstPage) ||
              (condition === 'even-only' && isEvenPage) ||
              (condition === 'odd-only' && !isEvenPage);

            if (shouldDisplay) {
              pageInput[key] = String(firstRow[key]);
            }
          }
        });
      }

      formattedInputs.push(pageInput);
    }

    console.log('表示条件:', elementDisplaySettings);
    console.log('生成するページ数:', formattedInputs.length);

    // generateメソッドを動的インポート
    const { generate } = await import('@pdfme/generator');
    const pdf = await generate({
      template,
      inputs: formattedInputs,
      options: {
        font,
        lang: 'ja' as const,
        title: 'データベース連携PDF',
      },
      plugins: getPlugins(),
    });

    const blob = new Blob([new Uint8Array(pdf.buffer)], {
      type: 'application/pdf',
    });

    return {
      blob,
      url: URL.createObjectURL(blob),
      pageCount: formattedInputs.length,
    };
  } catch (e) {
    console.error('PDF生成エラー:', e);
    throw new Error(`PDF生成エラー: ${e}`);
  }
}
