import { PDFRenderProps, Plugin, Schema, UIRenderProps } from '@pdfme/common';
import {
  PDFString,
  PDFArray,
  PDFNumber,
  PDFDict,
  PDFName,
  PDFBool,
} from '@pdfme/pdf-lib';
import { text } from '@pdfme/schemas';

// inputs : [["text","url"]]

export interface LinkSchema extends Schema {
  url: string;
  autoOpen?: boolean; // 自動的に開くオプション
  alignment?: string; // 'left' | 'center' | 'right' | 'justify'
  verticalAlignment?: string; // 'top' | 'middle' | 'bottom'
  fontSize?: number;
  lineHeight?: number;
  characterSpacing?: number;
  fontColor?: string;
  backgroundColor?: string;
  strikethrough?: boolean;
  underline?: boolean;
  fontName?: string;
  content?: string;
}

const convertForPdfLayoutProps = ({
  schema,
  pageHeight,
  applyRotateTranslate = true,
}: {
  schema: any;
  pageHeight: number;
  applyRotateTranslate?: boolean;
}) => {
  const { position, width, height, rotate = 0 } = schema;
  const { x, y } = position;
  const result = {
    width,
    height,
    position: {
      x,
      y: pageHeight - y - height,
    },
  };

  if (rotate && applyRotateTranslate) {
    result.position = {
      x: result.position.x + width / 2,
      y: result.position.y + height / 2,
    };
  }

  return result;
};

// PDFページにURIリンクアノテーションを作成する関数
const createPageLinkAnnotation = (
  page: any,
  uri: string,
  rect: number[],
  autoOpen: boolean = false
) => {
  const actionDict: Record<string, any> = {
    Type: 'Action',
    S: 'URI',
    URI: PDFString.of(uri),
  };

  // 自動で開くオプションが有効な場合
  if (autoOpen) {
    actionDict['NewWindow'] = true; // 新しいウィンドウで開く
  }

  return page.doc.context.register(
    page.doc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: rect,
      Border: [0, 0, 0],
      C: [0, 0, 1], // 青色
      F: 4, // 表示フラグ
      H: 'I', // ハイライトモード（反転表示）
      A: actionDict,
    })
  );
};

export const link: Plugin<LinkSchema> = {
  ui: (arg: UIRenderProps<LinkSchema>) => {
    // URLがテキストとして使用される仕組みを実装
    const { schema, value, onChange } = arg;

    // テキストが未設定でURLが設定されている場合、URLをテキストとして使用
    if ((!value || value === '') && schema.url) {
      try {
        // 空のテキストの場合、URLをテキストとして設定
        const newValue = JSON.stringify([[schema.url, schema.url]]);
        if (onChange) {
          onChange({ key: 'content', value: newValue });
        }
      } catch (e) {
        console.error('URLをテキストに設定できませんでした:', e);
      }
    }

    return text.ui(arg as any);
  },
  pdf: async (arg: PDFRenderProps<LinkSchema>) => {
    const { value, pdfDoc, schema, page, ...rest } = arg;
    const pageHeight = page.getHeight();
    const {
      width,
      height,
      position: { x, y },
    } = convertForPdfLayoutProps({
      schema,
      pageHeight,
      applyRotateTranslate: false,
    });

    // JSONパースのエラーハンドリングを追加
    let displayText: string;
    let url: string;

    try {
      // 配列からテキストとURLを取得
      const values = JSON.parse(value) as string[][];
      displayText = values[0][0] || '';
      url = values[0][1] || schema.url || '';
    } catch (e) {
      // JSONパースに失敗した場合、テキストとURLのペアとして扱う
      console.warn(
        'Link value is not a valid JSON. Using schema.url for both text and link.'
      );
      displayText = schema.url || value || '';
      url = schema.url || '';
    }

    // URLが設定されていてテキストが空の場合、URLをテキストとして使用
    if (url && !displayText) {
      displayText = url;
    }

    console.log('Link values:', {
      displayText,
      url,
      autoOpen: schema.autoOpen,
    });

    // リンクらしく見せるために、スキーマを更新
    const enhancedSchema = {
      ...schema,
      underline: true, // リンクに下線を追加
      fontColor: schema.fontColor || '#0000FF', // 青色 (リンク色)
    };

    // テキスト部分をレンダリング
    const renderArgs = {
      value: displayText,
      pdfDoc,
      schema: enhancedSchema,
      page,
      ...rest,
    };

    await text.pdf(renderArgs as any);

    // URLが存在する場合のみリンクアノテーションを追加
    if (url) {
      // URLに必要なスキーマがない場合、httpを追加
      if (!/^[a-z]+:\/\//.test(url)) {
        url = 'http://' + url;
      }

      try {
        // リンク領域の座標を定義
        const rect = [x, y, x + width, y + height];

        // リンクアノテーションを作成（自動で開くオプション付き）
        const linkAnnotation = createPageLinkAnnotation(
          page,
          url,
          rect,
          schema.autoOpen
        );

        // ページにアノテーションを設定
        // 既存のアノテーションがあれば配列に追加、なければ新しい配列を作成
        let annotations = page.node.get(PDFName.of('Annots'));
        if (annotations && annotations instanceof PDFArray) {
          annotations.push(linkAnnotation);
        } else {
          page.node.set(
            PDFName.of('Annots'),
            page.doc.context.obj([linkAnnotation])
          );
        }

        console.log('リンクアノテーション追加成功:', url);
        console.log('リンク領域:', rect);
        console.log('自動で開く:', schema.autoOpen);
      } catch (e) {
        console.error('リンクアノテーション追加エラー:', e);
      }
    } else {
      console.warn('リンクにURLが指定されていません');
    }
  },
  propPanel: {
    schema: {
      ...text.propPanel.schema,
      url: {
        type: 'string',
        title: 'URL',
      },
      autoOpen: {
        type: 'boolean',
        title: '自動で開く',
        default: false,
      },
    },
    defaultSchema: {
      ...text.propPanel.defaultSchema,
      rotate: undefined,
      type: 'link',
      url: '',
      autoOpen: false,
    },
  },
};

export default link;
