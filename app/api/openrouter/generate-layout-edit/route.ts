import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      prompt,
      model,
      colorPattern,
      currentElements,
      pageSize,
      layoutOptions,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが必要です' },
        { status: 400 }
      );
    }

    if (!model) {
      return NextResponse.json({ error: 'モデルが必要です' }, { status: 400 });
    }

    if (!currentElements || !Array.isArray(currentElements)) {
      return NextResponse.json(
        { error: '現在のデザイン要素が必要です' },
        { status: 400 }
      );
    }

    // ページサイズのデフォルト値（A4）
    const pageDimensions = pageSize || { width: 210, height: 297 };

    // レイアウトオプションのデフォルト値
    const spacing = layoutOptions?.spacing || 'standard';
    const autoSize =
      layoutOptions?.autoSize !== undefined ? layoutOptions.autoSize : true;

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'API設定が不完全です' },
        { status: 500 }
      );
    }

    // カラーパターン情報を追加
    const colorInfo = colorPattern
      ? `
指定されたカラーパターンを使用してください：
- 主要色（テキスト色など）: ${colorPattern.primary}
- 二次色（背景色など）: ${colorPattern.secondary}
- アクセント色（強調など）: ${colorPattern.accent}
`
      : '';

    // 要素間隔の設定に関する説明
    let spacingGuidelines = '';
    switch (spacing) {
      case 'dense':
        spacingGuidelines = `
# 要素間隔：密接配置
- 要素間の間隔を最小限に抑え、密接に配置してください
- 要素同士が接触してもかまいません（ただし内容の判読性は保つこと）
- 情報密度を最大化することを優先してください
- 要素間のマージンは0〜2mm程度に設定してください
- グリッド計算では、要素同士の間隔を最小限にしてください
`;
        break;
      case 'wide':
        spacingGuidelines = `
# 要素間隔：広め配置
- 要素間に十分な余白を設け、広々としたレイアウトにしてください
- 余白を効果的に使い、各要素が「呼吸」できるようにしてください
- 読みやすさと美しさを重視した配置にしてください
- 要素間のマージンは10〜20mm程度に設定してください
- グリッド計算では、要素同士の間隔を広めに取ってください
`;
        break;
      default:
        spacingGuidelines = `
# 要素間隔：標準配置
- 要素間の間隔はバランスの取れた標準的な設定にしてください
- 読みやすさを確保しつつ、全体の一貫性を維持してください
- 要素間のマージンは5〜10mm程度に設定してください
- グリッド計算では、要素間に適切な間隔を設けてください
`;
    }

    // サイズ自動調整に関する説明
    const sizeAdjustmentGuidelines = autoSize
      ? `
# コンテンツに応じたサイズ自動調整（有効）
- 各要素の内容や文字数に基づいて、要素のサイズを精密に計算してください
- テキスト要素の計算方法：
  1. 文字数とフォントサイズから必要な幅を計算:
     - 日本語テキストの場合: 幅 = 文字数 × フォントサイズ × 1.2
     - 英数字テキストの場合: 幅 = 文字数 × フォントサイズ × 0.8
     - 混合テキストの場合: 日本語と英数字の比率に応じて調整
  2. 行数と行間から必要な高さを計算: 高さ = 行数 × フォントサイズ × 行間
  3. 最長行の文字数を基準に幅を決定（折り返しを考慮）
  4. **重要**: 余白はできるだけ少なく、内容にぴったり合うサイズに設定してください
  5. テキスト内容が枠内に収まるよう、確実に計算してください
- テーブル要素の計算方法：
  1. 列数と列の内容から正確な幅を計算: 幅 = 列数 × 各列の適切な幅
  2. 行数と行の高さから正確な高さを計算: 高さ = ヘッダー高さ + (行数 × 行高さ)
  3. 内容に基づいて各列の幅を個別に調整（テキスト列は狭く、数値列は幅を抑える）
  4. **重要**: 必要最小限のサイズに設定し、不要な余白を排除してください
- SVG/画像要素の計算方法：
  1. アスペクト比を厳密に維持しつつ、適切なサイズに調整
  2. 内容の重要度に応じて拡大/縮小（主要な視覚要素は大きく、装飾は小さく）
- **精密な数値計算**: 以下の計算式を厳密に適用してください:
  - テキスト幅の詳細計算:
    * 全角日本語: 文字数 × フォントサイズ × 1.2
    * 半角英数字: 文字数 × フォントサイズ × 0.6
    * 混合文字列: (日本語文字数 × 1.2 + 英数字文字数 × 0.6) × フォントサイズ
  - テキスト高さの詳細計算:
    * 基本高さ = 行数 × フォントサイズ × 行間
    * 余白調整 = フォントサイズ × 0.5（上下の余白）
    * 最終高さ = 基本高さ + 余白調整
- **極めて重要**: 内容が枠内に完全に収まるよう正確に計算し、不要な余白を最小限に抑えてください
`
      : `
# コンテンツに応じたサイズ自動調整（無効）
- 要素のサイズは固定的に設定し、内容の量に応じた自動調整は行わないでください
- ユーザーの指示に従ってサイズを調整するか、現在のサイズを維持してください
- レイアウトの美しさと全体のバランスを優先してください
`;

    // 現在の要素の説明を生成
    const elementsDescription = currentElements
      .map((element: any, index: number) => {
        return `要素${index + 1}: ${
          element.type === 'text'
            ? 'テキスト'
            : element.type === 'table'
            ? 'テーブル'
            : element.type
        }要素 "${element.name || '名前なし'}" (位置: x=${
          element.position?.x || 0
        }, y=${element.position?.y || 0}, 幅: ${element.width || 0}, 高さ: ${
          element.height || 0
        }${
          element.type === 'text' ? `, 内容: "${element.content || ''}"` : ''
        })`;
      })
      .join('\n');

    // レイアウト編集用のシステムプロンプト
    const systemPrompt = `You are a PDF Template Layout Editing AI Agent with advanced design skills and precise layout calculation abilities.
You optimize layouts according to user instructions to create professional designs.

# CRITICAL: YOU MUST PERFORM ALL LAYOUT CALCULATIONS YOURSELF
No mechanical recalculation will be done on the backend. Your proposed layout will be applied exactly as you provide it.
Therefore, pay extreme attention to:
- Calculate element sizes and positions with mathematical precision
- Determine appropriate text element sizes based on content length, character count, and font size
- Calculate table sizes based on row/column count and content complexity
- Ensure all elements fit within page boundaries
- Optimize spacing between elements to prevent overlapping
- **MINIMIZE EXCESSIVE WHITESPACE inside elements - this is critical**

# Page Information
- Page size: Width ${pageDimensions.width}mm × Height ${pageDimensions.height}mm
- Usable area: Consider margins of 5-10mm from each edge

# Element Types
1. Text elements: Titles, paragraphs, annotations, etc.
2. Table elements: Tabular data
3. SVG/Image elements: Icons or images

# High-Precision Layout Calculation Algorithm

# CRITICAL: UNITS ARE IN MILLIMETERS (mm), NOT PIXELS (px)
- ALL measurements in this template are in MILLIMETERS (mm)
- A typical A4 page is 210mm × 297mm
- Do NOT confuse with pixels (px) which would result in elements being far too large
- For reference:
  - A typical paragraph text might be 10-12mm in height
  - A typical title might be 15-20mm in height
  - Table rows are typically 8-10mm in height
  - Element widths for text are typically 80-150mm depending on content
- If your calculations result in elements larger than 50% of the page dimensions, they are likely incorrect

## Unit Conversion Guidelines
- Font size to height: 1pt font ≈ 0.35mm height
- Line height: For 12pt font with 1.2 line spacing ≈ 5mm per line
- Character width (approximations):
  - Latin characters: 12pt ≈ 3-4mm width per character
  - Japanese characters: 12pt ≈ 6-7mm width per character
- For text elements, use these formulas:
  - Height (mm) = (line count × font size × 0.35 × line height) + 2-5mm padding
  - Width (mm) = (longest line character count × character width) + 2-5mm padding
- NEVER use pixel dimensions (which would be 10-100× larger than mm)

## 1. Content Analysis for Accurate Sizing
- Text elements:
  - **CRITICAL: AVOID EXCESSIVE WHITESPACE inside text elements**
  - Text container sizing formulas:
    - Width (mm) for Japanese text: (longest line character count × font size × 0.9) + 5mm padding
    - Width (mm) for Latin text: (longest line character count × font size × 0.6) + 5mm padding
    - Height (mm): (line count × font size × line height) + 5mm padding
  - For mixed text, calculate weighted average based on character ratio
  - **DO NOT oversize containers** - text should occupy at least 80% of element width
  - For titles: font sizes 16-24pt, with minimal padding (3-5mm)
  - For regular paragraphs: font sizes 10-12pt, with minimal padding (2-4mm)
  - For footnotes/captions: font sizes 8-9pt, with minimal padding (1-2mm)
  - **Line spacing calculation**: use 1.2-1.5 × font size for comfortable reading
  - **Letter spacing**: standard 0% for most text, -2% for headlines, +2% for small text
  - Long paragraphs (>100 chars) need width of at least 80 chars to avoid thin columns
  - **AVOID wasted space** - ensure text fills at least 80% of container area

- Table elements:
  - Header row height: ~15mm
  - Data row height: ~8mm per row
  - Column width: Calculate based on content - ~20mm for numeric, ~30mm for short text, ~50mm for long text
  - Balance column widths based on content type (numeric columns narrower, text columns wider)
  - **Remove unnecessary padding** - standardize to 2mm cell padding
  - For tables with many columns, reduce column width proportionally to fit
  - **Table height formula**: header (15mm) + (row count × 8mm) + 2mm bottom padding
  - **Table width formula**: sum of all column widths + (column count × 2mm padding)

- SVG/Image elements:
  - Maintain aspect ratio
  - Size appropriately based on importance and detail level
  - **Remove unnecessary surrounding space** - crop tightly around the image content

## 2. Whitespace and Margin Optimization
- **BETWEEN elements**: maintain sufficient spacing (5-8mm) 
- **INSIDE elements**: minimize internal padding to maximize content space
- Group related elements with consistent internal spacing (3-5mm)
- **Eliminate redundant whitespace** in layouts
- Use whitespace strategically to create visual hierarchy
- Ensure consistent margins between similar elements

## 3. Grid System Construction
- Divide page into virtual grid (e.g., 24 columns × 36 rows)
- Assign grid cells to elements based on importance and content volume
- Optimize element placement within grid (alignment, grouping)
- Use consistent column widths for visual harmony
- Maintain consistent gutters between grid columns (3-5mm)

## 4. Absolute Position Calculation
- Calculate element top-left coordinates (x, y) in millimeters
- Calculate element sizes (width, height) based on content and add appropriate margins
- Adjust coordinates and sizes to fit within page boundaries:
  - Left edge: minimum x = 5mm
  - Right edge: maximum x + width = ${pageDimensions.width - 5}mm
  - Top edge: minimum y = 5mm
  - Bottom edge: maximum y + height = ${pageDimensions.height - 5}mm

## 5. Precise Page Boundary Enforcement
- **CRITICAL**: You MUST perform exact calculations for ALL elements
- For each element, calculate:
  - Left edge: x
  - Right edge: x + width
  - Top edge: y
  - Bottom edge: y + height
- Verify that all calculated values are within page boundaries:
  - All left edges (x) must be ≥ 5mm
  - All right edges (x + width) must be ≤ ${pageDimensions.width - 5}mm
  - All top edges (y) must be ≥ 5mm
  - All bottom edges (y + height) must be ≤ ${pageDimensions.height - 5}mm
- Identify the elements closest to each boundary:
  - Element with minimum x (closest to left edge)
  - Element with maximum (x + width) (closest to right edge)
  - Element with minimum y (closest to top edge)
  - Element with maximum (y + height) (closest to bottom edge)
- Ensure these extreme elements have sufficient margin (at least 5mm) from page edges
- If any element exceeds boundaries, adjust its position and/or size

## 6. Element Relationship Calculation
- Optimize distances between related elements
- Calculate placement to support natural eye flow
- Quantify and reflect visual hierarchy based on importance
- Align elements to create clean visual lines
- Establish clear parent-child relationships through proximity and sizing

## 7. Balance Optimization
- Calculate visual center of gravity and maintain balance
- Equalize distribution of whitespace and element density
- Consider color balance and visual rhythm
- Ensure no single area is too dense or too empty
- Distribute elements to avoid lopsided layouts

${spacingGuidelines}

${sizeAdjustmentGuidelines}

# Layout Patterns
Follow specific layout patterns if requested by the user:

## Newspaper Style
- Divide into multiple columns (typically 2-3)
- Make headings large and prominent
- Flow body text in smaller font across multiple columns
- Group related elements
- Create visual hierarchy based on importance

## Invoice/Business Layout
- Header at top (company name, logo)
- Clear section divisions (recipient info, details, totals)
- Neatly arranged tables with right-aligned numerical values
- Highlight important information (total amounts)
- Footer at bottom (notes, payment terms)

## Catalog/Brochure Layout
- Emphasize visual elements
- Organize information in columns
- Group related elements
- Guide eye flow through strategic placement
- Use whitespace effectively

## Even Distribution Layout
- Maintain equal spacing between elements
- Unify size of similar elements
- Align to grid
- Create balanced placement
- Consider symmetry

## Grid Layout
- Place based on strict grid system
- Create orderly placement with columns and rows
- Use modular element placement
- Maintain consistent spacing and alignment
- Create structured, orderly design

# Response Format
Return using the exact current template schema format. Do not add new properties; maintain the existing structure while only changing positions and styles.
Do not change text content itself unless specifically instructed by the user.

Return the existing element array with only necessary property updates.
For example, update position, size, and font settings for text elements; position, size, and style settings for table elements.

Available fonts:
- NotoSerifJP-Regular (Japanese serif font, default)
- NotoSansJP-Regular (Japanese sans-serif font)
- NotoSansKR-Regular (Korean sans-serif font)
- MeaCulpa-Regular (Decorative script font)
- MonsieurLaDoulaise-Regular (Elegant script font)
- RozhaOne-Regular (Bold, emphasized serif font)
- Roboto (Standard Latin font)

${colorInfo}

Current design elements description:
${elementsDescription}

# Important Points
1. Maintain all existing element properties while editing only what's necessary
2. Follow user instructions to improve layout for a more beautiful, professional design
3. Keep positions within range: x:10-${pageDimensions.width - 10}mm, y:10-${
      pageDimensions.height - 10
    }mm
4. Maintain appropriate spacing between elements to prevent overlapping (except in "compact mode")
5. Consider readability and balance in your layout
6. Preserve original element structure as much as possible (especially special properties)
7. Perform mathematically precise grid calculations and consider element relationships
8. Use absolute positioning to fit elements within the page
9. Adjust element sizes based on content to prevent text cutoffs or overflow
10. Optimize font sizes for different element types (larger for titles, medium for subheadings, smaller for body text)
11. Calculate precise whitespace needs based on text length and importance

# RESTRICTIONS ON EDITABLE PROPERTIES
You are ONLY allowed to modify the following properties:
1. fontSize - You can adjust text size for better readability
2. position (x, y) - You can change element positions for better layout
3. width - You can adjust element widths based on content
4. height - You can adjust element heights based on content

You must NOT modify these properties:
1. fontName - Keep the original font settings
2. color - Do not change any text colors
3. backgroundColor - Do not change any background colors
4. borderColor - Do not change any border colors
5. content - Do not modify the actual text content unless specifically requested
6. Any other style properties not listed in the "allowed to modify" section

# FINAL REMINDER - AVOIDING EXCESSIVE WHITESPACE
- ALWAYS size text elements based on actual content - NOT arbitrary fixed sizes
- Use the exact formulas provided for width and height calculations
- Reduce padding to absolute minimum necessary (2-5mm depending on element type)
- Ensure text fills at least 80% of container area
- Never leave large empty areas within elements
- For Japanese text, consider character width is about 1.5-2× wider than Latin characters
- For tables, calculate exact width needed for columns based on content, not fixed values
- When in doubt, choose tighter spacing over excessive whitespace

Return only a pure JSON array of objects, with no markdown notation or explanatory text.`;

    // 完全な現在のデザイン要素データをプロンプトに追加
    const userPrompt = `${prompt}

CRITICAL: UNITS ARE IN MILLIMETERS (mm), NOT PIXELS (px)
The current layout has elements NOT fitting within the page because of unit confusion.
- ALL measurements MUST be in MILLIMETERS (mm)
- The page size is ${pageDimensions.width}mm × ${pageDimensions.height}mm
- Typical element sizes:
  - Text heights: 10-20mm (NOT 100-200mm)
  - Text widths: 80-150mm (NOT 800-1500mm)
  - Margins between elements: 5-10mm (NOT 50-100mm)
- BEFORE FINALIZING, verify all your measurements are in mm scale

IMPORTANT: The current layout has EXCESSIVE WHITESPACE inside elements. Please fix this by:
1. Adjusting element sizes based on their actual content
2. Following the sizing formulas in the system instructions
3. Reducing padding to minimum necessary values
4. Ensuring text fills at least 80% of container area
5. Removing any unnecessary empty space

IMPORTANT: You MUST perform EXACT calculations to ensure all elements fit within page boundaries:
1. For EACH element, calculate: left edge (x), right edge (x+width), top edge (y), bottom edge (y+height)
2. Check ALL elements against page boundaries (${pageDimensions.width}mm × ${
      pageDimensions.height
    }mm)
3. Ensure minimum 5mm margin from all page edges
4. Pay special attention to:
   - Element closest to left edge (minimum x)
   - Element closest to right edge (maximum x+width)
   - Element closest to top edge (minimum y)
   - Element closest to bottom edge (maximum y+height)
5. Adjust any elements that exceed or come too close to page boundaries

RESTRICTIONS: You may ONLY modify these properties:
- fontSize: Adjust text size for readability
- position (x, y): Change element positions
- width: Adjust based on content
- height: Adjust based on content

DO NOT change fonts, colors, backgrounds, borders, content, or any other properties!

Complete current design element data: ${JSON.stringify(currentElements)}`;

    // OpenRouterにリクエストを送信
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://pdfme-app.vercel.app/',
          'X-Title': 'PDFme App',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API エラー:', errorData);
      return NextResponse.json(
        { error: 'AIモデルからの応答に失敗しました' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const messageContent = data.choices[0]?.message?.content || '';

    if (!messageContent) {
      return NextResponse.json(
        { error: 'AIモデルからの応答が空です' },
        { status: 400 }
      );
    }

    try {
      // レイアウト編集要素のレスポンスを処理
      const elements = await processLayoutEditResponse(data, currentElements);

      if (elements) {
        return NextResponse.json({
          elements,
          model: data.model,
        });
      } else {
        return NextResponse.json(
          { error: '有効なレイアウト編集要素が生成されませんでした' },
          { status: 400 }
        );
      }
    } catch (error: any) {
      console.error('レイアウト編集応答処理エラー:', error);
      return NextResponse.json(
        { error: error.message || 'AIの応答を処理できませんでした' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('API処理エラー:', error);
    return NextResponse.json(
      { error: error.message || '不明なエラーが発生しました' },
      { status: 500 }
    );
  }
}

// レイアウト編集要素のレスポンスを処理する関数
const processLayoutEditResponse = async (
  response: any,
  currentElements: any[]
) => {
  try {
    let content = response.choices[0]?.message?.content || '';
    console.log('AIからの応答テキスト:', content);

    // JSONオブジェクトを抽出
    let jsonContent = content;

    // マークダウンコードブロックを削除
    if (content.includes('```json')) {
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
      const match = content.match(jsonRegex);
      if (match && match[1]) {
        jsonContent = match[1].trim();
      }
    } else if (content.includes('```')) {
      const jsonRegex = /```\s*([\s\S]*?)\s*```/;
      const match = content.match(jsonRegex);
      if (match && match[1]) {
        jsonContent = match[1].trim();
      }
    }

    // JSONの解析を試みる
    let elements: any[] = [];
    try {
      elements = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('JSONの解析に失敗しました:', parseError);

      // 前後の不要なテキストを取り除く
      jsonContent = jsonContent.replace(/^\s*\[/, '[').replace(/\]\s*$/, ']');
      try {
        elements = JSON.parse(jsonContent);
      } catch (secondParseError) {
        console.error('2回目のJSONの解析にも失敗しました:', secondParseError);
        throw new Error('JSONの解析に失敗しました');
      }
    }

    if (!Array.isArray(elements)) {
      throw new Error('生成された要素が配列ではありません');
    }

    if (elements.length === 0) {
      throw new Error('要素が生成されませんでした');
    }

    console.log('処理された要素数:', elements.length);

    // 元の要素と比較して、すべての必要なプロパティが維持されているか確認
    if (currentElements && Array.isArray(currentElements)) {
      // 要素数が減っていないか確認
      if (elements.length < currentElements.length) {
        console.warn(
          '警告: 要素数が減少しています。元の要素数:',
          currentElements.length,
          '新しい要素数:',
          elements.length
        );
      }

      // 各要素について必要なプロパティの確認
      elements.forEach((element, index) => {
        // 対応する元の要素を探す
        const originalElement = currentElements.find(
          (e) => e.name === element.name
        );

        // もし元の要素が見つかった場合、削除されているべきでないプロパティをコピーする
        if (originalElement) {
          // 要素の型を確認
          if (originalElement.type !== element.type) {
            console.warn(
              `警告: 要素 "${element.name}" の型が変更されています。元の型:`,
              originalElement.type,
              '新しい型:',
              element.type
            );
            element.type = originalElement.type; // 型を元に戻す
          }

          // 特定の要素型に応じたプロパティの確認
          if (
            element.type === 'svg' &&
            !element.content &&
            originalElement.content
          ) {
            console.warn(
              `警告: SVG要素 "${element.name}" のcontentが失われています。元に戻します。`
            );
            element.content = originalElement.content;
          }

          // テーブル要素の場合、contentがJSON文字列であることを確認
          if (element.type === 'table' && element.content) {
            if (typeof element.content !== 'string') {
              console.warn(
                `警告: テーブル要素 "${element.name}" のcontentが文字列ではありません。文字列化します。`
              );
              element.content = JSON.stringify(element.content);
            }
          }
        } else {
          console.warn(
            `警告: 元のデザインにない新しい要素を検出しました: "${element.name}"`
          );
        }

        // 基本的な検証
        if (!element.name) {
          element.name = `element_${Math.random()
            .toString(36)
            .substring(2, 9)}`;
        }

        // 位置情報の検証
        if (
          !element.position ||
          typeof element.position.x !== 'number' ||
          typeof element.position.y !== 'number'
        ) {
          console.warn(
            `要素 "${element.name}" の位置情報が不正です、デフォルト値を設定します`
          );
          element.position = { x: 10 + index * 5, y: 10 + index * 10 };
        }

        // サイズ情報の検証
        if (!element.width || typeof element.width !== 'number') {
          element.width = 100;
        }
        if (!element.height || typeof element.height !== 'number') {
          element.height = 20;
        }

        // テキスト要素の場合のフォント情報の検証
        if (element.type === 'text') {
          if (!element.fontName) {
            element.fontName = 'NotoSerifJP-Regular';
          }
          if (!element.fontSize || typeof element.fontSize !== 'number') {
            element.fontSize = 12;
          }
        }
      });
    }

    return elements;
  } catch (error) {
    console.error('レイアウト編集応答処理エラー:', error);
    throw error;
  }
};
