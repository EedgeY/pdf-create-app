'use client';

import { useEffect, useState } from 'react';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { useTheme } from 'next-themes';
import { Template } from '@pdfme/common';
import { Button } from '@/components/ui/button';
import { Copy, FileDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// BlockNoteで使用するブロックの型（内部処理用）
type BlockNoteBlock = {
  id?: string;
  type: string;
  props?: Record<string, any>;
  content?: any;
  children?: BlockNoteBlock[];
};

export default function MarkdownViewer({
  template,
  onApplyMarkdownTemplate,
}: {
  template: Template | null;
  onApplyMarkdownTemplate?: (elements: any[]) => void;
}) {
  const { resolvedTheme } = useTheme();
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [blocks, setBlocks] = useState<BlockNoteBlock[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showDirectInput, setShowDirectInput] = useState(false);
  const { toast } = useToast();

  // マークダウンをクリップボードにコピーする関数
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
    }
  };

  // BlockNoteエディタの初期化
  const editor = useCreateBlockNote();

  // PDFテンプレートからBlockNoteブロックとマークダウンを生成
  useEffect(() => {
    if (template && template.schemas) {
      let text = '';
      const newBlocks: BlockNoteBlock[] = [];

      console.log('テンプレートからマークダウンを生成します', template);

      // 各ページを処理
      template.schemas.forEach((schema, pageIndex) => {
        // ページ区切りを追加（最初のページ以外）
        if (pageIndex > 0) {
          // マークダウン用の区切り線
          text += `---\n\n`;

          // BlockNote用の区切り線ブロック
          newBlocks.push({
            type: 'paragraph',
            content: '---',
          });
        }

        // 各要素を処理
        Object.entries(schema).forEach(
          ([elementId, element]: [string, any]) => {
            if (typeof element === 'object' && element !== null) {
              switch (element.type) {
                case 'text': {
                  // テキスト要素の名前に基づいてヘッダーレベルを判定
                  if (
                    element.name &&
                    element.name.toLowerCase().includes('header')
                  ) {
                    // マークダウン
                    text += `## ${element.content || element.name}\n\n`;

                    // BlockNote
                    newBlocks.push({
                      type: 'heading',
                      props: { level: 1 },
                      content: element.content || element.name,
                    });
                  } else if (
                    element.name &&
                    element.name.toLowerCase().includes('section')
                  ) {
                    // マークダウン
                    text += `### ${element.content || element.name}\n\n`;

                    // BlockNote
                    newBlocks.push({
                      type: 'heading',
                      props: { level: 2 },
                      content: element.content || element.name,
                    });
                  } else {
                    // マークダウン
                    text += `${
                      element.content ||
                      `テキスト要素 (${element.name || 'noname'})`
                    }\n\n`;

                    // BlockNote - テキストカラーを適用
                    const blockContent = [];

                    // テキストコンテンツを作成
                    blockContent.push({
                      type: 'text',
                      text:
                        element.content ||
                        `テキスト要素 (${element.name || 'noname'})`,
                      styles: {
                        // 色情報があれば適用
                        textColor: element.fontColor || 'default',
                        backgroundColor: element.backgroundColor || 'default',
                      },
                    });

                    newBlocks.push({
                      type: 'paragraph',
                      content: blockContent,
                    });
                  }
                  break;
                }
                case 'table': {
                  try {
                    // マークダウン用テーブル
                    text += `### ${element.name || 'テーブル'}\n\n`;

                    // contentはJSON文字列化された2次元配列
                    const tableContent = element.content
                      ? JSON.parse(element.content)
                      : [];
                    const headers = element.head || [];
                    const showHead = element.showHead !== false;

                    if (tableContent.length > 0 || headers.length > 0) {
                      // ヘッダー行を表示
                      if (showHead && headers.length > 0) {
                        text += '| ' + headers.join(' | ') + ' |\n';
                        text +=
                          '| ' +
                          headers.map(() => '------').join(' | ') +
                          ' |\n';
                      } else {
                        // ヘッダーがない場合は列数に基づいて空のヘッダーを作成
                        const columnCount = tableContent[0]?.length || 3;
                        text +=
                          '| ' +
                          Array(columnCount).fill('').join(' | ') +
                          ' |\n';
                        text +=
                          '| ' +
                          Array(columnCount).fill('------').join(' | ') +
                          ' |\n';
                      }

                      // データ行の作成
                      tableContent.forEach((row: any[]) => {
                        if (Array.isArray(row)) {
                          text +=
                            '| ' +
                            row
                              .map((cell) => cell?.toString() || '')
                              .join(' | ') +
                            ' |\n';
                        }
                      });
                    } else {
                      // データがない場合は空のテーブルを表示
                      text += '| カラム1 | カラム2 | カラム3 |\n';
                      text += '| ------ | ------ | ------ |\n';
                      text += '| データ1 | データ2 | データ3 |\n';
                    }

                    // BlockNote用テーブル
                    const tableRows = tableContent.map((row: any[]) => ({
                      cells: row.map((cell) => cell?.toString() || ''),
                    }));

                    newBlocks.push({
                      type: 'heading',
                      props: { level: 3 },
                      content: element.name || 'テーブル',
                    });

                    if (tableRows.length > 0) {
                      newBlocks.push({
                        type: 'table',
                        content: {
                          type: 'tableContent',
                          rows: tableRows,
                        },
                      });
                    }
                  } catch (e) {
                    console.error('テーブルデータのパースエラー:', e, element);
                    text +=
                      '**テーブルデータの変換中にエラーが発生しました**\n\n';

                    newBlocks.push({
                      type: 'paragraph',
                      content:
                        '**テーブルデータの変換中にエラーが発生しました**',
                    });
                  }

                  text += '\n';
                  break;
                }
                case 'image': {
                  // 画像のURLを取得（src属性またはbase64データがある場合）
                  const imageUrl = element.src || element.base64 || '';
                  const imageName = element.name || '画像';

                  // マークダウン形式で画像を追加
                  text += `![${imageName}](${
                    imageUrl || 'イメージURLなし'
                  })\n\n`;

                  // 画像URLが存在する場合は画像ブロック、ない場合はテキストブロック
                  if (imageUrl) {
                    // BlockNote用の画像ブロック
                    newBlocks.push({
                      type: 'image',
                      props: {
                        url: imageUrl,
                        caption: imageName,
                        previewWidth:
                          typeof element.width === 'number'
                            ? element.width
                            : 512, // 数値型として設定
                      },
                      content: undefined,
                      children: [], // 空の子要素配列を追加
                    });
                  } else {
                    // 画像URLがない場合はプレースホルダーテキスト
                    newBlocks.push({
                      type: 'paragraph',
                      content: `[画像プレースホルダー: ${imageName}]`,
                    });
                  }
                  break;
                }
                case 'urlimage': {
                  // urlimageタイプの処理
                  // imageUrlプロパティまたはbase64エンコードされたコンテンツを使用
                  const imageUrl = element.imageUrl || '';
                  const base64Content =
                    element.content && element.content.startsWith('data:')
                      ? element.content
                      : '';
                  const imageSource = imageUrl || base64Content || '';
                  const imageName = element.name || 'URL画像';

                  // マークダウン形式で画像を追加
                  text += `![${imageName}](${
                    imageSource || 'イメージURLなし'
                  })\n\n`;

                  // 画像ソースが存在する場合は画像ブロック、ない場合はテキストブロック
                  if (imageSource) {
                    // BlockNote用の画像ブロック
                    newBlocks.push({
                      type: 'image',
                      props: {
                        url: imageSource,
                        caption: imageName,
                        previewWidth:
                          typeof element.width === 'number'
                            ? element.width
                            : 512, // 数値型として設定
                      },
                      content: undefined,
                      children: [], // 空の子要素配列を追加
                    });
                  } else {
                    // 画像URLがない場合はプレースホルダーテキスト
                    newBlocks.push({
                      type: 'paragraph',
                      content: `[URL画像プレースホルダー: ${imageName}]`,
                    });
                  }
                  break;
                }
                case 'link': {
                  // マークダウン用リンク
                  const url = element.url || '';
                  const linkText = element.name || url || 'リンク';
                  const autoOpen = element.autoOpen || false;
                  text += `[${linkText}](${url}${
                    autoOpen ? ' [自動で開く]' : ''
                  })\n\n`;

                  // BlockNote用リンク
                  // URL形式チェック
                  let formattedUrl = url;
                  if (url && !/^[a-z]+:\/\//.test(url)) {
                    formattedUrl = 'http://' + url;
                  }

                  newBlocks.push({
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: linkText,
                        styles: {
                          textColor: element.fontColor || 'blue',
                          backgroundColor: element.backgroundColor || 'default',
                          underline: true,
                        },
                        attributes: {
                          href: formattedUrl,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                          'data-auto-open': autoOpen ? 'true' : 'false',
                        },
                      },
                    ],
                  });
                  break;
                }
                default: {
                  text += `${element.type}要素: ${
                    element.name || '名称なし'
                  }\n\n`;

                  newBlocks.push({
                    type: 'paragraph',
                    content: `${element.type}要素: ${
                      element.name || '名称なし'
                    }`,
                  });
                }
              }
            }
          }
        );
      });

      // マークダウンコンテンツを設定
      console.log('生成されたマークダウン:', text);
      setMarkdownContent(text);

      // BlockNoteブロックを設定
      setBlocks(newBlocks);

      try {
        editor.replaceBlocks(editor.document, newBlocks as any);
      } catch (e) {
        console.error('BlockNote更新エラー:', e);
      }
    } else {
      console.log('テンプレートが空か無効です');
    }
  }, [editor, template]);

  // マークダウンをpdfme形式に変換する関数
  const convertToPdfmeFormat = async () => {
    try {
      setIsConverting(true);
      console.log('マークダウン変換開始:', markdownContent);

      // マークダウンの解析とpdfme要素への変換
      const elements = convertMarkdownToPdfmeElements(markdownContent);
      console.log('変換された要素:', elements);

      // レイアウト最適化APIを呼び出す
      const optimizedElements = await optimizeLayout(elements);

      // 親コンポーネントに最適化された要素を渡す
      if (onApplyMarkdownTemplate) {
        onApplyMarkdownTemplate(optimizedElements);
      }

      toast({
        title: '変換完了',
        description: 'マークダウンがPDFテンプレートに変換されました',
      });
    } catch (error) {
      console.error('マークダウン変換エラー:', error);
      toast({
        title: '変換エラー',
        description: 'マークダウンの変換中にエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  // マークダウンをpdfme要素に変換する関数
  const convertMarkdownToPdfmeElements = (markdown: string): any[] => {
    const lines = markdown.split('\n');
    const elements: any[] = [];
    let y = 20; // 初期Y位置

    // テーブル処理のための変数
    let inTable = false;
    let tableStart = -1;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // 空行はスキップ

      // テーブル処理
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          // テーブル開始
          inTable = true;
          tableStart = i;
          // ヘッダー行の抽出
          tableHeaders = line
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());
        } else if (line.includes('-') && line.includes('|')) {
          // 区切り行はスキップ (|------|------|)
          continue;
        } else {
          // データ行の追加
          const rowCells = line
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());
          tableRows.push(rowCells);
        }

        // テーブルが終了するかチェック（次の行がテーブル形式でない場合）
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        if (!nextLine.startsWith('|') || i === lines.length - 1) {
          // テーブルの終了 - PDFテーブル要素を作成
          inTable = false;

          // テーブル内容をJSON形式に変換
          const tableContent = JSON.stringify(tableRows);

          // テーブル要素を追加
          elements.push({
            name: `table-${tableStart}`,
            type: 'table',
            content: tableContent,
            position: { x: 20, y },
            width: 170,
            height: Math.max(20, tableRows.length * 12 + 20),
            head: tableHeaders,
            showHead: true,
          });

          // 位置を更新
          y += Math.max(50, tableRows.length * 12 + 30);

          // テーブル変数をリセット
          tableHeaders = [];
          tableRows = [];
        }

        continue; // 次の行へ
      }

      // 他の要素の処理（テーブル以外）
      if (inTable) {
        // テーブルの途中で非テーブル行 - テーブル終了
        inTable = false;

        // テーブル内容をJSON形式に変換
        const tableContent = JSON.stringify(tableRows);

        // テーブル要素を追加
        elements.push({
          name: `table-${tableStart}`,
          type: 'table',
          content: tableContent,
          position: { x: 20, y },
          width: 170,
          height: Math.max(20, tableRows.length * 12 + 20),
          head: tableHeaders,
          showHead: true,
        });

        // 位置を更新
        y += Math.max(50, tableRows.length * 12 + 30);

        // テーブル変数をリセット
        tableHeaders = [];
        tableRows = [];
      }

      // 見出し判定
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)?.[0].length || 1;
        const content = line.replace(/^#+\s*/, '');

        elements.push({
          name: `header-${i}`,
          type: 'text',
          content: content,
          position: { x: 20, y },
          width: 170,
          height: 20,
          fontSize: 22 - level * 2, // 見出しレベルに応じたフォントサイズ
          fontWeight: 'bold',
        });

        y += 30;
      }
      // 画像
      else if (line.match(/!\[.*?\]\(.*?\)/)) {
        const match = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          const [_, alt, url] = match;
          elements.push({
            name: `image-${i}`,
            type: 'image',
            src: url,
            position: { x: 20, y },
            width: 150,
            height: 100,
          });

          y += 110;
        }
      }
      // 通常テキスト
      else {
        elements.push({
          name: `text-${i}`,
          type: 'text',
          content: line,
          position: { x: 20, y },
          width: 170,
          height: 20,
        });

        y += 20;
      }
    }

    return elements;
  };

  // レイアウト最適化APIを呼び出す関数
  const optimizeLayout = async (elements: any[]): Promise<any[]> => {
    try {
      const response = await fetch('/api/openrouter/generate-layout-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt:
            'マークダウンから変換した要素を整えて、読みやすいPDFレイアウトにしてください',
          model: 'openai/gpt-3.5-turbo',
          currentElements: elements,
          pageSize: { width: 210, height: 297 }, // A4サイズ
          layoutOptions: {
            spacing: 'comfortable',
            autoSize: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.optimizedElements || elements;
    } catch (error) {
      console.error('レイアウト最適化エラー:', error);
      // エラー時は元の要素をそのまま返す
      return elements;
    }
  };

  // マークダウンを直接入力する
  const handleDirectMarkdownInput = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newContent = e.target.value;
    setMarkdownContent(newContent);

    try {
      // 新しいブロックを生成
      const parsedBlocks: BlockNoteBlock[] = [];

      // 簡易的な変換: 改行ごとに段落ブロックを作成
      newContent.split('\n').forEach((line) => {
        if (line.trim()) {
          parsedBlocks.push({
            type: 'paragraph',
            content: line.trim(),
          });
        }
      });

      // ブロックを更新
      setBlocks(parsedBlocks);

      // 型の不一致を避けるために any を使用
      editor.replaceBlocks(editor.document, parsedBlocks as any);
    } catch (e) {
      console.error('ブロック更新エラー:', e);
    }
  };

  return (
    <div className='w-full h-full flex flex-col'>
      <div className='flex justify-between items-center mb-2'>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowDirectInput(!showDirectInput)}
            className='flex items-center gap-1'
          >
            {showDirectInput ? 'プレビュー表示' : 'マークダウン編集'}
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={copyToClipboard}
            className='flex items-center gap-1'
          >
            <Copy className='h-4 w-4' />
            {copySuccess ? 'コピー完了' : 'コピー'}
          </Button>
          <Button
            variant='default'
            size='sm'
            onClick={convertToPdfmeFormat}
            className='flex items-center gap-1'
            disabled={isConverting || !markdownContent}
            title={!markdownContent ? 'マークダウンコンテンツがありません' : ''}
          >
            <FileDown className='h-4 w-4' />
            {isConverting ? '変換中...' : 'PDFに変換'}
          </Button>
        </div>
      </div>

      {/* マークダウンコンテンツの状態表示（デバッグ用） */}
      <div className='text-xs text-gray-500 mb-2'>
        コンテンツ状態:{' '}
        {markdownContent ? `${markdownContent.length}文字あり` : '空'}
      </div>

      {showDirectInput ? (
        <div className='flex-grow overflow-auto'>
          <textarea
            className='w-full h-full text-black min-h-[300px] p-4 border rounded'
            value={markdownContent}
            onChange={handleDirectMarkdownInput}
            placeholder='# マークダウンを入力してください
例:
## 見出し2
### 見出し3
テキスト段落

| 列1 | 列2 | 列3 |
| --- | --- | --- |
| データ1 | データ2 | データ3 |
| データ4 | データ5 | データ6 |

* リスト項目1
* リスト項目2'
          />
        </div>
      ) : (
        <div className='flex-grow overflow-auto bg-white min-h-[500px]'>
          <BlockNoteView
            editor={editor}
            theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          />
        </div>
      )}
    </div>
  );
}
