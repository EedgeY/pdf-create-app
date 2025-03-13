import { Plugin, Schema, ZOOM } from '@pdfme/common';
import { image } from '@pdfme/schemas';

// PDF反映用のイメージプラグインをインポート
const basePdfPlugin = image.pdf;

interface RechartsSchema extends Schema {
  name: string;
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  chartData?: string;
  chartOptions?: string;
  lineType?: 'monotone' | 'linear' | 'step' | 'curve'; // 折れ線の種類
  lineColor1?: string; // 1系列目のカラー
  lineColor2?: string; // 2系列目のカラー
  showGrid?: boolean; // グリッド表示
  showPoints?: boolean; // ポイント表示
  instanceId?: string; // インスタンスID（安定的な識別用）
}

interface ChartDataItem {
  name: string;
  value: number;
  uv?: number; // UVデータ系列
  pv?: number; // PVデータ系列
}

// データURLキャッシュ
const contentCache = new Map<string, string>();

// 再レンダリングフラグを追跡するマップ
const reRenderingMap = new Map<string, boolean>();

// SVGをPNGのデータURLに変換する関数（chart.tsと同じシンプルな実装）
const svgToPngDataURL = (svgElement: SVGElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // サイズ制限を設定
      const maxWidth = 1200;
      const maxHeight = 1200;

      // SVG文字列を作成
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // タイムアウト処理の追加
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('画像の読み込みがタイムアウトしました'));
      }, 5000);

      const image = new Image();

      // 画像サイズを制限
      const originalWidth = svgElement.clientWidth;
      const originalHeight = svgElement.clientHeight;

      // アスペクト比を維持しながらサイズを制限
      let width = originalWidth * 2; // 高解像度化
      let height = originalHeight * 2;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }

      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }

      image.onload = () => {
        clearTimeout(timeout);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        // スケーリング係数を計算
        const scaleX = width / originalWidth;
        const scaleY = height / originalHeight;

        ctx.scale(scaleX, scaleY);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);

        try {
          // PNGのみを使用し、品質パラメータを調整
          const dataUrl = canvas.toDataURL('image/png', 0.9);
          URL.revokeObjectURL(svgUrl);

          // データURLの形式を検証
          if (!dataUrl.startsWith('data:image/png;base64,')) {
            reject(new Error('無効なデータURL形式です'));
            return;
          }

          resolve(dataUrl);
        } catch (e) {
          URL.revokeObjectURL(svgUrl);
          console.error('データURL生成エラー:', e);
          reject(e);
        }
      };

      image.onerror = (e) => {
        clearTimeout(timeout);
        URL.revokeObjectURL(svgUrl);
        console.error('画像読み込みエラー:', e);
        reject(e);
      };

      image.src = svgUrl;
    } catch (error) {
      console.error('SVG変換エラー:', error);
      reject(error);
    }
  });
};

// サンプルデータ（複数データ系列対応）
const sampleData: ChartDataItem[] = [
  { name: '1月', value: 400, uv: 400, pv: 240 },
  { name: '2月', value: 300, uv: 300, pv: 198 },
  { name: '3月', value: 600, uv: 600, pv: 520 },
  { name: '4月', value: 800, uv: 800, pv: 700 },
  { name: '5月', value: 500, uv: 500, pv: 400 },
  { name: '6月', value: 350, uv: 350, pv: 250 },
];

// カラーパレット
const COLORS = [
  '#8884d8',
  '#83a6ed',
  '#8dd1e1',
  '#82ca9d',
  '#a4de6c',
  '#d0ed57',
  '#ffc658',
  '#ff8042',
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
];

// サンプルデータとデフォルトオプション
const defaultOptions = {
  lineType: 'monotone',
  lineColor1: '#8884d8', // 紫
  lineColor2: '#82ca9d', // 緑
  showGrid: true,
  showPoints: true,
};

// 設定値を保持するストア
const settingsStore = new Map<string, any>();

// 安定したIDを生成
function generateStableId() {
  return Math.random().toString(36).substring(2, 15);
}

