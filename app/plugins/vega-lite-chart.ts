import { Plugin, Schema, ZOOM } from '@pdfme/common';
import { image } from '@pdfme/schemas';
import vegaEmbed from 'vega-embed';

interface VegaLiteChartSchema extends Schema {
  name: string;
  vegaLiteSpec?: string;
  chartTemplate?: string;
  width: number;
  height: number;
}

// サンプルVega-Liteスペック
const sampleSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  description: 'A simple bar chart with embedded data.',
  data: {
    values: [
      { category: '1月', amount: 28 },
      { category: '2月', amount: 55 },
      { category: '3月', amount: 43 },
      { category: '4月', amount: 91 },
      { category: '5月', amount: 81 },
      { category: '6月', amount: 53 },
    ],
  },
  mark: 'bar',
  encoding: {
    x: { field: 'category', type: 'nominal', axis: { labelAngle: 0 } },
    y: { field: 'amount', type: 'quantitative' },
    color: { field: 'category', type: 'nominal', legend: null },
  },
};

// テンプレート集
const chartTemplates = {
  bar: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '棒グラフ',
    data: {
      values: [
        { category: '1月', amount: 28 },
        { category: '2月', amount: 55 },
        { category: '3月', amount: 43 },
        { category: '4月', amount: 91 },
        { category: '5月', amount: 81 },
        { category: '6月', amount: 53 },
      ],
    },
    mark: 'bar',
    encoding: {
      x: { field: 'category', type: 'nominal', axis: { labelAngle: 0 } },
      y: { field: 'amount', type: 'quantitative' },
      color: { field: 'category', type: 'nominal', legend: null },
    },
  },
  line: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '折れ線グラフ',
    data: {
      values: [
        { date: '2023-01-01', value: 10 },
        { date: '2023-02-01', value: 30 },
        { date: '2023-03-01', value: 25 },
        { date: '2023-04-01', value: 40 },
        { date: '2023-05-01', value: 35 },
        { date: '2023-06-01', value: 50 },
      ],
    },
    mark: 'line',
    encoding: {
      x: {
        field: 'date',
        type: 'temporal',
        timeUnit: 'monthdate',
        axis: { title: '日付', format: '%m/%d' },
      },
      y: { field: 'value', type: 'quantitative' },
      color: { value: '#4c78a8' },
    },
  },
  pie: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '円グラフ',
    data: {
      values: [
        { category: 'A', value: 30 },
        { category: 'B', value: 20 },
        { category: 'C', value: 15 },
        { category: 'D', value: 25 },
        { category: 'E', value: 10 },
      ],
    },
    mark: 'arc',
    encoding: {
      theta: { field: 'value', type: 'quantitative', stack: true },
      color: {
        field: 'category',
        type: 'nominal',
        legend: { title: 'カテゴリー' },
      },
    },
    view: { stroke: null },
  },
  multiLine: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '複数系列の折れ線グラフ',
    data: {
      values: [
        { date: '2023-01-01', series: 'A', value: 10 },
        { date: '2023-02-01', series: 'A', value: 15 },
        { date: '2023-03-01', series: 'A', value: 20 },
        { date: '2023-04-01', series: 'A', value: 25 },
        { date: '2023-01-01', series: 'B', value: 5 },
        { date: '2023-02-01', series: 'B', value: 10 },
        { date: '2023-03-01', series: 'B', value: 15 },
        { date: '2023-04-01', series: 'B', value: 30 },
      ],
    },
    mark: 'line',
    encoding: {
      x: {
        field: 'date',
        type: 'temporal',
        timeUnit: 'monthdate',
        axis: { title: '日付', format: '%m/%d' },
      },
      y: { field: 'value', type: 'quantitative' },
      color: {
        field: 'series',
        type: 'nominal',
        legend: { title: 'シリーズ' },
      },
    },
  },
  stackedBar: {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: '積み上げ棒グラフ',
    data: {
      values: [
        { month: '1月', type: 'A', value: 10 },
        { month: '1月', type: 'B', value: 20 },
        { month: '1月', type: 'C', value: 15 },
        { month: '2月', type: 'A', value: 15 },
        { month: '2月', type: 'B', value: 25 },
        { month: '2月', type: 'C', value: 10 },
        { month: '3月', type: 'A', value: 20 },
        { month: '3月', type: 'B', value: 30 },
        { month: '3月', type: 'C', value: 5 },
      ],
    },
    mark: 'bar',
    encoding: {
      x: { field: 'month', type: 'nominal' },
      y: { field: 'value', type: 'quantitative', stack: 'normalize' },
      color: { field: 'type', type: 'nominal', legend: { title: 'タイプ' } },
    },
  },
};

