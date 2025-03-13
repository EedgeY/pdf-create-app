'use client';

import React, { useState, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { transform } from '@babel/standalone';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// A4サイズの定数定義（mm単位）
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
// DPI設定 - 96dpiは一般的なスクリーン解像度
const DPI = 96;
// mm to px変換 (1mm = 0.03937 inch, 1 inch = 96px @ 96dpi)
const MM_TO_PX = DPI / 25.4;
// A4サイズをピクセルに変換
const A4_WIDTH_PX = Math.round(A4_WIDTH_MM * MM_TO_PX);
const A4_HEIGHT_PX = Math.round(A4_HEIGHT_MM * MM_TO_PX);

type ReactCodeEditorProps = {
  onGenerateSvg: (svgElement: SVGElement) => Promise<string>;
  open: boolean; // ダイアログの表示状態
  onOpenChange: (open: boolean) => void; // ダイアログの表示状態変更ハンドラ
};

const defaultCode = `
// exportキーワードは不要です - コンポーネントは自動的に検出されます

// Tailwind CSSクラスを使用したコンポーネント
function PreviewComponent() {
  return (
    <div className="w-full h-full p-10" style={{border: '2px dashed #ccc', boxSizing: 'border-box'}}>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">サンプルカード</h2>
      <p className="text-gray-600 mb-4 max-w-md break-words">Reactで作成したコンポーネントをSVGに変換し、PDFに組み込むことができます。</p>
      
      {/* コンテンツ領域 */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded-md">
          <span className="text-blue-800 font-medium">項目 1</span>
          <p className="text-sm text-blue-600">値: 1,234</p>
        </div>
        <div className="bg-green-100 p-4 rounded-md">
          <span className="text-green-800 font-medium">項目 2</span>
          <p className="text-sm text-green-600">値: 5,678</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-md">
          <span className="text-yellow-800 font-medium">項目 3</span>
          <p className="text-sm text-yellow-600">値: 9,012</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-md">
          <span className="text-purple-800 font-medium">項目 4</span>
          <p className="text-sm text-purple-600">値: 3,456</p>
        </div>
      </div>
      
      {/* フッター */}
      <div className="mt-8 border-t pt-4 text-sm text-gray-500">
        A4サイズのフルページコンポーネント例
      </div>
    </div>
  );
}

// このコンポーネントが使用されます
PreviewComponent;
`;

interface ExportsWithDefault {
  default?: React.ComponentType;
}

const ReactCodeEditor: React.FC<ReactCodeEditorProps> = ({
  onGenerateSvg,
  open,
  onOpenChange,
}) => {
  const [code, setCode] = useState(defaultCode);
  const [compiledCode, setCompiledCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1); // スケーリング用の状態を追加
  const [isAutoUpdate, setIsAutoUpdate] = useState(true); // 自動更新設定

  // コードをコンパイルする - 自動更新設定に基づいて遅延実行
  useEffect(() => {
    // 自動更新がオフの場合はコンパイルしない
    if (!isAutoUpdate) return;

    // 遅延処理でタイピング中の頻繁な更新を防止
    const timer = setTimeout(() => {
      try {
        // import文とexport文を削除
        const processedCode = code
          .replace(
            /import\s+.*?from\s+['"].*?['"]/g,
            '// import statements are not supported and have been removed'
          )
          .replace(/export\s+default\s+/g, ''); // export defaultを削除

        const result = transform(processedCode, {
          presets: ['react'],
          filename: 'component.jsx',
        });
        setCompiledCode(result.code || '');
        setError(null);
      } catch (err) {
        console.error('コンパイルエラー:', err);
        setError(
          err instanceof Error ? err.message : '未知のエラーが発生しました'
        );
      }
    }, 500); // 500msの遅延

    return () => clearTimeout(timer);
  }, [code, isAutoUpdate]);

  // コンパイルされたコードを評価して実行する
  useEffect(() => {
    if (!compiledCode || !previewRef.current) return;

    const executeCode = async () => {
      try {
        // モジュールとして評価するための関数
        const AsyncFunction = Object.getPrototypeOf(
          async function () {}
        ).constructor;

        // スコープ内で利用可能な変数やライブラリを定義
        const scope = {
          React,
          ReactDOM: await import('react-dom/client'),
          exports: {},
          module: { exports: {} },
          require: (module: string) => {
            if (module === 'react') return React;
            // 必要に応じて他のモジュールも追加
            throw new Error(`モジュール ${module} は利用できません`);
          },
        };

        // コードの実行
        const modifiedCode = `
          ${compiledCode}
          // 最後に宣言されたコンポーネントを自動的にエクスポート
          if (typeof PreviewComponent !== 'undefined') {
            module.exports.default = PreviewComponent;
          }
        `;

        const fn = new AsyncFunction(...Object.keys(scope), modifiedCode);
        await fn(...Object.values(scope));

        // コンポーネントのレンダリング
        const Component =
          (scope.module.exports as ExportsWithDefault).default ||
          (scope.exports as ExportsWithDefault).default;

        if (Component && previewRef.current) {
          // プレビュー領域をクリア
          previewRef.current.innerHTML = '';

          // A4サイズ全体を使用するコンテナを作成
          const containerDiv = document.createElement('div');
          containerDiv.style.width = `${A4_WIDTH_PX}px`;
          containerDiv.style.height = `${A4_HEIGHT_PX}px`;
          containerDiv.style.position = 'absolute';
          containerDiv.style.top = '0';
          containerDiv.style.left = '0';
          containerDiv.style.backgroundColor = 'white';
          containerDiv.style.overflow = 'hidden'; // オーバーフローを隠す
          containerDiv.style.transform = 'scale(1)'; // 初期スケールを1に固定
          containerDiv.style.transformOrigin = 'top left'; // 変形の基点を左上に
          containerDiv.style.fontSize = '16px'; // 基本フォントサイズを設定
          // Componentが拡大されないようCSS変数を設定
          containerDiv.style.setProperty('--scale-factor', '1');
          containerDiv.className = 'preview-component-container';
          previewRef.current.appendChild(containerDiv);

          // コンポーネントをレンダリング
          const root = scope.ReactDOM.createRoot(containerDiv);

          // ラッパーコンポーネントを作成してサイズを制御
          const WrappedComponent = () => {
            React.useEffect(() => {
              try {
                // レンダリング後に追加のスタイル調整
                const elements = containerDiv.querySelectorAll('*');
                elements.forEach((el) => {
                  if (el instanceof HTMLElement) {
                    // フォントサイズの制限
                    const fontSize = window.getComputedStyle(el).fontSize;
                    if (fontSize && parseInt(fontSize) > 24) {
                      el.style.fontSize = '24px';
                    }

                    // 拡大を防止
                    if (
                      el.style.transform &&
                      el.style.transform.includes('scale')
                    ) {
                      el.style.transform = 'none';
                    }

                    // 幅や高さが親要素を超えないように制限
                    el.style.maxWidth = '100%';
                    el.style.maxHeight = '100%';
                    el.style.boxSizing = 'border-box';
                  }
                });

                console.log('コンポーネントのスタイル調整完了');
              } catch (err) {
                console.error('スタイル調整エラー:', err);
              }
            }, []);

            // コンポーネントのスタイル調整
            const wrapperStyle = {
              width: '100%',
              height: '100%',
              transform: 'scale(var(--scale-factor, 1))',
              transformOrigin: 'top left',
            };

            return React.createElement(
              'div',
              { style: wrapperStyle },
              React.createElement(Component)
            );
          };

          root.render(React.createElement(WrappedComponent));
        } else {
          throw new Error(
            '有効なReactコンポーネントが見つかりませんでした。コンポーネント関数が正しく定義されているか確認してください。'
          );
        }

        setError(null);
      } catch (err) {
        console.error('実行エラー:', err);
        setError(
          err instanceof Error ? err.message : '未知のエラーが発生しました'
        );

        // エラーメッセージをプレビュー領域に表示
        if (previewRef.current) {
          previewRef.current.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded bg-red-50">
            <p class="font-bold">エラー:</p>
            <pre class="whitespace-pre-wrap">${
              err instanceof Error ? err.message : '未知のエラー'
            }</pre>
          </div>`;
        }
      }
    };

    executeCode();
  }, [compiledCode]);

  // プレビューをSVGに変換
  const handleGenerateSvg = async () => {
    if (!previewRef.current) return;

    try {
      // レンダリングが完了するまで少し待機
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('SVG生成を開始します');
      setError(null);

      // プレビュー要素の現在のスタイル状態を保存
      const originalScale = scale;

      // スケールを一時的に1に設定（等倍表示）
      setScale(1);

      // スタイル変更が適用されるまで待機
      await new Promise((resolve) => setTimeout(resolve, 100));

      // html2canvasをインポート
      const html2canvas = (await import('html2canvas')).default;

      // A4サイズに完全に合わせるための準備
      const targetElement = previewRef.current.querySelector(
        '.preview-component-container'
      );

      if (!targetElement) {
        throw new Error('プレビュー要素が見つかりません');
      }

      if (!(targetElement instanceof HTMLElement)) {
        throw new Error('プレビュー要素がHTML要素ではありません');
      }

      console.log(
        'キャプチャ前のサイズ:',
        'ターゲット要素:',
        targetElement.offsetWidth,
        'x',
        targetElement.offsetHeight,
        'A4サイズ:',
        A4_WIDTH_PX,
        'x',
        A4_HEIGHT_PX
      );

      // html2canvasの設定
      const canvasOptions = {
        backgroundColor: 'white',
        scale: 1,
        useCORS: true,
        allowTaint: true,
        logging: true,
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        // サイズを明示的に固定
        windowWidth: A4_WIDTH_PX,
        windowHeight: A4_HEIGHT_PX,
      };

      // canvas生成
      const canvas = await html2canvas(targetElement, canvasOptions);

      // 元のスケールに戻す
      setScale(originalScale);

      console.log('キャンバス生成完了:', canvas.width, 'x', canvas.height);

      // 単純化されたSVG生成 - Canvasを直接imageとして埋め込む
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" 
             width="${A4_WIDTH_PX}" 
             height="${A4_HEIGHT_PX}" 
             viewBox="0 0 ${A4_WIDTH_PX} ${A4_HEIGHT_PX}">
          <image width="${A4_WIDTH_PX}" 
                 height="${A4_HEIGHT_PX}" 
                 href="${canvas.toDataURL('image/png', 1.0)}" />
        </svg>
      `;

      // SVG要素の作成
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      // SVGをデータURLに変換
      const dataUrl = await onGenerateSvg(svgElement as unknown as SVGElement);
      setDataUrl(dataUrl);

      console.log('SVG生成完了:', dataUrl.substring(0, 50) + '...');
    } catch (err) {
      console.error('SVG生成エラー:', err);
      setError(
        err instanceof Error ? err.message : '画像生成中にエラーが発生しました'
      );
    }
  };

  // 手動更新ボタンのハンドラ
  const handleManualUpdate = () => {
    try {
      // import文とexport文を削除
      const processedCode = code
        .replace(
          /import\s+.*?from\s+['"].*?['"]/g,
          '// import statements are not supported and have been removed'
        )
        .replace(/export\s+default\s+/g, ''); // export defaultを削除

      const result = transform(processedCode, {
        presets: ['react'],
        filename: 'component.jsx',
      });
      setCompiledCode(result.code || '');
      setError(null);
    } catch (err) {
      console.error('コンパイルエラー:', err);
      setError(
        err instanceof Error ? err.message : '未知のエラーが発生しました'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-7xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Reactコードエディタ（A4サイズプレビュー）</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col md:flex-row gap-4 h-full overflow-hidden'>
          <div className='flex-1 min-h-[800px] overflow-auto'>
            <div className='bg-gray-800 text-white text-xs p-2 flex justify-between items-center'>
              <span>コードエディタ</span>
              <div className='flex items-center gap-2'>
                <label className='flex items-center gap-1'>
                  <input
                    type='checkbox'
                    checked={isAutoUpdate}
                    onChange={(e) => setIsAutoUpdate(e.target.checked)}
                    className='h-3 w-3'
                  />
                  <span>自動更新</span>
                </label>
                {!isAutoUpdate && (
                  <button
                    onClick={handleManualUpdate}
                    className='px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700'
                  >
                    更新
                  </button>
                )}
              </div>
            </div>
            <MonacoEditor
              height='100%'
              language='javascript'
              theme='vs-dark'
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>
          <div className='flex-1 p-4 overflow-auto flex flex-col'>
            <div className='mb-2 flex justify-between items-center'>
              <h3 className='text-sm font-medium'>A4プレビュー</h3>
              <div className='flex items-center gap-2'>
                <label className='text-xs'>スケール:</label>
                <select
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className='text-xs p-1 border rounded'
                  aria-label='プレビューのスケール'
                >
                  <option value={0.5}>50%</option>
                  <option value={0.75}>75%</option>
                  <option value={1}>100%</option>
                </select>
                <Button
                  onClick={handleGenerateSvg}
                  size='sm'
                  disabled={!compiledCode}
                >
                  SVG生成
                </Button>
              </div>
            </div>
            {error && (
              <div className='text-red-500 text-xs p-2 bg-red-50 rounded mb-2'>
                {error}
              </div>
            )}
            <div className='overflow-auto flex justify-center items-center p-4 bg-gray-100 flex-1'>
              <div
                style={{
                  width: `${A4_WIDTH_PX}px`,
                  height: `${A4_HEIGHT_PX}px`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'center center',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  margin: '0 auto',
                }}
                className='bg-white overflow-hidden relative'
              >
                {/* A4サイズのキャンバスエリア */}
                <div
                  className='absolute top-0 left-0 w-full h-full'
                  style={{
                    border: '1px solid #e0e0e0',
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                  }}
                >
                  {/* コンポーネントが実際にレンダリングされるエリア */}
                  <div
                    ref={previewRef}
                    className='w-full h-full bg-white'
                    data-preview-ref='true'
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReactCodeEditor;