export const recharts: Plugin<RechartsSchema> = {
  ui: async (arg) => {
    const { schema, value, onChange, rootElement, mode } = arg;

    // Rechartsを動的にロードする
    if (typeof window !== 'undefined') {
      // インスタンスIDの取得または生成
      let instanceId = schema.instanceId;

      // インスタンスIDがなければ新規作成
      if (!instanceId) {
        instanceId = generateStableId();

        // スキーマにインスタンスIDを保存
        if (onChange) {
          onChange({ key: 'instanceId', value: instanceId });
          return; // IDを保存した後は一度リターンして再レンダリングを待つ
        }
      }

      // 一意のキーを使ってインスタンスを特定
      const instanceKey = instanceId;

      // 現在のストアの状態を確認
      const hasStoredSettings = settingsStore.has(instanceKey);

      // データに変更があるか確認
      let dataChanged = false;
      let currentChartData = null;

      if (hasStoredSettings) {
        const storedSettings = settingsStore.get(instanceKey);
        let newChartData;

        try {
          // JSONパース処理をtry-catchで囲む
          if (schema.chartData) {
            // JSONの前後に余分な空白があれば除去
            const cleanedJson = schema.chartData.trim();
            console.log(
              'JSONパース前のデータ:',
              cleanedJson.substring(0, 50) +
                (cleanedJson.length > 50 ? '...' : '')
            );
            newChartData = JSON.parse(cleanedJson);
            console.log(
              'JSONパース成功:',
              typeof newChartData,
              Array.isArray(newChartData) ? newChartData.length : 'オブジェクト'
            );
          } else {
            console.log('chartDataが空のためサンプルデータを使用');
            newChartData = sampleData;
          }
        } catch (error) {
          console.error('チャートデータのJSONパースに失敗しました:', error);
          // 問題箇所を特定するための詳細ログ
          if (schema.chartData) {
            const errorPosition = (error as SyntaxError).message.match(
              /position (\d+)/
            );
            if (errorPosition && errorPosition[1]) {
              const pos = parseInt(errorPosition[1]);
              const start = Math.max(0, pos - 20);
              const end = Math.min(schema.chartData.length, pos + 20);
              console.error(
                `エラー位置の前後: "${schema.chartData.substring(
                  start,
                  pos
                )}「ここでエラー」${schema.chartData.substring(pos, end)}"`
              );
            }
          }
          // 無効なJSONの場合はデフォルトデータを使用
          newChartData = sampleData;
        }

        currentChartData = storedSettings.chartData;

        // データが変更されたかチェック（単純比較）
        if (JSON.stringify(newChartData) !== JSON.stringify(currentChartData)) {
          console.log(
            'チャートデータが変更されました - 古い長さ:',
            Array.isArray(currentChartData) ? currentChartData.length : '不明',
            '新しい長さ:',
            Array.isArray(newChartData) ? newChartData.length : '不明'
          );
          storedSettings.chartData = newChartData;
          dataChanged = true;
        }
      }

      // ストアに初期設定を保存
      if (!hasStoredSettings) {
        settingsStore.set(instanceKey, {
          lineType: schema.lineType || defaultOptions.lineType,
          lineColor1: schema.lineColor1 || defaultOptions.lineColor1,
          lineColor2: schema.lineColor2 || defaultOptions.lineColor2,
          showGrid:
            schema.showGrid !== undefined
              ? schema.showGrid
              : defaultOptions.showGrid,
          showPoints:
            schema.showPoints !== undefined
              ? schema.showPoints
              : defaultOptions.showPoints,
          chartData: schema.chartData
            ? JSON.parse(schema.chartData)
            : sampleData,
          chartOptions: schema.chartOptions
            ? JSON.parse(schema.chartOptions)
            : {},
          initialized: false,
          pendingChanges: false,
          lastPosition: {
            x: schema.position?.x || 0,
            y: schema.position?.y || 0,
          },
        });
      }

      // 現在の設定を取得
      const currentSettings = settingsStore.get(instanceKey);

      // チャートが移動中かどうかを判定
      const currentPosition = {
        x: schema.position?.x || 0,
        y: schema.position?.y || 0,
      };
      const lastPosition = currentSettings.lastPosition;

      const isMoving =
        currentPosition.x !== lastPosition.x ||
        currentPosition.y !== lastPosition.y;

      // 移動中は位置情報だけ更新して再レンダリングをスキップ
      if (isMoving) {
        currentSettings.lastPosition = currentPosition;

        // 移動中に画像の更新をしない（移動が終わると更新される）
        if (typeof value === 'object' && value && 'content' in value) {
          return;
        }
      }

      // レンダリング用のコンテナを作成
      const container = document.createElement('div');
      container.style.width = `${schema.width * ZOOM}px`;
      container.style.height = `${schema.height * ZOOM}px`;
      container.style.overflow = 'hidden';
      container.style.position = 'relative';
      container.style.backgroundColor = 'white';

      // コンテナを親要素に追加
      rootElement.appendChild(container);

      // SVG要素を取得してPNGに変換（変更適用時は既に処理済みのためスキップ）
      if (
        onChange &&
        ((!currentSettings.pendingChanges && isMoving) || dataChanged)
      ) {
        try {
          console.log(
            dataChanged
              ? 'データ変更によりチャートを再レンダリングします'
              : 'チャートが移動しました、再レンダリングします'
          );

          // チャートオプションの準備
          const chartOptions = {
            lineType: currentSettings.lineType,
            lineColor1: currentSettings.lineColor1,
            lineColor2: currentSettings.lineColor2,
            showGrid: currentSettings.showGrid,
            showPoints: currentSettings.showPoints,
            ...currentSettings.chartOptions,
            onChange: onChange,
          };

          // チャートを再描画（これによりSVG→PNG変換も行われる）
          renderChart(
            container,
            currentSettings.chartData,
            schema,
            chartOptions
          );
        } catch (e) {
          console.error('チャートの再描画に失敗しました:', e);
        }
      } else {
        // 通常の初期レンダリング（移動やデータ変更がない場合）
        // データの取得 (schema.chartDataから、またはサンプルデータを使用)
        const chartData = currentSettings.chartData;

        // チャートオプションの取得
        const options = {
          lineType: currentSettings.lineType,
          lineColor1: currentSettings.lineColor1,
          lineColor2: currentSettings.lineColor2,
          showGrid: currentSettings.showGrid,
          showPoints: currentSettings.showPoints,
          ...currentSettings.chartOptions,
          onChange: onChange,
        };

        // チャートの描画
        renderChart(container, chartData, schema, options);
      }

      // コントロールパネルの作成（変更適用ボタン）
      if (currentSettings.pendingChanges) {
        const controlPanel = document.createElement('div');
        controlPanel.style.position = 'absolute';
        controlPanel.style.top = '5px';
        controlPanel.style.right = '5px';
        controlPanel.style.zIndex = '100';
        controlPanel.setAttribute('data-type', 'controlPanel'); // 特定しやすくするための属性を追加

        const applyButton = document.createElement('button');
        applyButton.textContent = '変更を適用';
        applyButton.style.backgroundColor = '#4CAF50';
        applyButton.style.color = 'white';
        applyButton.style.border = 'none';
        applyButton.style.padding = '5px 10px';
        applyButton.style.borderRadius = '4px';
        applyButton.style.cursor = 'pointer';
        applyButton.style.fontSize = '12px';

        // 変更適用ボタンのイベントハンドラー
        applyButton.addEventListener('click', () => {
          // 変更適用フラグをリセット
          currentSettings.pendingChanges = false;

          try {
            // onChangeが存在することを確認
            if (onChange) {
              // 現在の設定をスキーマに適用
              onChange({ key: 'lineType', value: currentSettings.lineType });
              onChange({
                key: 'lineColor1',
                value: currentSettings.lineColor1,
              });
              onChange({
                key: 'lineColor2',
                value: currentSettings.lineColor2,
              });
              onChange({ key: 'showGrid', value: currentSettings.showGrid });
              onChange({
                key: 'showPoints',
                value: currentSettings.showPoints,
              });

              console.log('設定を更新しました、チャートを再レンダリングします');

              // チャートを再レンダリング
              const chartOptions = {
                lineType: currentSettings.lineType,
                lineColor1: currentSettings.lineColor1,
                lineColor2: currentSettings.lineColor2,
                showGrid: currentSettings.showGrid,
                showPoints: currentSettings.showPoints,
                ...currentSettings.chartOptions,
                onChange: onChange,
              };

              // コンテナをクリア
              while (container.firstChild) {
                if (container.firstChild !== controlPanel) {
                  container.removeChild(container.firstChild);
                } else {
                  break;
                }
              }

              // チャートを再描画
              renderChart(
                container,
                currentSettings.chartData,
                schema,
                chartOptions
              );

              console.log('チャートの再描画が完了しました');
            } else {
              console.warn('変更ハンドラーがないため、設定を更新できません');
            }
          } catch (e) {
            console.error('変更適用中にエラーが発生しました:', e);
          }
        });

        controlPanel.appendChild(applyButton);
        container.appendChild(controlPanel);

        // 変更待ちの通知
        const notification = document.createElement('div');
        notification.textContent = '変更が保留中です';
        notification.style.position = 'absolute';
        notification.style.top = '5px';
        notification.style.left = '5px';
        notification.style.backgroundColor = 'rgba(255, 152, 0, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '4px 8px';
        notification.style.borderRadius = '4px';
        notification.style.fontSize = '12px';
        container.appendChild(notification);
      }
    }
  },
  // PDF生成用プラグイン
  pdf: (arg) => {
    const { value, schema, pdfDoc, page, _cache } = arg;

    // コンテンツを確認（デバッグ用）
    if (value) {
      console.log('PDF生成: コンテンツあり', value.substring(0, 50) + '...');
    } else {
      console.warn('PDF生成: コンテンツなし');
    }

    // 標準のimage.pdfプラグインを使用
    return image.pdf(arg);
  },
  propPanel: {
    schema: {
      chartType: {
        title: 'チャートタイプ',
        type: 'string',
        enum: ['bar', 'line', 'pie', 'area'],
        default: 'bar',
      },
      chartData: {
        title: 'チャートデータ (JSON)',
        type: 'string',
        format: 'textarea',
        default: JSON.stringify(sampleData, null, 2),
      },
      lineType: {
        title: '線のタイプ',
        type: 'string',
        enum: ['monotone', 'linear', 'step', 'curve'],
        default: 'monotone',
        description: '折れ線やエリアチャートの線のタイプを指定します',
      },
      lineColor1: {
        title: '線の色1',
        type: 'string',
        format: 'color',
        default: '#8884d8',
        description: '1系列目（UVまたは主系列）の色を指定します',
      },
      lineColor2: {
        title: '線の色2',
        type: 'string',
        format: 'color',
        default: '#82ca9d',
        description: '2系列目（PV）の色を指定します',
      },
      showGrid: {
        title: 'グリッド表示',
        type: 'boolean',
        default: true,
        description: 'グリッド線を表示するかどうか',
      },
      showPoints: {
        title: 'ポイント表示',
        type: 'boolean',
        default: true,
        description: '折れ線グラフのポイントを表示するかどうか',
      },
      chartOptions: {
        title: '追加設定 (JSON)',
        type: 'string',
        format: 'textarea',
        default: JSON.stringify({}, null, 2),
        description: '高度な設定をJSON形式で指定します',
      },
      instanceId: {
        type: 'string',
        default: '',
        visible: false, // UI上では非表示
      },
    },
    defaultSchema: {
      type: 'recharts',
      name: 'Rechartsチャート',
      chartType: 'bar',
      chartData: JSON.stringify(sampleData),
      lineType: 'monotone',
      lineColor1: '#8884d8',
      lineColor2: '#82ca9d',
      showGrid: true,
      showPoints: true,
      chartOptions: JSON.stringify({}),
      content: '',
      position: { x: 0, y: 0 },
      width: 150,
      height: 100,
      instanceId: '',
    },
  },
};