// テンプレート表示名の定義
const templateDisplayNames: Record<string, string> = {
  bar: '棒グラフ',
  line: '折れ線グラフ',
  pie: '円グラフ',
  multiLine: '複数系列折れ線',
  stackedBar: '積み上げ棒グラフ',
};

// SVGをPNGのデータURLに変換する関数
const svgToPngDataURL = (svgElement: SVGElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.width = svgElement.clientWidth;
      image.height = svgElement.clientHeight;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = svgElement.clientWidth * 2; // 高解像度化
        canvas.height = svgElement.clientHeight * 2;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        // 高解像度用にスケール
        ctx.scale(2, 2);
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);

        // データURLの生成
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(svgUrl); // 使い終わったら解放
        resolve(dataUrl);
      };

      image.onerror = (e) => {
        URL.revokeObjectURL(svgUrl);
        reject(e);
      };

      image.src = svgUrl;
    } catch (error) {
      reject(error);
    }
  });
};

export const vegaLiteChart: Plugin<VegaLiteChartSchema> = {
  ui: async (arg) => {
    const { schema, value, onChange, rootElement, mode } = arg;

    // コンテナ要素を作成
    const container = document.createElement('div');
    container.style.width = `${schema.width * ZOOM}px`;
    container.style.height = `${schema.height * ZOOM}px`;
    container.style.backgroundColor = 'white';

    // 既存の要素があれば削除
    while (rootElement.firstChild) {
      rootElement.removeChild(rootElement.firstChild);
    }

    rootElement.appendChild(container);

    // Vega-Liteスペックの準備
    let vegaLiteSpec;
    try {
      // カスタムスペックがある場合はそれを使用
      if (schema.vegaLiteSpec) {
        vegaLiteSpec = JSON.parse(schema.vegaLiteSpec);
      }
      // テンプレートが指定されている場合はそれを使用
      else if (
        schema.chartTemplate &&
        chartTemplates[schema.chartTemplate as keyof typeof chartTemplates]
      ) {
        vegaLiteSpec =
          chartTemplates[schema.chartTemplate as keyof typeof chartTemplates];
      }
      // どちらもない場合はデフォルトのサンプルを使用
      else {
        vegaLiteSpec = sampleSpec;
      }
    } catch (e) {
      console.error('Vega-Liteスペックの解析に失敗しました:', e);
      return;
    }

    // Vega-Liteグラフのレンダリング
    try {
      const embedResult = await vegaEmbed(container, vegaLiteSpec, {
        actions: false, // エクスポートボタンなどを非表示
        renderer: 'svg', // SVGレンダラーを使用
        config: {
          // デフォルトの設定をオーバーライド
          view: {
            stroke: null, // 境界線を非表示
          },
          background: 'white',
          style: {
            'guide-label': {
              fontSize: 10,
            },
            'guide-title': {
              fontSize: 12,
            },
          },
        },
      });

      // PDFレンダリング用にSVGを取得してデータURLに変換
      if (onChange) {
        const svgElement = container.querySelector('svg');
        if (svgElement) {
          try {
            const dataUrl = await svgToPngDataURL(svgElement);
            if (dataUrl) {
              onChange({ key: 'content', value: dataUrl });
            }
          } catch (e) {
            console.error('チャート画像の生成に失敗しました:', e);
          }
        }
      }
    } catch (error) {
      console.error('Vega-Liteチャートのレンダリングに失敗しました:', error);
    }
  },
  pdf: image.pdf,
  propPanel: {
    schema: {
      chartTemplate: {
        title: 'チャートテンプレート',
        type: 'string',
        enum: Object.keys(chartTemplates),
        enumNames: Object.keys(chartTemplates).map(
          (key) => templateDisplayNames[key] || key
        ),
        default: 'bar',
      },
      vegaLiteSpec: {
        title: 'Vega-Liteスペック (JSON)',
        type: 'string',
        format: 'textarea',
        default: JSON.stringify(sampleSpec, null, 2),
      },
    },
    defaultSchema: {
      type: 'vegaLiteChart',
      name: 'Vega-Liteチャート',
      chartTemplate: 'bar',
      vegaLiteSpec: '',
      content: '',
      position: { x: 0, y: 0 },
      width: 200,
      height: 150,
    },
  },
};

export default vegaLiteChart;
