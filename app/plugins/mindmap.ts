import { Plugin, Schema, ZOOM } from '@pdfme/common';
import { image } from '@pdfme/schemas';

// PDF反映用のイメージプラグインをインポート
const basePdfPlugin = image.pdf;

interface MindMapSchema extends Schema {
  name: string;
  mapData?: string; // マインドマップのデータ（JSON形式）
  mapOptions?: string; // マインドマップの表示オプション
  nodeColor?: string; // ノードの色
  lineColor?: string; // 線の色
  nodeBorderRadius?: number; // ノードの角丸半径
  lineType?: 'straight' | 'curved'; // 線のタイプ
  instanceId?: string; // インスタンスID（安定的な識別用）
}

// マインドマップのノード構造
interface MindMapNode {
  id: string;
  text: string;
  children?: MindMapNode[];
  color?: string; // 個別ノードの色
}

// データURLキャッシュ
const contentCache = new Map<string, string>();

// SVGをPNGのデータURLに変換する関数
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
          // PNGのみを使用
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

// サンプルデータ
const sampleData: MindMapNode = {
  id: 'root',
  text: 'メインテーマ',
  children: [
    {
      id: 'node1',
      text: 'アイデア1',
      children: [
        { id: 'node1-1', text: 'サブアイデア1.1' },
        { id: 'node1-2', text: 'サブアイデア1.2' },
      ],
    },
    {
      id: 'node2',
      text: 'アイデア2',
      children: [
        { id: 'node2-1', text: 'サブアイデア2.1' },
        { id: 'node2-2', text: 'サブアイデア2.2' },
      ],
    },
    {
      id: 'node3',
      text: 'アイデア3',
      children: [{ id: 'node3-1', text: 'サブアイデア3.1' }],
    },
  ],
};

// デフォルトオプション
const defaultOptions = {
  nodeColor: '#4CAF50', // ノードの基本色
  lineColor: '#333333', // 線の色
  nodeBorderRadius: 10, // ノードの角丸半径
  lineType: 'curved', // 線のタイプ
};

// 安定したIDを生成
function generateStableId() {
  return Math.random().toString(36).substring(2, 15);
}

// ノードの配置を計算
function calculateNodePositions(
  node: MindMapNode,
  x: number,
  y: number,
  level: number = 0,
  options: any = {}
) {
  // ノードの大きさの計算
  const nodeWidth = 120;
  const nodeHeight = 40;

  // 水平と垂直方向の間隔
  const horizontalGap = 60;
  const verticalGap = 80;

  // 子ノードの位置計算
  let positions: {
    node: MindMapNode;
    x: number;
    y: number;
    width: number;
    height: number;
    level: number;
    childPositions: any[];
  }[] = [];

  if (node.children && node.children.length > 0) {
    // 子ノードの総数
    const childCount = node.children.length;

    // 子ノードの垂直方向の総高さを計算
    const totalHeight =
      childCount * nodeHeight + (childCount - 1) * verticalGap;

    // 最初の子ノードのY座標
    let startY = y - totalHeight / 2;

    // 子ノードごとに位置を計算
    for (let i = 0; i < childCount; i++) {
      const childY = startY + i * (nodeHeight + verticalGap);
      const childX = x + nodeWidth + horizontalGap;

      const childPos = calculateNodePositions(
        node.children[i],
        childX,
        childY,
        level + 1,
        options
      );

      positions.push(childPos);
    }
  }

  // 現在のノードの情報を返す
  return {
    node,
    x,
    y,
    width: nodeWidth,
    height: nodeHeight,
    level,
    childPositions: positions,
  };
}

// マインドマップをレンダリングする関数
function renderMindMap(
  container: HTMLDivElement,
  data: MindMapNode,
  schema: MindMapSchema,
  options: any
) {
  // コンテナをクリア
  container.innerHTML = '';

  // SVG要素の作成
  const width = schema.width * ZOOM;
  const height = schema.height * ZOOM;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.style.fontFamily = 'sans-serif';
  svg.style.backgroundColor = 'white';

  // メインのグループ要素
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(g);

  // ノードの位置を計算
  const centerX = width / 2 - 150;
  const centerY = height / 2;
  const rootPosition = calculateNodePositions(
    data,
    centerX,
    centerY,
    0,
    options
  );

  // ノードとリンクを再帰的に描画
  renderNodeAndLinks(g, rootPosition, options);

  // SVGをコンテナに追加
  container.appendChild(svg);

  // SVG要素を取得してPNGに変換
  if (options.onChange) {
    setTimeout(() => {
      try {
        svgToPngDataURL(svg)
          .then((dataUrl) => {
            if (dataUrl) {
              console.log(
                'マインドマップデータURL生成成功: 長さ',
                dataUrl.length
              );
              options.onChange({ key: 'content', value: dataUrl });

              // キャッシュに保存
              const cacheKey = `${schema.instanceId || ''}-mindmap`;
              contentCache.set(cacheKey, dataUrl);
            }
          })
          .catch((e) => {
            console.error('マインドマップデータURL生成失敗:', e);
          });
      } catch (e) {
        console.error('マインドマップ画像の生成処理中にエラーが発生:', e);
      }
    }, 200);
  }
}