// チャート共通の初期化関数
function initializeChart(
  container: HTMLDivElement,
  schema: RechartsSchema,
  isPieChart: boolean = false
) {
  const width = schema.width * ZOOM;
  const height = schema.height * ZOOM;
  const margin = isPieChart
    ? { top: 20, right: 20, bottom: 20, left: 20 }
    : { top: 20, right: 30, left: 40, bottom: 40 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // SVG要素の作成
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.style.fontFamily = 'sans-serif';
  svg.style.backgroundColor = 'white';

  // グラフエリアの作成
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  if (isPieChart) {
    g.setAttribute('transform', `translate(${width / 2},${height / 2})`);
  } else {
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);
  }

  svg.appendChild(g);

  return {
    svg,
    g,
    width,
    height,
    margin,
    chartWidth,
    chartHeight,
  };
}

// 軸を描画する共通関数
function drawAxes(
  g: SVGGElement,
  chartWidth: number,
  chartHeight: number,
  showGrid: boolean = false,
  maxValue: number = 100 // Y軸の最大値
) {
  // X軸とY軸の作成
  const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  xAxis.setAttribute('x1', '0');
  xAxis.setAttribute('y1', String(chartHeight));
  xAxis.setAttribute('x2', String(chartWidth));
  xAxis.setAttribute('y2', String(chartHeight));
  xAxis.setAttribute('stroke', '#000');
  g.appendChild(xAxis);

  const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  yAxis.setAttribute('x1', '0');
  yAxis.setAttribute('y1', '0');
  yAxis.setAttribute('x2', '0');
  yAxis.setAttribute('y2', String(chartHeight));
  yAxis.setAttribute('stroke', '#000');
  g.appendChild(yAxis);

  // グリッド線の描画とY軸ラベル
  const gridCount = 5;

  // Y軸ラベルを追加（常に表示）
  for (let i = 0; i <= gridCount; i++) {
    const y = (chartHeight / gridCount) * i;
    const value = Math.round((maxValue * (gridCount - i)) / gridCount);

    // ラベルを追加
    const yLabel = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    yLabel.setAttribute('x', '-5');
    yLabel.setAttribute('y', String(y + 4)); // 少し下にずらして中央に配置
    yLabel.setAttribute('text-anchor', 'end');
    yLabel.setAttribute('font-size', '10');
    yLabel.setAttribute('fill', '#666');
    yLabel.textContent = String(value);
    g.appendChild(yLabel);

    // グリッド線はshowGridがtrueの場合のみ描画
    if (showGrid && i > 0) {
      const hGrid = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      hGrid.setAttribute('x1', '0');
      hGrid.setAttribute('y1', String(y));
      hGrid.setAttribute('x2', String(chartWidth));
      hGrid.setAttribute('y2', String(y));
      hGrid.setAttribute('stroke', '#e0e0e0');
      hGrid.setAttribute('stroke-dasharray', '4,4');
      g.appendChild(hGrid);
    }
  }

  // 垂直グリッド線（showGridがtrueの場合のみ）
  if (showGrid) {
    for (let i = 1; i < gridCount; i++) {
      const x = (chartWidth / gridCount) * i;
      const vGrid = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line'
      );
      vGrid.setAttribute('x1', String(x));
      vGrid.setAttribute('y1', '0');
      vGrid.setAttribute('x2', String(x));
      vGrid.setAttribute('y2', String(chartHeight));
      vGrid.setAttribute('stroke', '#e0e0e0');
      vGrid.setAttribute('stroke-dasharray', '4,4');
      g.appendChild(vGrid);
    }
  }
}

