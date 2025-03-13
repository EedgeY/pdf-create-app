import { Template } from '@pdfme/common';

// テンプレート関数のインターフェース
export interface TemplateWithImage {
  key: string;
  label: string;
  image: string;
  template: () => Template;
}

// カテゴリーとそのテンプレートのインターフェース
export interface TemplateCategory {
  id: string;
  name: string;
  templates: TemplateWithImage[];
}

export function getBkank(): Template {
  return {
    basePdf: '',
    schemas: [
      [
        {
          name: 'BLANK',
          type: 'text',
          position: { x: 20, y: 20 },
          width: 100,
          height: 20,
          fontName: 'NotoSerifJP-Regular',
          fontSize: 12,
          fontColor: '#000000',
          alignment: 'left',
          verticalAlignment: 'top',
          value: '無題',
        },
      ],
    ],
  };
}

const getBlankTemplate = () =>
  ({
    schemas: [{}],
    basePdf: {
      width: 210,
      height: 297,
      padding: [0, 0, 0, 0],
    },
  } as Template);

// カテゴリー別テンプレート定義
export const templateCategories: TemplateCategory[] = [
  {
    id: 'all',
    name: 'すべて',
    templates: [
      {
        key: 'blank',
        label: '無題',
        image: '/images/templates/blank.svg',
        template: getBlankTemplate,
      },
    ],
  },
];

// 全テンプレートのフラットなリストを取得する関数
export function getAllTemplates(): TemplateWithImage[] {
  return templateCategories.flatMap((category) => category.templates);
}

// キーからテンプレート関数を取得する関数
export function getTemplateByKey(key: string): Template {
  const template = getAllTemplates().find((t) => t.key === key);
  return template ? template.template() : getBlankTemplate(); // デフォルトとして証明書1を返す
}
