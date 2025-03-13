import { Plugin, Schema, ZOOM } from '@pdfme/common';
import { image } from '@pdfme/schemas';

interface ChartSchema extends Schema {
  name: string;
  chartType?: 'bar' | 'line' | 'pie';
  chartData?: string;
  chartOptions?: string;
}

interface ChartDataItem {
  name: string;
  value: number;
}

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

// サンプルデータ
const sampleData: ChartDataItem[] = [
  { name: '1月', value: 400 },
  { name: '2月', value: 300 },
  { name: '3月', value: 600 },
  { name: '4月', value: 800 },
  { name: '5月', value: 500 },
  { name: '6月', value: 350 },
];

export const chart: Plugin<ChartSchema> = {
  ui: async (arg) => {
    const { schema, value, onChange, rootElement, mode } = arg;

    // SVG要素を作成
    const svgElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    svgElement.setAttribute('width', String(schema.width * ZOOM));
    svgElement.setAttribute('height', String(schema.height * ZOOM));
    svgElement.style.fontFamily = 'sans-serif';
    svgElement.style.backgroundColor = 'white';

    // 既存のSVG要素があれば削除
    while (rootElement.firstChild) {
      rootElement.removeChild(rootElement.firstChild);
    }

    rootElement.appendChild(svgElement);

    // チャートデータとオプションの準備
    let chartData: ChartDataItem[];
    let chartOptions: Record<string, any>;
    let chartType = schema.chartType || 'bar';

    try {
      chartData = schema.chartData ? JSON.parse(schema.chartData) : sampleData;
      chartOptions = schema.chartOptions ? JSON.parse(schema.chartOptions) : {};
    } catch (e) {
      console.error('チャートデータの解析に失敗しました:', e);
      return;
    }

    // チャート要素のレンダリング
    const renderChart = () => {
      // 既存の要素をクリア
      while (svgElement.firstChild) {
        svgElement.removeChild(svgElement.firstChild);
      }

      const width = schema.width * ZOOM;
      const height = schema.height * ZOOM;

      const margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40,
      };

      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      // グラフ領域の作成
      const chartArea = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'g'
      );
      chartArea.setAttribute(
        'transform',
        `translate(${margin.left}, ${margin.top})`
      );

      // チャートタイプに応じてレンダリング
      switch (chartType) {
        case 'bar':
          // 棒グラフの描画

          // データの最大値を取得
          const maxValue = Math.max(...chartData.map((d) => d.value)) * 1.1;

          // X軸の目盛りとグリッドの間隔を計算
          const barWidth = chartWidth / chartData.length;

          // Y軸の目盛りとグリッドの間隔を計算
          const yTickCount = 5;
          const yTickStep = maxValue / yTickCount;

          // グリッドラインの描画
          for (let i = 0; i <= yTickCount; i++) {
            const y = chartHeight - (i * chartHeight) / yTickCount;

            // 水平グリッドライン
            const gridLine = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'line'
            );
            gridLine.setAttribute('x1', '0');
            gridLine.setAttribute('y1', String(y));
            gridLine.setAttribute('x2', String(chartWidth));
            gridLine.setAttribute('y2', String(y));
            gridLine.setAttribute('stroke', '#e0e0e0');
            gridLine.setAttribute('stroke-width', '1');
            chartArea.appendChild(gridLine);

            // Y軸の目盛り値
            const tickValue = Math.round(i * yTickStep);
            const tickLabel = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'text'
            );
            tickLabel.setAttribute('x', '-5');
            tickLabel.setAttribute('y', String(y + 4));
            tickLabel.setAttribute('text-anchor', 'end');
            tickLabel.setAttribute('font-size', '10');
            tickLabel.textContent = String(tickValue);
            chartArea.appendChild(tickLabel);
          }

          // X軸
          const xAxis = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line'
          );
          xAxis.setAttribute('x1', '0');
          xAxis.setAttribute('y1', String(chartHeight));
          xAxis.setAttribute('x2', String(chartWidth));
          xAxis.setAttribute('y2', String(chartHeight));
          xAxis.setAttribute('stroke', 'black');
          xAxis.setAttribute('stroke-width', '1');
          chartArea.appendChild(xAxis);

          // Y軸
          const yAxis = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line'
          );
          yAxis.setAttribute('x1', '0');
          yAxis.setAttribute('y1', '0');
          yAxis.setAttribute('x2', '0');
          yAxis.setAttribute('y2', String(chartHeight));
          yAxis.setAttribute('stroke', 'black');
          yAxis.setAttribute('stroke-width', '1');
          chartArea.appendChild(yAxis);

          // 棒グラフを描画
          chartData.forEach((d: ChartDataItem, i: number) => {
            const barHeight = (chartHeight * d.value) / maxValue;
            const x = i * barWidth + barWidth * 0.1;
            const barDisplayWidth = barWidth * 0.8;
            const y = chartHeight - barHeight;

            const rect = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'rect'
            );
            rect.setAttribute('x', String(x));
            rect.setAttribute('y', String(y));
            rect.setAttribute('width', String(barDisplayWidth));
            rect.setAttribute('height', String(barHeight));
            rect.setAttribute('fill', 'rgba(54, 162, 235, 0.8)');
            chartArea.appendChild(rect);

            // X軸ラベル
            const text = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'text'
            );
            text.setAttribute('x', String(x + barDisplayWidth / 2));
            text.setAttribute('y', String(chartHeight + 15));
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '10');
            text.textContent = d.name;
            chartArea.appendChild(text);

            // 値を表示
            const valueText = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'text'
            );
            valueText.setAttribute('x', String(x + barDisplayWidth / 2));
            valueText.setAttribute('y', String(y - 5));
            valueText.setAttribute('text-anchor', 'middle');
            valueText.setAttribute('font-size', '10');
            valueText.textContent = String(d.value);
            chartArea.appendChild(valueText);
          });

          svgElement.appendChild(chartArea);
          break;

        case 'line':
          // 折れ線グラフの描画

          // データの最大値を取得
          const lineMaxValue = Math.max(...chartData.map((d) => d.value)) * 1.1;

          // Y軸の目盛りとグリッドの間隔を計算
          const lineYTickCount = 5;
          const lineYTickStep = lineMaxValue / lineYTickCount;

          // グリッドラインの描画
          for (let i = 0; i <= lineYTickCount; i++) {
            const y = chartHeight - (i * chartHeight) / lineYTickCount;

            // 水平グリッドライン
            const gridLine = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'line'
            );
            gridLine.setAttribute('x1', '0');
            gridLine.setAttribute('y1', String(y));
            gridLine.setAttribute('x2', String(chartWidth));
            gridLine.setAttribute('y2', String(y));
            gridLine.setAttribute('stroke', '#e0e0e0');
            gridLine.setAttribute('stroke-width', '1');
            chartArea.appendChild(gridLine);

            // Y軸の目盛り値
            const tickValue = Math.round(i * lineYTickStep);
            const tickLabel = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'text'
            );
            tickLabel.setAttribute('x', '-5');
            tickLabel.setAttribute('y', String(y + 4));
            tickLabel.setAttribute('text-anchor', 'end');
            tickLabel.setAttribute('font-size', '10');
            tickLabel.textContent = String(tickValue);
            chartArea.appendChild(tickLabel);
          }

          // X軸
          const lineXAxis = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line'
          );
          lineXAxis.setAttribute('x1', '0');
          lineXAxis.setAttribute('y1', String(chartHeight));
          lineXAxis.setAttribute('x2', String(chartWidth));
          lineXAxis.setAttribute('y2', String(chartHeight));
          lineXAxis.setAttribute('stroke', 'black');
          lineXAxis.setAttribute('stroke-width', '1');
          chartArea.appendChild(lineXAxis);

          // 垂直グリッドラインとX軸ラベル
          chartData.forEach((d: ChartDataItem, i: number) => {
            const x = i * (chartWidth / (chartData.length - 1));

            // 垂直グリッドライン
            const gridLine = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'line'
            );
            gridLine.setAttribute('x1', String(x));
            gridLine.setAttribute('y1', '0');
            gridLine.setAttribute('x2', String(x));
            gridLine.setAttribute('y2', String(chartHeight));
            gridLine.setAttribute('stroke', '#e0e0e0');
            gridLine.setAttribute('stroke-width', '1');
            chartArea.appendChild(gridLine);

            // X軸ラベル
            const text = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'text'
            );
            text.setAttribute('x', String(x));
            text.setAttribute('y', String(chartHeight + 15));
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '10');
            text.textContent = d.name;
            chartArea.appendChild(text);
          });

          // Y軸
          const lineYAxis = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line'
          );
          lineYAxis.setAttribute('x1', '0');
          lineYAxis.setAttribute('y1', '0');
          lineYAxis.setAttribute('x2', '0');
          lineYAxis.setAttribute('y2', String(chartHeight));
          lineYAxis.setAttribute('stroke', 'black');
          lineYAxis.setAttribute('stroke-width', '1');
          chartArea.appendChild(lineYAxis);

          // 折れ線のパス
          let pathData = '';
          chartData.forEach((d: ChartDataItem, i: number) => {
            const x = i * (chartWidth / (chartData.length - 1));
            const y = chartHeight - (chartHeight * d.value) / lineMaxValue;

            if (i === 0) {
              pathData += `M ${x} ${y}`;
            } else {
              pathData += ` L ${x} ${y}`;
            }

            // ポイントを表示
            const circle = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'circle'
            );
            circle.setAttribute('cx', String(x));
            circle.setAttribute('cy', String(y));
            circle.setAttribute('r', '3');
            circle.setAttribute('fill', 'rgba(255, 99, 132, 1)');
            chartArea.appendChild(circle);

            // 値を表示
            const valueText = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'text'
            );
            valueText.setAttribute('x', String(x));
            valueText.setAttribute('y', String(y - 10));
            valueText.setAttribute('text-anchor', 'middle');
            valueText.setAttribute('font-size', '10');
            valueText.textContent = String(d.value);
            chartArea.appendChild(valueText);
          });

          // パスを追加
          const path = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
          );
          path.setAttribute('d', pathData);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', 'rgba(255, 99, 132, 1)');
          path.setAttribute('stroke-width', '2');
          chartArea.appendChild(path);

          svgElement.appendChild(chartArea);
          break;

        case 'pie':
          // 円グラフの描画
          const pieChart = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'g'
          );
          pieChart.setAttribute(
            'transform',
            `translate(${width / 2}, ${height / 2})`
          );

          const radius = Math.min(width, height) / 2 - 20;

          // 合計値を計算
          const total = chartData.reduce(
            (sum: number, d: ChartDataItem) => sum + d.value,
            0
          );

          // カラーパレット
          const colors = [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
          ];

          // タイトル
          const title = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
          );
          title.setAttribute('x', '0');
          title.setAttribute('y', String(-radius - 10));
          title.setAttribute('text-anchor', 'middle');
          title.setAttribute('font-size', '12');
          title.setAttribute('font-weight', 'bold');
          title.textContent = 'データ分布';
          pieChart.appendChild(title);

          let startAngle = 0;
          chartData.forEach((d: ChartDataItem, i: number) => {
            const sliceAngle = (d.value / total) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;

            // 円弧のパスを計算
            const x1 = radius * Math.cos(startAngle);
            const y1 = radius * Math.sin(startAngle);
            const x2 = radius * Math.cos(endAngle);
            const y2 = radius * Math.sin(endAngle);

            const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

            const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            const path = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'path'
            );
            path.setAttribute('d', pathData);
            path.setAttribute('fill', colors[i % colors.length]);
            path.setAttribute('stroke', 'white');
            path.setAttribute('stroke-width', '1');
            pieChart.appendChild(path);

            // ラベルの位置を計算
            const labelAngle = startAngle + sliceAngle / 2;
            const labelRadius = radius * 0.7;
            const labelX = labelRadius * Math.cos(labelAngle);
            const labelY = labelRadius * Math.sin(labelAngle);

            // パーセンテージを計算
            const percentage = Math.round((d.value / total) * 100);

            // ラベルを表示
            const text = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'text'
            );
            text.setAttribute('x', String(labelX));
            text.setAttribute('y', String(labelY));
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'white');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('font-size', '10');
            text.textContent = `${percentage}%`;
            pieChart.appendChild(text);

            // 外側にラベルと値を表示
            const outerLabelAngle = startAngle + sliceAngle / 2;
            const outerLabelRadius = radius * 1.1;
            const outerLabelX = outerLabelRadius * Math.cos(outerLabelAngle);
            const outerLabelY = outerLabelRadius * Math.sin(outerLabelAngle);

            const outerLabel = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'text'
            );
            outerLabel.setAttribute('x', String(outerLabelX));
            outerLabel.setAttribute('y', String(outerLabelY));
            outerLabel.setAttribute(
              'text-anchor',
              labelAngle > Math.PI / 2 && labelAngle < Math.PI * 1.5
                ? 'end'
                : 'start'
            );
            outerLabel.setAttribute('font-size', '8');
            outerLabel.textContent = `${d.name}: ${d.value}`;
            pieChart.appendChild(outerLabel);

            startAngle = endAngle;
          });

          svgElement.appendChild(pieChart);
          break;

        default:
          // その他のチャートタイプの場合、サポートしていないことを表示
          const errorText = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
          );
          errorText.setAttribute('x', String(width / 2));
          errorText.setAttribute('y', String(height / 2));
          errorText.setAttribute('text-anchor', 'middle');
          errorText.setAttribute('font-size', '12');
          errorText.textContent = `${chartType}タイプは現在サポートされていません`;
          svgElement.appendChild(errorText);
      }

      return svgElement;
    };

    // チャートを一度だけレンダリング
    const renderedSvg = renderChart();

    // SVG画像をPDF生成用に変換 - PNG形式
    if (onChange) {
      try {
        // SVGをPNGのデータURLに変換
        svgToPngDataURL(renderedSvg)
          .then((dataUrl) => {
            if (dataUrl) {
              onChange({ key: 'content', value: dataUrl });
            }
          })
          .catch((e) => {
            console.error('チャート画像の生成に失敗しました:', e);
          });
      } catch (e) {
        console.error('チャート画像の生成処理に失敗しました:', e);
      }
    }
  },
  pdf: image.pdf,
  propPanel: {
    schema: {
      chartType: {
        title: 'チャートタイプ',
        type: 'string',
        enum: ['bar', 'line', 'pie'],
        default: 'bar',
      },
      chartData: {
        title: 'チャートデータ (JSON)',
        type: 'string',
        format: 'textarea',
        default: JSON.stringify(sampleData, null, 2),
      },
      chartOptions: {
        title: 'チャート設定 (JSON)',
        type: 'string',
        format: 'textarea',
        default: JSON.stringify({}, null, 2),
      },
    },
    defaultSchema: {
      type: 'chart',
      name: 'チャート',
      chartType: 'bar',
      chartData: JSON.stringify(sampleData),
      chartOptions: JSON.stringify({}),
      content: '',
      position: { x: 0, y: 0 },
      width: 150,
      height: 100,
    },
  },
};

export default chart;