// パスを生成する共通関数（折れ線やエリアチャート用）
function generatePath(points: [number, number][], lineType: string) {
  // ポイントが少なすぎる場合は直線で繋ぐ
  if (points.length < 3) {
    return `M ${points.map((p) => p.join(' ')).join(' L ')}`;
  }

  // 直線の場合はシンプルなパス
  if (lineType === 'linear') {
    return `M ${points.map((p) => p.join(' ')).join(' L ')}`;
  }

  // 階段状
  if (lineType === 'step') {
    let path = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      const [prevX] = points[i - 1];
      path += ` H ${x} V ${y}`;
    }
    return path;
  }

  // カーブ (曲線)
  if (lineType === 'curve') {
    let path = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      const [x0, y0] = points[i - 1];
      const controlX1 = x0 + (x - x0) / 3;
      const controlX2 = x0 + (2 * (x - x0)) / 3;
      path += ` C ${controlX1} ${y0}, ${controlX2} ${y}, ${x} ${y}`;
    }
    return path;
  }

  // monotone (デフォルト)
  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i];
    const [x0, y0] = points[i - 1];
    const cp1x = x0 + (x - x0) / 3;
    const cp1y = y0;
    const cp2x = x - (x - x0) / 3;
    const cp2y = y;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
  }
  return path;
}

