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

// 証明書テンプレート関数
export function getCertificate1(): Template {
  return {
    basePdf: '',
    schemas: [
      [
        {
          name: 'certificate1_title',
          type: 'text',
          position: { x: 20, y: 20 },
          width: 100,
          height: 20,
          fontName: 'NotoSerifJP-Regular',
          fontSize: 12,
          fontColor: '#000000',
          alignment: 'left',
          verticalAlignment: 'top',
          value: '証明書1',
        },
      ],
    ],
  };
}

export function getCertificate2(): Template {
  return {
    basePdf: '',
    schemas: [
      [
        {
          name: 'certificate2_title',
          type: 'text',
          position: { x: 20, y: 20 },
          width: 100,
          height: 20,
          fontName: 'NotoSerifJP-Regular',
          fontSize: 12,
          fontColor: '#000000',
          alignment: 'left',
          verticalAlignment: 'top',
          value: '証明書2',
        },
      ],
    ],
  };
}

// 請求書テンプレート関数
export function getInvoice1(): Template {
  return {
    basePdf: '',
    schemas: [
      [
        {
          name: 'invoice1_title',
          type: 'text',
          position: { x: 20, y: 20 },
          width: 100,
          height: 20,
          fontName: 'NotoSerifJP-Regular',
          fontSize: 12,
          fontColor: '#000000',
          alignment: 'left',
          verticalAlignment: 'top',
          value: '請求書1',
        },
      ],
    ],
  };
}

export function getInvoice2(): Template {
  return {
    basePdf: '',
    schemas: [
      [
        {
          name: 'invoice2_title',
          type: 'text',
          position: { x: 20, y: 20 },
          width: 100,
          height: 20,
          fontName: 'NotoSerifJP-Regular',
          fontSize: 12,
          fontColor: '#000000',
          alignment: 'left',
          verticalAlignment: 'top',
          value: '請求書2',
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
    id: 'certificates',
    name: '証明書',
    templates: [
      {
        key: 'certificate1',
        label: '証明書1',
        image: '/images/templates/certificate1.svg',
        template: getCertificate1,
      },
      {
        key: 'certificate2',
        label: '証明書2',
        image: '/images/templates/certificate2.svg',
        template: getCertificate2,
      },
    ],
  },
  {
    id: 'invoices',
    name: '請求書',
    templates: [
      {
        key: 'invoice1',
        label: '請求書1',
        image: '/images/templates/invoice1.svg',
        template: getInvoice1,
      },
      {
        key: 'invoice2',
        label: '請求書2',
        image: '/images/templates/invoice2.svg',
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
  return template ? template.template() : getCertificate1(); // デフォルトとして証明書1を返す
}
