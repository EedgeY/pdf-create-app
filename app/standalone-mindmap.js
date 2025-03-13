/**
 * マインドマップのスタンドアロン実装
 * プラグインに依存せず、純粋なJavaScriptとSVGのみで実装されています
 */

class MindMap {
  /**
   * マインドマップのコンストラクタ
   * @param {HTMLElement} container - マインドマップを描画するコンテナ要素
   * @param {Object} options - オプション設定
   */
  constructor(container, options = {}) {
    this.container = container;

    // A4サイズの定義 (96 DPI基準)
    this.A4_WIDTH = 794; // 210mm
    this.A4_HEIGHT = 1123; // 297mm

    this.options = Object.assign(
      {
        nodeColor: '#4CAF50', // ノードの基本色
        lineColor: '#333333', // 線の色
        nodeBorderRadius: 10, // ノードの角丸半径
        lineType: 'curved', // 線のタイプ ('curved' or 'straight')
        nodeWidth: 120, // ノードの幅
        nodeHeight: 40, // ノードの高さ
        horizontalGap: 60, // ノード間の水平距離
        verticalGap: 80, // ノード間の垂直距離
        fontColor: '#FFFFFF', // テキストの色
        fontSize: 12, // テキストのサイズ
        useA4Size: true, // A4サイズを使用するかどうか
        orientation: 'portrait', // 向き: 'portrait'または'landscape'
      },
      options
    );

    // SVG要素の作成
    this.svg = null;
    this.svgGroup = null;
  }

  /**
   * マインドマップのレンダリング
   * @param {Object} data - マインドマップのデータ
   */
  render(data) {
    // コンテナをクリア
    this.container.innerHTML = '';

    // SVG要素の作成
    let width, height;

    if (this.options.useA4Size) {
      if (this.options.orientation === 'landscape') {
        width = this.A4_HEIGHT; // A4横向きの場合は縦横を入れ替え
        height = this.A4_WIDTH;
      } else {
        width = this.A4_WIDTH; // A4縦向きの場合
        height = this.A4_HEIGHT;
      }

      // コンテナサイズに対する比率を計算
      const containerWidth = this.container.clientWidth;
      const scale = containerWidth / width;

      // 画面内に収まるように高さを計算
      const scaledHeight = height * scale;

      // スケーリングされた表示サイズをコンテナに設定
      this.container.style.height = `${scaledHeight}px`;
    } else {
      // 従来通りコンテナサイズを使用
      width = this.container.clientWidth || 800;
      height = this.container.clientHeight || 600;
    }

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', String(width));
    this.svg.setAttribute('height', String(height));
    this.svg.style.fontFamily = 'sans-serif';
    this.svg.style.backgroundColor = 'white';

    // A4サイズ用の枠線を追加（オプション）
    if (this.options.useA4Size) {
      const border = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      );
      border.setAttribute('x', '0');
      border.setAttribute('y', '0');
      border.setAttribute('width', String(width));
      border.setAttribute('height', String(height));
      border.setAttribute('fill', 'none');
      border.setAttribute('stroke', '#CCCCCC');
      border.setAttribute('stroke-width', '1');
      this.svg.appendChild(border);

      // A4サイズの表示（デバッグ用）
      const sizeText = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      sizeText.setAttribute('x', '10');
      sizeText.setAttribute('y', '20');
      sizeText.setAttribute('font-size', '10');
      sizeText.setAttribute('fill', '#999999');
      sizeText.textContent = `A4 ${
        this.options.orientation === 'portrait' ? '縦向き' : '横向き'
      } (${width}×${height}px)`;
      this.svg.appendChild(sizeText);
    }

    // メインのグループ要素
    this.svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svg.appendChild(this.svgGroup);

    // ノードの位置を計算
    const centerX = width / 2 - 150;
    const centerY = height / 2;
    const rootPosition = this.calculateNodePositions(data, centerX, centerY);

    // ノードとリンクを再帰的に描画
    this.renderNodeAndLinks(this.svgGroup, rootPosition);

    // SVGをコンテナに追加
    this.container.appendChild(this.svg);