// チャートをレンダリングする統合関数
function renderChart(
  container: HTMLDivElement,
  data: ChartDataItem[],
  schema: RechartsSchema,
  options: any
) {
  // スキーマの値をオプションに反映する
  if (schema.showPoints !== undefined && options.showPoints === undefined) {
    options.showPoints = schema.showPoints;
  }

  if (schema.showGrid !== undefined && options.showGrid === undefined) {
    options.showGrid = schema.showGrid;
  }

  if (schema.lineType && options.lineType === undefined) {
    options.lineType = schema.lineType;
  }

  console.log(
    'レンダリング開始:',
    schema.chartType,
    'データ数:',
    data.length,
    'オプション:',
    JSON.stringify({
      lineType: options.lineType,
      showGrid: options.showGrid,
      showPoints: options.showPoints,
    }),
    'スキーマ設定:',
    JSON.stringify({
      lineType: schema.lineType,
      showGrid: schema.showGrid,
      showPoints: schema.showPoints,
    })
  );

  // ポイント表示設定を確認
  if (options.showPoints) {
    console.log('ポイント表示が有効です');
  } else {
    console.log(
      'ポイント表示が無効です - options.showPoints:',
      options.showPoints,
      'schema.showPoints:',
      schema.showPoints
    );
  }

  // データ内容のログ（最初の要素）
  if (data.length > 0) {
    console.log('データサンプル:', JSON.stringify(data[0]));
  }

  // コンテナをクリア（コントロールパネルは除く）
  const controlPanel = container.querySelector(
    '[data-type="controlPanel"]'
  ) as HTMLElement;
  while (container.firstChild) {
    if (container.firstChild !== controlPanel) {
      container.removeChild(container.firstChild);
    } else {
      break;
    }
  }

  // チャートタイプに基づいてレンダリング
  const chartType = schema.chartType || 'bar';

  switch (chartType) {
    case 'line':
      renderLineChart(container, data, schema, options);
      break;
    case 'pie':
      renderPieChart(container, data, schema, options);
      break;
    case 'area':
      renderAreaChart(container, data, schema, options);
      break;
    case 'bar':
    default:
      renderBarChart(container, data, schema, options);
      break;
  }

  // SVG要素を取得してPNGに変換
  if (options.onChange) {
    // レンダリング完了を待つために少し長めの遅延を設定
    setTimeout(() => {
      try {
        // SVG要素の取得を確実にするため、直接childNodesから検索
        let svgElement: SVGElement | null = null;
        for (let i = 0; i < container.childNodes.length; i++) {
          const node = container.childNodes[i];
          if (node.nodeName.toLowerCase() === 'svg') {
            svgElement = node as SVGElement;
            break;
          }
        }

        if (svgElement) {
          console.log(
            'SVG要素を取得しました:',
            svgElement.getAttribute('width'),
            'x',
            svgElement.getAttribute('height')
          );

          // SVGをPNGのデータURLに変換
          svgToPngDataURL(svgElement)
            .then((dataUrl) => {
              if (dataUrl) {
                console.log('データURL生成成功: 長さ', dataUrl.length);
                options.onChange({ key: 'content', value: dataUrl });

                // キャッシュに保存（将来的な最適化用）
                const cacheKey = `${schema.instanceId || ''}-${
                  schema.chartType || ''
                }`;
                contentCache.set(cacheKey, dataUrl);
              }
            })
            .catch((e) => {
              console.error('チャートデータURL生成失敗:', e);
            });
        } else {
          console.error(
            'SVG要素が見つかりません。コンテナ内の要素:',
            container.innerHTML.substring(0, 200)
          );
        }
      } catch (e) {
        console.error('チャート画像の生成処理中にエラーが発生:', e);
      }
    }, 200); // レンダリング完了を確実にするため少し長めに設定
  }
}

// 棒グラフを描画する関数（最適化版）
function renderBarChart(
  container: HTMLDivElement,
  data: ChartDataItem[],
  schema: RechartsSchema,
  options: any
) {
  const { svg, g, chartWidth, chartHeight } = initializeChart(
    container,
    schema
  );

  // データの最大値を取得
  const maxValue = Math.max(...data.map((d) => d.value)) * 1.1;

  // 軸を描画（maxValueを渡す）
  drawAxes(g, chartWidth, chartHeight, options.showGrid, maxValue);

  // バーチャートの描画
  const barWidth = (chartWidth / data.length) * 0.6;
  const barPadding = (chartWidth / data.length) * 0.2;

  data.forEach((d, i) => {
    // バーの描画
    const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const barHeight = (d.value / maxValue) * chartHeight;
    const barX = i * (barWidth + barPadding) + barPadding / 2;
    const barY = chartHeight - barHeight;

    bar.setAttribute('x', String(barX));
    bar.setAttribute('y', String(barY));
    bar.setAttribute('width', String(barWidth));
    bar.setAttribute('height', String(barHeight));
    bar.setAttribute('fill', options.lineColor1 || '#8884d8');
    g.appendChild(bar);

    // ラベルの描画
    const label = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    label.setAttribute('x', String(barX + barWidth / 2));
    label.setAttribute('y', String(chartHeight + 16));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '10');
    label.textContent = d.name;
    g.appendChild(label);

    // 値の表示
    const valueText = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    valueText.setAttribute('x', String(barX + barWidth / 2));
    valueText.setAttribute('y', String(barY - 5));
    valueText.setAttribute('text-anchor', 'middle');
    valueText.setAttribute('font-size', '10');
    valueText.setAttribute('fill', '#555');
    valueText.textContent = String(d.value);
    g.appendChild(valueText);
  });

  // タイトルと凡例
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', String(chartWidth / 2));
  title.setAttribute('y', '-5');
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('font-size', '12');
  title.setAttribute('font-weight', 'bold');
  title.textContent = 'Rechartsスタイル棒グラフ';
  g.appendChild(title);

  container.appendChild(svg);
}

