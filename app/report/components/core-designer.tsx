'use client';

import { toast } from '@/hooks/use-toast';
import { checkTemplate, cloneDeep, Template } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  downloadJsonFile,
  generatePDF,
  getBlankTemplate,
  getFontsData,
  getPlugins,
  handleLoadTemplate,
  readFile,
  initializePdfme,
} from '../helper';
import ColumnMapper from './column-mapper';
import { DesignerError } from './designer-error';
import { DesignerHeader } from './designer-header';
import { DesignerLoading } from './designer-loading';
import {
  ColumnMappingItem,
  DisplaySettings,
  ExtendedDesigner,
  QueryData,
  TableInfo as TableInfoType,
} from './designer-types';
import { DisplayConditionsDialog } from './display-conditions-dialog';
import { FloatingToolbar } from './floating-toolbar';
import QuerySelector from './query-selector';
import { TableInfo } from './table-info';
import { TablePreview } from './table-preview';

export default function CoreDesigner() {
  const designerRef = useRef<HTMLDivElement | null>(null);
  const designer = useRef<ExtendedDesigner | null>(null);

  const [prevDesignerRef, setPrevDesignerRef] = useState<HTMLDivElement | null>(
    null
  );
  const [queryData, setQueryData] = useState<QueryData | null>(null);
  const [dataSourceName, setDataSourceName] = useState<string>('');
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMappingItem[]>([]);
  const [hasTableElement, setHasTableElement] = useState<boolean>(false);
  const [tableInfo, setTableInfo] = useState<TableInfoType | null>(null);
  // 表示条件設定のステート
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);
  const [elementDisplaySettings, setElementDisplaySettings] = useState<
    Record<string, string>
  >({});
  // 表示設定を保持するための状態（デザイナーインスタンスに渡すため）
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    elementDisplaySettings: {},
  });

  // 追加: デザイナーのローディング状態を管理
  const [isDesignerLoading, setIsDesignerLoading] = useState(false);
  const [designerError, setDesignerError] = useState<string | null>(null);

  // elementDisplaySettingsが変更されたらdisplaySettingsも更新する
  useEffect(() => {
    // 設定が空でない場合のみログを出力
    if (Object.keys(elementDisplaySettings).length > 0) {
      // localStorageにも保存 (デバッグと永続化のため)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            'current_element_display_settings',
            JSON.stringify(elementDisplaySettings)
          );
        } catch (e) {
          console.error('設定の保存に失敗:', e);
        }
      }
    }

    setDisplaySettings((prevSettings) => {
      return {
        ...prevSettings,
        elementDisplaySettings,
      };
    });
  }, [elementDisplaySettings]);

  // デザイナーインスタンスが初期化されたら表示設定を適用
  useEffect(() => {
    if (
      designer.current &&
      designer.current.setDisplaySettings &&
      displaySettings
    ) {
      console.log('デザイナーに表示設定を適用:', displaySettings);
      designer.current.setDisplaySettings(displaySettings);
    }
  }, [displaySettings, designer.current]);

  const buildDesigner = useCallback(async () => {
    if (!designerRef.current) return;
    setIsDesignerLoading(true);

    try {
      // エラー抑制のためのグローバルハンドラ（クライアント側のみ）
      if (typeof window !== 'undefined') {
        // 既存のエラーハンドラを削除して重複を防止
        window.removeEventListener('error', () => {});

        // 新しいエラーハンドラを追加
        window.addEventListener(
          'error',
          (event) => {
            // Identifier 't' has already been declared エラーを抑制
            if (
              event.message &&
              (event.message.includes(
                "Identifier 't' has already been declared"
              ) ||
                event.message.includes('has already been declared'))
            ) {
              console.warn(
                'PDFme警告: 識別子の重複宣言を検出しました。このエラーは抑制されます。',
                event.message
              );
              event.preventDefault();
              return true;
            }

            // チャンク読み込みエラーを検出して処理
            if (
              (event.error && event.error.name === 'ChunkLoadError') ||
              (event.message && event.message.includes('ChunkLoadError'))
            ) {
              console.error(
                'チャンク読み込みエラーが発生しました:',
                event.error || event.message
              );
              // エラーを抑制せず、ユーザーに通知
              if (!designerError) {
                setDesignerError(
                  'リソースの読み込みに失敗しました。ページを再読み込みして再試行してください。'
                );
              }
            }

            return false;
          },
          { once: false, capture: true }
        );
      }

      // PDFmeライブラリの初期化
      const initialized = await initializePdfme();
      if (!initialized) {
        toast({
          title: 'ライブラリ初期化警告',
          description:
            'PDFライブラリの初期化に問題が発生しましたが、処理を続行します',
          variant: 'destructive',
        });
      }

      let currentTemplate: Template = getBlankTemplate();

      // ローカルストレージからテンプレートを読み込む
      const templateFromLocal = localStorage.getItem('template');
      if (templateFromLocal) {
        try {
          const parsed = JSON.parse(templateFromLocal);
          checkTemplate(parsed);
          currentTemplate = parsed;
        } catch (e) {
          console.error('保存されたテンプレートの解析エラー:', e);
        }
      }

      // デザイナーを初期化
      designer.current = new Designer({
        domContainer: designerRef.current,
        template: currentTemplate as Template,
        options: {
          font: await getFontsData(),
          lang: 'ja',
          labels: {
            'signature.clear': '🗑️',
          },
          theme: {
            token: { colorPrimary: '#25c2a0' },
          },
          icons: {
            multiVariableText:
              '<svg fill="#000000" width="24px" height="24px" viewBox="0 0 24 24"><path d="M6.643,13.072,17.414,2.3a1.027,1.027,0,0,1,1.452,0L20.7,4.134a1.027,1.027,0,0,1,0,1.452L9.928,16.357,5,18ZM21,20H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Z"/></svg>',
          },
          maxZoom: 250,
        },
        plugins: getPlugins(),
      });

      // イベントハンドラを設定
      designer.current.onSaveTemplate(onSaveTemplate);

      // テンプレート変更時にテーブル要素を検出するイベントハンドラ
      designer.current.onChangeTemplate(() => {
        detectTableElements();
      });

      // 初期化後すぐにテーブル要素を検出
      setTimeout(() => {
        detectTableElements();
        setIsDesignerLoading(false);
      }, 500);
    } catch (e) {
      console.error('デザイナー初期化エラー:', e);
      setDesignerError(`デザイナーの初期化に失敗しました: ${e}`);
      setIsDesignerLoading(false);
      localStorage.removeItem('template');
    }
  }, []);

  const onChangeBasePDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      readFile(e.target.files[0], 'dataURL').then(async (basePdf) => {
        if (designer.current) {
          designer.current.updateTemplate(
            Object.assign(cloneDeep(designer.current.getTemplate()), {
              basePdf,
            })
          );
        }
      });
    }
  };

  const onChangePadding = () => {
    if (designer.current) {
      const currentTemplate = designer.current.getTemplate();
      const updatedTemplate = {
        ...currentTemplate,
        options: {
          ...(currentTemplate.options || {}),
          padding: [10, 10, 10, 10],
        },
        schemas: currentTemplate.schemas,
        basePdf: currentTemplate.basePdf,
      };
      designer.current.updateTemplate(updatedTemplate);
    }
  };

  const onDownloadTemplate = () => {
    if (designer.current) {
      downloadJsonFile(designer.current.getTemplate(), 'template');
    }
  };

  const onSaveTemplate = (template?: Template) => {
    if (designer.current) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            'template',
            JSON.stringify(template || designer.current.getTemplate())
          );
          alert('保存しました！');

          // 保存後に明示的にテーブル要素を検出
          detectTableElements();
        } catch (e) {
          console.error('テンプレート保存エラー:', e);
          alert('保存に失敗しました。エラー: ' + e);
        }
      } else {
        console.warn('テンプレートの保存はクライアントサイドでのみ可能です');
      }
    }
  };

  const detectTableElements = () => {
    if (!designer.current) return;

    const template = designer.current.getTemplate();
    if (!template.schemas || template.schemas.length === 0) return;

    for (const pageSchemas of template.schemas) {
      for (const schema of pageSchemas) {
        if (schema.type === 'table' && schema.head) {
          setTableColumns(schema.head as string[]);
          setHasTableElement(true);

          // テーブル情報を保存
          setTableInfo({
            position: schema.position,
            width: schema.width,
            height: schema.height,
            name: schema.name || 'テーブル',
          });

          return;
        }
      }
    }

    setTableColumns([]);
    setHasTableElement(false);
    setTableInfo(null);
  };

  useEffect(() => {
    if (designer.current) {
      detectTableElements();

      // テンプレートが変更されたときにテーブル要素を検出
      designer.current.onChangeTemplate(() => {
        detectTableElements();
      });
    }
  }, [designer.current]);

  const handleQueryExecuted = (data: QueryData) => {
    setQueryData(data);

    if (designer.current && data.rows.length > 0) {
      const sourceName = dataSourceName || 'queryData';
      setDataSourceName(sourceName);

      if (hasTableElement && tableColumns.length > 0) {
        const updatedMapping = tableColumns.map((column) => {
          const existing = columnMapping.find((m) => m.targetColumn === column);
          return existing || { targetColumn: column, sourceColumn: '' };
        });
        setColumnMapping(updatedMapping);
      }

      toast({
        title: 'データ取得完了',
        description: `${data.rows.length}件のデータを取得しました`,
      });
    }
  };

  const handleMappingChange = (mapping: ColumnMappingItem[]) => {
    setColumnMapping(mapping);
  };

  const generatePDFWithData = async () => {
    if (!designer.current || !queryData || queryData.rows.length === 0) {
      alert('先にクエリを実行してデータを取得してください。');
      return;
    }

    try {
      // 生成前にエラーハンドラを設定
      if (typeof window !== 'undefined') {
        // ChunkLoadErrorを検出するためのハンドラ
        const handleChunkError = (event: ErrorEvent) => {
          if (event.error && event.error.name === 'ChunkLoadError') {
            console.error('チャンク読み込みエラーが発生しました:', event.error);
            toast({
              title: 'PDF生成エラー',
              description:
                'リソースの読み込みに失敗しました。ページを再読み込みして再試行してください。',
              variant: 'destructive',
            });
            event.preventDefault();
          }
        };

        window.addEventListener('error', handleChunkError, { once: true });

        // クリーンアップ関数を設定（5秒後）
        setTimeout(() => {
          window.removeEventListener('error', handleChunkError);
        }, 5000);
      }

      // PDFmeライブラリの初期化
      const initialized = await initializePdfme();
      if (!initialized) {
        toast({
          title: 'ライブラリ初期化警告',
          description:
            'PDFライブラリの初期化に問題が発生しましたが、処理を続行します',
          variant: 'destructive',
        });
      }

      // PDFmeライブラリの事前読み込み
      let generateModule;
      try {
        // 必要なモジュールを事前に読み込む
        generateModule = await import('@pdfme/generator');
        console.log('PDF生成モジュールの読み込みが完了しました');
      } catch (importError) {
        console.error(
          'PDF生成モジュールの読み込みに失敗しました:',
          importError
        );

        // エラーメッセージを表示
        toast({
          title: 'モジュール読み込みエラー',
          description:
            'PDF生成に必要なモジュールの読み込みに失敗しました。ページを再読み込みして再試行してください。',
          variant: 'destructive',
        });

        // 3秒後に再試行
        await new Promise((resolve) => setTimeout(resolve, 3000));

        try {
          generateModule = await import('@pdfme/generator');
          console.log('PDF生成モジュールの再読み込みが成功しました');
        } catch (retryError) {
          throw new Error(
            `モジュール読み込みの再試行に失敗しました: ${retryError}`
          );
        }
      }

      const template = designer.current.getTemplate();
      const options = designer.current.getOptions();
      const font = await getFontsData();

      const pageSize = queryData.pageSize || 10;

      // データをページサイズごとに分割
      const chunkedData = [];
      for (let i = 0; i < queryData.rows.length; i += pageSize) {
        chunkedData.push(queryData.rows.slice(i, i + pageSize));
      }

      // 各ページ用のinputs配列を構築
      const formattedInputs = [];

      // テンプレート内の全要素とその表示条件を設定
      // name: 要素名, condition: 表示条件（'first-only'|'not-first'|'even-only'|'odd-only'|'all'）
      const elementDisplayConditions: Record<string, string> = {};

      // テンプレート内の全要素からデフォルト値を抽出
      const templateDefaultValues: Record<string, string> = {};

      // 最初のページのスキーマから要素情報を収集
      if (template.schemas && template.schemas.length > 0) {
        const firstPageSchemas = template.schemas[0];
        firstPageSchemas.forEach((schema) => {
          if (schema.name) {
            // ユーザーが設定した表示条件があればそれを使用
            if (elementDisplaySettings[schema.name]) {
              elementDisplayConditions[schema.name] =
                elementDisplaySettings[schema.name];
            }
            // なければ要素名のパターンに基づいて条件を決定
            else if (schema.name.includes('_first_only')) {
              elementDisplayConditions[schema.name] = 'first-only';
            } else if (schema.name.includes('_not_first')) {
              elementDisplayConditions[schema.name] = 'not-first';
            } else if (schema.name.includes('_even_only')) {
              elementDisplayConditions[schema.name] = 'even-only';
            } else if (schema.name.includes('_odd_only')) {
              elementDisplayConditions[schema.name] = 'odd-only';
            } else {
              elementDisplayConditions[schema.name] = 'all';
            }

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
          const condition = elementDisplayConditions[name] || 'all';
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
          // shouldDisplayがfalseの場合、pageInputにそのフィールドは追加されない
        });

        // テーブル要素の処理
        if (hasTableElement && tableInfo) {
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
              const condition = elementDisplayConditions[key] || 'all';
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

      const { generate } = generateModule;
      const pdf = await generate({
        template,
        inputs: formattedInputs,
        options: {
          font,
          lang: options.lang,
          title: 'データベース連携PDF',
        },
        plugins: getPlugins(),
      });

      const blob = new Blob([new Uint8Array(pdf.buffer)], {
        type: 'application/pdf',
      });
      window.open(URL.createObjectURL(blob));
    } catch (e) {
      alert(`PDF生成エラー: ${e}\n\n詳細はコンソールを確認してください。`);
      console.error(e);
    }
  };

  useEffect(() => {
    if (designerRef.current !== prevDesignerRef) {
      buildDesigner();
      setPrevDesignerRef(designerRef.current);
    }
  }, [designerRef.current]);

  return (
    <div className='w-full min-h-svh'>
      {/* フローティングツールバー */}
      <FloatingToolbar
        position='top'
        onGeneratePDF={() => generatePDF(designer.current)}
        onSaveTemplate={() => onSaveTemplate()}
        onDownloadTemplate={onDownloadTemplate}
        onLoadTemplate={(e) => {
          handleLoadTemplate(e, designer.current);
        }}
        onChangePadding={onChangePadding}
        onDisplaySettings={() => setShowDisplaySettings(true)}
        onGenerateWithData={generatePDFWithData}
        hasQueryData={!!(queryData && queryData.rows.length > 0)}
        designerInstance={designer.current}
        pageSize={queryData?.pageSize}
        columnMapping={columnMapping}
        onTemplateLoad={(template) => {
          if (designer.current) {
            // テンプレートが { template, displaySettings } の形式で渡される場合の処理
            if (template.template) {
              console.log('テンプレートを更新:', template.template);
              designer.current.updateTemplate(template.template);

              // displaySettings が存在する場合
              if (
                template.displaySettings &&
                designer.current.setDisplaySettings
              ) {
                designer.current.setDisplaySettings(template.displaySettings);
              }

              // ページサイズが含まれている場合は更新
              if (template.pageSize) {
                // queryDataが存在する場合はそのpageSizeを更新
                if (queryData) {
                  setQueryData({
                    ...queryData,
                    pageSize: template.pageSize,
                  });
                }
              }

              // カラムマッピングが含まれている場合は更新
              if (template.columnMapping && template.columnMapping.length > 0) {
                setColumnMapping(template.columnMapping);
              }
            } else {
              // template がそのまま Template オブジェクトの場合
              designer.current.updateTemplate(template);
            }

            detectTableElements();
          }
        }}
      />

      <DesignerHeader
        onChangeBasePDF={onChangeBasePDF}
        dataSourceName={dataSourceName}
        setDataSourceName={setDataSourceName}
        queryDataCount={queryData?.rows.length}
        isDesignerLoading={isDesignerLoading}
        designerError={designerError}
      />

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4'>
        <div className='md:col-span-1'>
          <QuerySelector onExecuteQuery={handleQueryExecuted} />

          {hasTableElement &&
            tableColumns.length > 0 &&
            queryData &&
            queryData.columns.length > 0 && (
              <ColumnMapper
                templateColumns={tableColumns}
                dataColumns={queryData.columns}
                onMappingChange={handleMappingChange}
                initialMapping={columnMapping}
              />
            )}

          <TableInfo
            hasTableElement={hasTableElement}
            tableColumns={tableColumns}
            tableInfo={tableInfo}
            queryData={queryData}
            columnMapping={columnMapping}
          />

          {/* テーブルとマッピングの適用プレビュー */}
          {queryData &&
            queryData.rows.length > 0 &&
            columnMapping.filter((m) => m.sourceColumn).length > 0 && (
              <TablePreview
                tableColumns={tableColumns}
                queryData={queryData}
                columnMapping={columnMapping}
              />
            )}
        </div>

        <div className='md:col-span-2'>
          {isDesignerLoading && <DesignerLoading />}

          {designerError && !isDesignerLoading && (
            <DesignerError
              errorMessage={designerError}
              onRetry={() => {
                setDesignerError(null);
                buildDesigner();
              }}
            />
          )}

          <Suspense fallback={<div>Loading...</div>}>
            <div
              ref={designerRef}
              style={{
                width: '100%',
                height: '85vh',
                display: isDesignerLoading || designerError ? 'none' : 'block',
              }}
            >
              <span />
            </div>
          </Suspense>
        </div>
      </div>

      {/* 表示条件設定ダイアログ */}
      {designer.current && (
        <DisplayConditionsDialog
          isOpen={showDisplaySettings}
          onClose={() => setShowDisplaySettings(false)}
          template={designer.current.getTemplate()}
          settings={elementDisplaySettings}
          onSaveSettings={(settings) => {
            // 設定が空でないことを確認
            if (Object.keys(settings).length > 0) {
              // localStorageにも保存 (デバッグと永続化のため)
              try {
                localStorage.setItem(
                  'current_element_display_settings',
                  JSON.stringify(settings)
                );
                localStorage.setItem(
                  'last_display_settings',
                  JSON.stringify(settings)
                );
              } catch (e) {
                console.error('設定の保存に失敗:', e);
              }
            }

            setElementDisplaySettings(settings);
            // displaySettingsにも反映
            setDisplaySettings((prev) => {
              return {
                ...prev,
                elementDisplaySettings: settings,
              };
            });

            setShowDisplaySettings(false);
            toast({
              title: '設定を保存しました',
              description: '表示条件が更新されました',
            });
          }}
        />
      )}
    </div>
  );
}