    return this;
  }

  /**
   * ノードの配置を計算
   * @param {Object} node - ノードデータ
   * @param {number} x - X座標
   * @param {number} y - Y座標
   * @param {number} level - 階層レベル
   * @returns {Object} - 位置情報を含むノードデータ
   */
  calculateNodePositions(node, x, y, level = 0) {
    // ノードの大きさの計算
    const nodeWidth = this.options.nodeWidth;
    const nodeHeight = this.options.nodeHeight;

    // 水平と垂直方向の間隔
    const horizontalGap = this.options.horizontalGap;
    const verticalGap = this.options.verticalGap;

    // 子ノードの位置計算
    let positions = [];

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

        const childPos = this.calculateNodePositions(
          node.children[i],
          childX,
          childY,
          level + 1
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

  /**
   * ノードとリンクを再帰的に描画
   * @param {SVGGElement} svgGroup - SVGのグループ要素
   * @param {Object} nodePos - ノードの位置情報
   */
  renderNodeAndLinks(svgGroup, nodePos) {
    const { node, x, y, width, height, childPositions } = nodePos;

    // ノードの色を決定（個別設定があればそれを使用、なければデフォルト）
    const nodeColor = node.color || this.options.nodeColor;
    const lineColor = this.options.lineColor;
    const borderRadius = this.options.nodeBorderRadius;
    const lineType = this.options.lineType;
    const fontColor = this.options.fontColor;
    const fontSize = this.options.fontSize;

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
    text.setAttribute('font-size', String(fontSize));
    text.setAttribute('fill', fontColor);
    text.textContent = node.text;
    svgGroup.appendChild(text);

    // 子ノードを描画
    if (childPositions && childPositions.length > 0) {
      childPositions.forEach((childPos) => {
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
        this.renderNodeAndLinks(svgGroup, childPos);
      });
    }
  }

  /**
   * SVGをデータURLに変換
   * @returns {Promise<string>} - データURL
   */
  toDataURL() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.svg) {
          reject(new Error('SVGが描画されていません'));
          return;
        }

        // SVG文字列を作成
        const svgString = new XMLSerializer().serializeToString(this.svg);
        const svgBlob = new Blob([svgString], {
          type: 'image/svg+xml;charset=utf-8',
        });
        const svgUrl = URL.createObjectURL(svgBlob);

        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = this.svg.clientWidth * 2; // 高解像度化
          canvas.height = this.svg.clientHeight * 2;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(svgUrl);
            reject(new Error('Canvas 2D context not available'));
            return;
          }

          // スケーリング
          ctx.scale(2, 2);
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0);

          const dataUrl = canvas.toDataURL('image/png', 0.9);
          URL.revokeObjectURL(svgUrl);
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
  }

  /**
   * SVGを保存
   * @param {string} filename - ファイル名
   */
  saveSVG(filename = 'mindmap.svg') {
    if (!this.svg) {
      throw new Error('SVGが描画されていません');
    }

    // SVG文字列を取得
    const svgString = new XMLSerializer().serializeToString(this.svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

    // ダウンロードリンクを作成
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    // リンクをクリックしてダウンロード
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * SVGをPNGに変換して保存
   * @param {string} filename - ファイル名
   */
  async savePNG(filename = 'mindmap.png') {
    try {
      // A4サイズ対応：SVGのviewBoxを設定してスケーリングを調整
      if (this.options.useA4Size) {
        this.svg.setAttribute(
          'viewBox',
          `0 0 ${this.svg.getAttribute('width')} ${this.svg.getAttribute(
            'height'
          )}`
        );

        // 印刷用の高解像度を設定（300 DPI相当）
        const scale = 300 / 96; // 300DPI / 96DPI
        const width = parseFloat(this.svg.getAttribute('width')) * scale;
        const height = parseFloat(this.svg.getAttribute('height')) * scale;

        this.svg.setAttribute('width', width);
        this.svg.setAttribute('height', height);
      }

      const dataUrl = await this.toDataURL();

      // データURLからBlobを作成
      const bin = atob(dataUrl.split(',')[1]);
      const buffer = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i);
      }
      const blob = new Blob([buffer.buffer], { type: 'image/png' });

      // ダウンロードリンクを作成
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;

      // リンクをクリックしてダウンロード
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 元のサイズに戻す
      if (this.options.useA4Size) {
        const originalWidth =
          this.options.orientation === 'portrait'
            ? this.A4_WIDTH
            : this.A4_HEIGHT;
        const originalHeight =
          this.options.orientation === 'portrait'
            ? this.A4_HEIGHT
            : this.A4_WIDTH;

        this.svg.setAttribute('width', originalWidth);
        this.svg.setAttribute('height', originalHeight);
      }
    } catch (error) {
      console.error('PNG保存エラー:', error);
      throw error;
    }
  }
}

// エクスポート
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = MindMap;
} else {
  window.MindMap = MindMap;
}