// 折れ線グラフを描画する関数（最適化版）
function renderLineChart(
  container: HTMLDivElement,
  data: ChartDataItem[],
  schema: RechartsSchema,
  options: any
) {
  const { svg, g, chartWidth, chartHeight } = initializeChart(
    container,
    schema
  );

  // UVとPVの値が存在するか確認
  const hasUVPV = data.some((d) => d.uv !== undefined && d.pv !== undefined);

  // データの最大値を取得
  let maxValue: number;
  if (hasUVPV) {
    const allValues = data.flatMap((d) => [d.uv || 0, d.pv || 0]);
    maxValue = Math.max(...allValues) * 1.1;
  } else {
    maxValue = Math.max(...data.map((d) => d.value)) * 1.1;
  }

  // 軸を描画（maxValueを渡す）
  drawAxes(g, chartWidth, chartHeight, options.showGrid, maxValue);

  // X軸の位置を計算
  const xStep = chartWidth / Math.max(1, data.length - 1);

  // ポイントの配列を作成
  const linePoints: [number, number][] = [];
  const uvPoints: [number, number][] = [];
  const pvPoints: [number, number][] = [];

  data.forEach((d, i) => {
    const x = i * xStep;

    if (hasUVPV) {
      const uvY = chartHeight - ((d.uv || 0) / maxValue) * chartHeight;
      const pvY = chartHeight - ((d.pv || 0) / maxValue) * chartHeight;
      uvPoints.push([x, uvY]);
      pvPoints.push([x, pvY]);
    } else {
      const y = chartHeight - (d.value / maxValue) * chartHeight;
      linePoints.push([x, y]);
    }

    // X軸ラベル
    const label = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    label.setAttribute('x', String(x));
    label.setAttribute('y', String(chartHeight + 16));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '10');
    label.textContent = d.name;
    g.appendChild(label);
  });

  // 折れ線パスの作成と描画
  const lineType = options.lineType || 'monotone';

  if (hasUVPV) {
    // UVライン
    const uvPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    uvPath.setAttribute('d', generatePath(uvPoints, lineType));
    uvPath.setAttribute('fill', 'none');
    uvPath.setAttribute('stroke', options.lineColor1 || '#8884d8');
    uvPath.setAttribute('stroke-width', '2');
    g.appendChild(uvPath);

    // PVライン
    const pvPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    pvPath.setAttribute('d', generatePath(pvPoints, lineType));
    pvPath.setAttribute('fill', 'none');
    pvPath.setAttribute('stroke', options.lineColor2 || '#82ca9d');
    pvPath.setAttribute('stroke-width', '2');
    g.appendChild(pvPath);

    // ポイントの描画
    if (options.showPoints) {
      console.log('UVポイントを描画します', uvPoints.length);
      uvPoints.forEach(([x, y], i) => {
        const point = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle'
        );
        point.setAttribute('cx', String(x));
        point.setAttribute('cy', String(y));
        point.setAttribute('r', '4');
        point.setAttribute('fill', options.lineColor1 || '#8884d8');
        g.appendChild(point);

        // 値ラベルも表示
        const valueLabel = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text'
        );
        valueLabel.setAttribute('x', String(x));
        valueLabel.setAttribute('y', String(y - 8));
        valueLabel.setAttribute('text-anchor', 'middle');
        valueLabel.setAttribute('font-size', '9');
        valueLabel.setAttribute('fill', options.lineColor1 || '#8884d8');
        valueLabel.textContent = String(data[i].uv);
        g.appendChild(valueLabel);
      });

      console.log('PVポイントを描画します', pvPoints.length);
      pvPoints.forEach(([x, y], i) => {
        const point = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle'
        );
        point.setAttribute('cx', String(x));
        point.setAttribute('cy', String(y));
        point.setAttribute('r', '4');
        point.setAttribute('fill', options.lineColor2 || '#82ca9d');
        g.appendChild(point);

        // 値ラベルも表示
        const valueLabel = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text'
        );
        valueLabel.setAttribute('x', String(x));
        valueLabel.setAttribute('y', String(y - 8));
        valueLabel.setAttribute('text-anchor', 'middle');
        valueLabel.setAttribute('font-size', '9');
        valueLabel.setAttribute('fill', options.lineColor2 || '#82ca9d');
        valueLabel.textContent = String(data[i].pv);
        g.appendChild(valueLabel);
      });
    }
  } else {
    // 単一系列
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', generatePath(linePoints, lineType));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', options.lineColor1 || '#8884d8');
    path.setAttribute('stroke-width', '2');
    g.appendChild(path);

    // ポイントの描画
    if (options.showPoints) {
      console.log('ポイントを描画します', linePoints.length);
      linePoints.forEach(([x, y], i) => {
        const point = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle'
        );
        point.setAttribute('cx', String(x));
        point.setAttribute('cy', String(y));
        point.setAttribute('r', '4');
        point.setAttribute('fill', options.lineColor1 || '#8884d8');
        g.appendChild(point);

        // 値ラベルも表示
        const valueLabel = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text'
        );
        valueLabel.setAttribute('x', String(x));
        valueLabel.setAttribute('y', String(y - 8));
        valueLabel.setAttribute('text-anchor', 'middle');
        valueLabel.setAttribute('font-size', '9');
        valueLabel.setAttribute('fill', options.lineColor1 || '#8884d8');
        valueLabel.textContent = String(data[i].value);
        g.appendChild(valueLabel);
      });
    }
  }

  // タイトル
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', String(chartWidth / 2));
  title.setAttribute('y', '-5');
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('font-size', '12');
  title.setAttribute('font-weight', 'bold');
  title.textContent = 'Rechartsスタイル折れ線グラフ';
  g.appendChild(title);

  container.appendChild(svg);
}