// ノードとリンクを再帰的に描画する関数
function renderNodeAndLinks(svgGroup: SVGGElement, nodePos: any, options: any) {
  const { node, x, y, width, height, childPositions } = nodePos;

  // ノードの色を決定（個別設定があればそれを使用、なければデフォルト）
  const nodeColor = node.color || options.nodeColor || defaultOptions.nodeColor;
  const lineColor = options.lineColor || defaultOptions.lineColor;
  const borderRadius =
    options.nodeBorderRadius || defaultOptions.nodeBorderRadius;
  const lineType = options.lineType || defaultOptions.lineType;

  // ノードを描画
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', String(x));
  rect.setAttribute('y', String(y));
  rect.setAttribute('width', String(width));
  rect.setAttribute('height', String(height));
  rect.setAttribute('rx', String(borderRadius));
  rect.setAttribute('ry', String(borderRadius));
  rect.setAttribute('fill', nodeColor);
  rect.setAttribute('stroke', lineColor);
  rect.setAttribute('stroke-width', '1');
  svgGroup.appendChild(rect);

  // テキストを描画
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', String(x + width / 2));
  text.setAttribute('y', String(y + height / 2));
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'middle');
  text.setAttribute('font-size', '12');
  text.setAttribute('fill', '#ffffff');
  text.textContent = node.text;
  svgGroup.appendChild(text);

  // 子ノードを描画
  if (childPositions && childPositions.length > 0) {
    childPositions.forEach((childPos: any) => {
      // 親ノードと子ノードを結ぶ線を描画
      if (lineType === 'curved') {
        // 曲線パスを描画
        const path = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        const startX = x + width;
        const startY = y + height / 2;
        const endX = childPos.x;
        const endY = childPos.y + childPos.height / 2;

        // 曲線の制御点
        const controlX = (startX + endX) / 2;

        const d = `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`;
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', lineColor);
        path.setAttribute('stroke-width', '1.5');
        svgGroup.appendChild(path);
      } else {
        // 直線を描画
        const line = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'line'
        );
        line.setAttribute('x1', String(x + width));
        line.setAttribute('y1', String(y + height / 2));
        line.setAttribute('x2', String(childPos.x));
        line.setAttribute('y2', String(childPos.y + childPos.height / 2));
        line.setAttribute('stroke', lineColor);
        line.setAttribute('stroke-width', '1.5');
        svgGroup.appendChild(line);
      }

      // 子ノードを再帰的に描画
      renderNodeAndLinks(svgGroup, childPos, options);
    });
  }
}

export const mindmap: Plugin<MindMapSchema> = {
  ui: async (arg) => {
    const { schema, value, onChange, rootElement, mode } = arg;

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

      // コンテナ要素の作成
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.position = 'relative';
      rootElement.appendChild(container);

      // マインドマップデータを取得
      let mapData: MindMapNode;
      try {
        if (schema.mapData) {
          mapData = JSON.parse(schema.mapData);
        } else {
          mapData = sampleData;
        }
      } catch (error) {
        console.error('マインドマップデータのJSONパースに失敗しました:', error);
        mapData = sampleData;
      }

      // オプションを取得
      let mapOptions: any = {};
      try {
        if (schema.mapOptions) {
          mapOptions = JSON.parse(schema.mapOptions);
        }
      } catch (error) {
        console.error(
          'マインドマップオプションのJSONパースに失敗しました:',
          error
        );
      }

      // スキーマの設定をオプションに追加
      const options = {
        ...defaultOptions,
        ...mapOptions,
        nodeColor: schema.nodeColor || defaultOptions.nodeColor,
        lineColor: schema.lineColor || defaultOptions.lineColor,
        nodeBorderRadius:
          schema.nodeBorderRadius || defaultOptions.nodeBorderRadius,
        lineType: schema.lineType || defaultOptions.lineType,
        onChange,
      };

      // マインドマップをレンダリング
      renderMindMap(container, mapData, schema, options);

      // 編集モードの場合、設定パネルを表示
      if (mode === 'designer' && onChange) {
        // 設定パネルの実装は割愛
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
      mapData: {
        title: 'マインドマップデータ (JSON)',
        type: 'string',
        format: 'textarea',
        default: JSON.stringify(sampleData, null, 2),
      },
      nodeColor: {
        title: 'ノードの色',
        type: 'string',
        format: 'color',
        default: defaultOptions.nodeColor,
      },
      lineColor: {
        title: '線の色',
        type: 'string',
        format: 'color',
        default: defaultOptions.lineColor,
      },
      nodeBorderRadius: {
        title: 'ノードの角丸半径',
        type: 'number',
        default: defaultOptions.nodeBorderRadius,
      },
      lineType: {
        title: '線のタイプ',
        type: 'string',
        enum: ['straight', 'curved'],
        default: defaultOptions.lineType as 'straight' | 'curved',
      },
      mapOptions: {
        title: '追加設定 (JSON)',
        type: 'string',
        format: 'textarea',
        default: JSON.stringify({}, null, 2),
      },
      instanceId: {
        type: 'string',
        default: '',
        visible: false, // UI上では非表示
      },
    },
    defaultSchema: {
      type: 'mindmap',
      name: 'マインドマップ',
      nodeColor: defaultOptions.nodeColor,
      lineColor: defaultOptions.lineColor,
      nodeBorderRadius: defaultOptions.nodeBorderRadius,
      lineType: defaultOptions.lineType as 'straight' | 'curved',
      mapData: JSON.stringify(sampleData),
      mapOptions: JSON.stringify({}),
      content: '',
      position: { x: 0, y: 0 },
      width: 400,
      height: 300,
      instanceId: '',
    },
  },
};