// 円グラフを描画する関数（最適化版）
function renderPieChart(
  container: HTMLDivElement,
  data: ChartDataItem[],
  schema: RechartsSchema,
  options: any
) {
  const { svg, g } = initializeChart(container, schema, true);
  const width = schema.width * ZOOM;
  const height = schema.height * ZOOM;

  // 合計値を計算
  const total = data.reduce((sum, d) => sum + d.value, 0);

  // 円グラフの半径
  const radius = (Math.min(width, height) / 2) * 0.7;

  // 円グラフの描画
  let startAngle = 0;

  data.forEach((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;

    // 円弧のパスデータを作成
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    const startX = radius * Math.cos(startAngle);
    const startY = radius * Math.sin(startAngle);
    const endX = radius * Math.cos(endAngle);
    const endY = radius * Math.sin(endAngle);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      `M 0 0 L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`
    );

    // 色を割り当て
    const colorIndex = i % COLORS.length;
    path.setAttribute('fill', COLORS[colorIndex]);

    g.appendChild(path);

    // ラベルの位置
    const labelAngle = startAngle + angle / 2;
    const labelRadius = radius * 0.7;
    const labelX = labelRadius * Math.cos(labelAngle);
    const labelY = labelRadius * Math.sin(labelAngle);

    // パーセンテージラベルの描画
    const percentage = Math.round((d.value / total) * 100);
    if (percentage >= 5) {
      // 5%以上の部分にのみラベルを表示
      const label = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      label.setAttribute('x', String(labelX));
      label.setAttribute('y', String(labelY));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', 'white');
      label.setAttribute('font-size', '10');
      label.setAttribute('font-weight', 'bold');
      label.textContent = `${percentage}%`;
      g.appendChild(label);
    }

    startAngle = endAngle;
  });

  // 凡例を作成
  const legendGroup = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'g'
  );
  legendGroup.setAttribute(
    'transform',
    `translate(${-width / 2 + 20},${height / 2 - 20})`
  );

  data.forEach((d, i) => {
    const colorIndex = i % COLORS.length;
    const legendItem = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );
    legendItem.setAttribute('transform', `translate(0,${-i * 15})`);

    const legendColor = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect'
    );
    legendColor.setAttribute('width', '10');
    legendColor.setAttribute('height', '10');
    legendColor.setAttribute('fill', COLORS[colorIndex]);
    legendItem.appendChild(legendColor);

    const legendText = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    legendText.setAttribute('x', '15');
    legendText.setAttribute('y', '9');
    legendText.setAttribute('font-size', '10');
    legendText.textContent = `${d.name} (${d.value})`;
    legendItem.appendChild(legendText);

    legendGroup.appendChild(legendItem);
  });

  svg.appendChild(legendGroup);
  container.appendChild(svg);
}

// エリアチャートを描画する関数（最適化版）
function renderAreaChart(
  container: HTMLDivElement,
  data: ChartDataItem[],
  schema: RechartsSchema,
  options: any
) {
  const { svg, g, chartWidth, chartHeight } = initializeChart(
    container,
    schema
  );

  // UVとPVの値が存在するか確認
  const hasUVPV = data.some((d) => d.uv !== undefined && d.pv !== undefined);

  // データの最大値を取得
  let maxValue: number;
  if (hasUVPV) {
    const allValues = data.flatMap((d) => [d.uv || 0, d.pv || 0]);
    maxValue = Math.max(...allValues) * 1.1;
  } else {
    maxValue = Math.max(...data.map((d) => d.value)) * 1.1;
  }

  // 軸を描画（maxValueを渡す）
  drawAxes(g, chartWidth, chartHeight, options.showGrid, maxValue);

  // X軸の位置を計算
  const xStep = chartWidth / Math.max(1, data.length - 1);

  // ポイントの配列を作成
  const linePoints: [number, number][] = [];
  const uvPoints: [number, number][] = [];
  const pvPoints: [number, number][] = [];

  data.forEach((d, i) => {
    const x = i * xStep;

    if (hasUVPV) {
      const uvY = chartHeight - ((d.uv || 0) / maxValue) * chartHeight;
      const pvY = chartHeight - ((d.pv || 0) / maxValue) * chartHeight;
      uvPoints.push([x, uvY]);
      pvPoints.push([x, pvY]);
    } else {
      const y = chartHeight - (d.value / maxValue) * chartHeight;
      linePoints.push([x, y]);
    }

    // X軸ラベル
    const label = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );
    label.setAttribute('x', String(x));
    label.setAttribute('y', String(chartHeight + 16));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '10');
    label.textContent = d.name;
    g.appendChild(label);
  });

  // エリアの描画
  const lineType = options.lineType || 'monotone';

  if (hasUVPV) {
    // UV エリア
    const areaPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    const areaPathData = generateAreaPath(uvPoints, lineType, chartHeight);
    areaPath.setAttribute('d', areaPathData);
    areaPath.setAttribute('fill', options.lineColor1 || '#8884d8');
    areaPath.setAttribute('fill-opacity', '0.3');
    g.appendChild(areaPath);

    // PV エリア
    const areaPath2 = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    const areaPathData2 = generateAreaPath(pvPoints, lineType, chartHeight);
    areaPath2.setAttribute('d', areaPathData2);
    areaPath2.setAttribute('fill', options.lineColor2 || '#82ca9d');
    areaPath2.setAttribute('fill-opacity', '0.3');
    g.appendChild(areaPath2);

    // 線の描画
    const uvPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    uvPath.setAttribute('d', generatePath(uvPoints, lineType));
    uvPath.setAttribute('fill', 'none');
    uvPath.setAttribute('stroke', options.lineColor1 || '#8884d8');
    uvPath.setAttribute('stroke-width', '2');
    g.appendChild(uvPath);

    const pvPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    pvPath.setAttribute('d', generatePath(pvPoints, lineType));
    pvPath.setAttribute('fill', 'none');
    pvPath.setAttribute('stroke', options.lineColor2 || '#82ca9d');
    pvPath.setAttribute('stroke-width', '2');
    g.appendChild(pvPath);

    // ポイントの描画
    if (options.showPoints) {
      console.log('エリアチャート UVポイントを描画します', uvPoints.length);
      uvPoints.forEach(([x, y], i) => {
        const point = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle'
        );
        point.setAttribute('cx', String(x));
        point.setAttribute('cy', String(y));
        point.setAttribute('r', '4');
        point.setAttribute('fill', options.lineColor1 || '#8884d8');
        g.appendChild(point);

        // 値ラベルも表示
        const valueLabel = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text'
        );
        valueLabel.setAttribute('x', String(x));
        valueLabel.setAttribute('y', String(y - 8));
        valueLabel.setAttribute('text-anchor', 'middle');
        valueLabel.setAttribute('font-size', '9');
        valueLabel.setAttribute('fill', options.lineColor1 || '#8884d8');
        valueLabel.textContent = String(data[i].uv);
        g.appendChild(valueLabel);
      });

      console.log('エリアチャート PVポイントを描画します', pvPoints.length);
      pvPoints.forEach(([x, y], i) => {
        const point = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle'
        );
        point.setAttribute('cx', String(x));
        point.setAttribute('cy', String(y));
        point.setAttribute('r', '4');
        point.setAttribute('fill', options.lineColor2 || '#82ca9d');
        g.appendChild(point);

        // 値ラベルも表示
        const valueLabel = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text'
        );
        valueLabel.setAttribute('x', String(x));
        valueLabel.setAttribute('y', String(y - 8));
        valueLabel.setAttribute('text-anchor', 'middle');
        valueLabel.setAttribute('font-size', '9');
        valueLabel.setAttribute('fill', options.lineColor2 || '#82ca9d');
        valueLabel.textContent = String(data[i].pv);
        g.appendChild(valueLabel);
      });
    }
  } else {
    // 単一系列のエリア
    const areaPath = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'path'
    );
    const areaPathData = generateAreaPath(linePoints, lineType, chartHeight);
    areaPath.setAttribute('d', areaPathData);
    areaPath.setAttribute('fill', options.lineColor1 || '#8884d8');
    areaPath.setAttribute('fill-opacity', '0.3');
    g.appendChild(areaPath);

    // 線の描画
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', generatePath(linePoints, lineType));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', options.lineColor1 || '#8884d8');
    path.setAttribute('stroke-width', '2');
    g.appendChild(path);

    // ポイントの描画
    if (options.showPoints) {
      console.log('エリアチャート ポイントを描画します', linePoints.length);
      linePoints.forEach(([x, y], i) => {
        const point = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'circle'
        );
        point.setAttribute('cx', String(x));
        point.setAttribute('cy', String(y));
        point.setAttribute('r', '4');
        point.setAttribute('fill', options.lineColor1 || '#8884d8');
        g.appendChild(point);

        // 値ラベルも表示
        const valueLabel = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text'
        );
        valueLabel.setAttribute('x', String(x));
        valueLabel.setAttribute('y', String(y - 8));
        valueLabel.setAttribute('text-anchor', 'middle');
        valueLabel.setAttribute('font-size', '9');
        valueLabel.setAttribute('fill', options.lineColor1 || '#8884d8');
        valueLabel.textContent = String(data[i].value);
        g.appendChild(valueLabel);
      });
    }
  }

  // タイトル
  const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  title.setAttribute('x', String(chartWidth / 2));
  title.setAttribute('y', '-5');
  title.setAttribute('text-anchor', 'middle');
  title.setAttribute('font-size', '12');
  title.setAttribute('font-weight', 'bold');
  title.textContent = 'Rechartsスタイルエリアチャート';
  g.appendChild(title);

  container.appendChild(svg);
}

// エリアパスを生成する関数
function generateAreaPath(
  points: [number, number][],
  lineType: string,
  baseline: number
) {
  // 線のパスを取得
  const linePath = generatePath(points, lineType);

  // エリアパスを作成
  return `${linePath} L ${points[points.length - 1][0]} ${baseline} L ${
    points[0][0]
  } ${baseline} Z`;
}

export default recharts;
