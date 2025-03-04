import {
  Template,
  Font,
  checkTemplate,
  getInputFromTemplate,
  getDefaultFont,
  DEFAULT_FONT_NAME,
} from '@pdfme/common';
import { Form, Viewer, Designer } from '@pdfme/ui';
import { generate } from '@pdfme/generator';
import {
  multiVariableText,
  text,
  barcodes,
  image,
  svg,
  line,
  table,
  rectangle,
  ellipse,
  dateTime,
  date,
  time,
  select,
  checkbox,
  radioGroup,
} from '@pdfme/schemas';
import plugins from './plugins';

const fontObjList = [
  {
    fallback: true,
    label: 'NotoSerifJP-Regular',
    url: '/fonts/NotoSerifJP-Regular.ttf',
  },
  {
    fallback: false,
    label: 'NotoSansJP-Regular',
    url: '/fonts/NotoSansJP-Regular.ttf',
  },
  {
    fallback: false,
    label: DEFAULT_FONT_NAME,
    data: getDefaultFont()[DEFAULT_FONT_NAME].data,
  },
];

export const getFontsData = async () => {
  const fontDataList = (await Promise.all(
    fontObjList.map(async (font) => ({
      ...font,
      data:
        font.data ||
        (await fetch(font.url || '').then((res) => res.arrayBuffer())),
    }))
  )) as { fallback: boolean; label: string; data: ArrayBuffer }[];

  return fontDataList.reduce(
    (acc, font) => ({ ...acc, [font.label]: font }),
    {} as Font
  );
};

export const readFile = (
  file: File | null,
  type: 'text' | 'dataURL' | 'arrayBuffer'
) => {
  return new Promise<string | ArrayBuffer>((r) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (e) => {
      if (e && e.target && e.target.result && file !== null) {
        r(e.target.result);
      }
    });
    if (file !== null) {
      if (type === 'text') {
        fileReader.readAsText(file);
      } else if (type === 'dataURL') {
        fileReader.readAsDataURL(file);
      } else if (type === 'arrayBuffer') {
        fileReader.readAsArrayBuffer(file);
      }
    }
  });
};

const getTemplateFromJsonFile = (file: File) => {
  return readFile(file, 'text').then((jsonStr) => {
    const template: Template = JSON.parse(jsonStr as string);
    checkTemplate(template);
    return template;
  });
};

export const downloadJsonFile = (json: unknown, title: string) => {
  if (typeof window !== 'undefined') {
    const blob = new Blob([JSON.stringify(json)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
};

export const handleLoadTemplate = (
  e: React.ChangeEvent<HTMLInputElement>,
  currentRef: Designer | Form | Viewer | null
) => {
  if (e.target && e.target.files) {
    getTemplateFromJsonFile(e.target.files[0])
      .then((t) => {
        if (!currentRef) return;
        currentRef.updateTemplate(t);
      })
      .catch((e) => {
        alert(`Invalid template file.
--------------------------
${e}`);
      });
  }
};

export const getPlugins = () => {
  return {
    Text: text,
    'Multi-Variable Text': multiVariableText,
    Table: table,
    Line: line,
    Rectangle: rectangle,
    Ellipse: ellipse,
    Image: image,
    SVG: svg,
    Signature: plugins.signature,
    QR: barcodes.qrcode,
    DateTime: dateTime,
    Date: date,
    Time: time,
    Select: select,
    Checkbox: checkbox,
    RadioGroup: radioGroup,
    // JAPANPOST: barcodes.japanpost,
    EAN13: barcodes.ean13,
    // EAN8: barcodes.ean8,
    // Code39: barcodes.code39,
    Code128: barcodes.code128,
    // NW7: barcodes.nw7,
    // ITF14: barcodes.itf14,
    // UPCA: barcodes.upca,
    // UPCE: barcodes.upce,
    // GS1DataMatrix: barcodes.gs1datamatrix,
  };
};

export const translations: { label: string; value: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'th', label: 'Thai' },
  { value: 'pl', label: 'Polish' },
  { value: 'it', label: 'Italian' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
];

export const models = [
  'anthropic/claude-3.7-sonnet',
  'google/gemini-2.0-flash-001',
  'deepseek/deepseek-chat',
];

export const generatePDF = async (
  currentRef: Designer | Form | Viewer | null
) => {
  if (!currentRef) return;
  const template = currentRef.getTemplate();
  const options = currentRef.getOptions();
  const inputs =
    typeof (currentRef as Viewer | Form).getInputs === 'function'
      ? (currentRef as Viewer | Form).getInputs()
      : getInputFromTemplate(template);
  const font = await getFontsData();

  try {
    const pdf = await generate({
      template,
      inputs,
      options: {
        font,
        lang: options.lang,
        title: 'pdfme',
      },
      plugins: getPlugins(),
    });

    const blob = new Blob([new Uint8Array(pdf.buffer)], {
      type: 'application/pdf',
    });
    window.open(URL.createObjectURL(blob));
  } catch (e) {
    alert(e + '\n\nCheck the console for full stack trace');
    throw e;
  }
};

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

const getInvoiceTemplate = (): Template => ({
  schemas: [
    [
      {
        type: 'svg',
        position: {
          x: 20,
          y: 20,
        },
        content:
          '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">\n  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />\n</svg>\n',
        width: 23.86,
        height: 23.86,
        readOnly: true,
        name: 'logo',
      },
      {
        type: 'text',
        position: {
          x: 120.13,
          y: 20,
        },
        content: 'INVOICE',
        width: 69.87,
        height: 22.68,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'middle',
        fontSize: 40,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        readOnly: true,
        fontName: 'NotoSerifJP-Regular',
        name: 'head',
      },
      {
        type: 'text',
        position: {
          x: 20,
          y: 57.88,
        },
        content: 'Billed to:',
        width: 84.69,
        height: 9.42,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'top',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        readOnly: true,
        fontName: 'NotoSerifJP-Regular',
        name: 'billedToLabel',
      },
      {
        type: 'text',
        content:
          'Imani Olowe \n+123-456-7890 \n63 Ivy Road, Hawkville, GA, USA 31036',
        position: {
          x: 20,
          y: 67.94,
        },
        width: 84.95,
        height: 34.07,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'top',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        dynamicFontSize: {
          min: 3,
          max: 13,
          fit: 'vertical',
        },
        fontName: 'NotoSerifJP-Regular',
        name: 'billedToInput',
      },
      {
        type: 'multiVariableText',
        position: {
          x: 119.87,
          y: 67.88,
        },
        content: '{"InvoiceNo":"12345","Date":"16 June 2025"}',
        width: 70.13,
        height: 33.52,
        rotate: 0,
        alignment: 'right',
        verticalAlignment: 'top',
        fontSize: 13,
        lineHeight: 1.5,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        strikethrough: false,
        underline: false,
        text: 'Invoice No.{InvoiceNo}\n{Date}',
        variables: ['InvoiceNo', 'Date'],
        fontName: 'NotoSerifJP-Regular',
        name: 'info',
      },
      {
        type: 'table',
        position: {
          x: 20,
          y: 110.81,
        },
        width: 170,
        height: 45.75920000000001,
        content:
          '[["Eggshell Camisole Top","1","123","123"],["Cuban Collar Shirt","2","127","254"]]',
        showHead: true,
        head: ['Item', 'Quantity', 'Unit Price', 'Total'],
        headWidthPercentages: [
          49.538325694806396, 17.962830593295262, 19.26354959425127,
          13.23529411764708,
        ],
        fontName: 'NotoSerifJP-Regular',
        tableStyles: {
          borderWidth: 0,
          borderColor: '#000000',
        },
        headStyles: {
          fontName: 'NotoSerifJP-Regular',
          fontSize: 13,
          characterSpacing: 0,
          alignment: 'center',
          verticalAlignment: 'middle',
          lineHeight: 1,
          fontColor: '#000000',
          borderColor: '#000000',
          backgroundColor: '',
          borderWidth: {
            top: 0.1,
            right: 0,
            bottom: 0,
            left: 0,
          },
          padding: {
            top: 5,
            right: 5,
            bottom: 5,
            left: 5,
          },
        },
        bodyStyles: {
          fontName: 'NotoSerifJP-Regular',
          fontSize: 13,
          characterSpacing: 0,
          alignment: 'center',
          verticalAlignment: 'middle',
          lineHeight: 1,
          fontColor: '#000000',
          borderColor: '#000000',
          backgroundColor: '',
          alternateBackgroundColor: '',
          borderWidth: {
            top: 0.1,
            right: 0,
            bottom: 0.1,
            left: 0,
          },
          padding: {
            top: 6,
            right: 5,
            bottom: 5,
            left: 5,
          },
        },
        columnStyles: {
          alignment: {
            '0': 'left',
            '3': 'right',
          },
        },
        name: 'orders',
        readOnly: false,
      },
      {
        type: 'text',
        position: {
          x: 133.01,
          y: 156.89,
        },
        content: 'Subtotal',
        width: 25.42,
        height: 8.09,
        rotate: 0,
        alignment: 'right',
        verticalAlignment: 'middle',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        readOnly: true,
        fontName: 'NotoSerifJP-Regular',
        name: 'subtotalLabel',
      },
      {
        type: 'multiVariableText',
        position: {
          x: 118.73,
          y: 164.98,
        },
        name: 'taxInput',
        content: '{"rate":"10"}',
        width: 40.2,
        height: 9.18,
        rotate: 0,
        alignment: 'right',
        verticalAlignment: 'middle',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        strikethrough: false,
        underline: false,
        readOnly: false,
        text: 'Tax ({rate}%)',
        variables: ['rate'],
        required: false,
        dynamicFontSize: {
          min: 4,
          max: 13,
          fit: 'vertical',
        },
        fontName: 'NotoSerifJP-Regular',
      },
      {
        type: 'line',
        position: {
          x: 132.09,
          y: 174.35,
        },
        width: 52.91,
        height: 0.1,
        rotate: 0,
        opacity: 1,
        readOnly: true,
        color: '#000000',
        name: 'line',
        content: '',
      },
      {
        type: 'text',
        content:
          '{orders.reduce((sum, item) => sum + parseFloat(item[1] || 0) * parseFloat(item[2] || 0), 0)}',
        position: {
          x: 158.79,
          y: 157.1,
        },
        width: 26.21,
        height: 7.56,
        rotate: 0,
        alignment: 'right',
        verticalAlignment: 'middle',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        fontName: 'NotoSerifJP-Regular',
        name: 'subtotal',
        readOnly: true,
        required: false,
        dynamicFontSize: {
          min: 4,
          max: 13,
          fit: 'horizontal',
        },
      },
      {
        type: 'text',
        content: '{Number(subtotal) * Number(taxInput.rate) / 100}',
        position: {
          x: 158.79,
          y: 164.98,
        },
        width: 26.21,
        height: 8.89,
        rotate: 0,
        alignment: 'right',
        verticalAlignment: 'middle',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        fontName: 'NotoSerifJP-Regular',
        name: 'tax',
        readOnly: true,
        required: false,
        dynamicFontSize: {
          min: 4,
          max: 13,
          fit: 'horizontal',
        },
      },
      {
        type: 'text',
        position: {
          x: 131.94,
          y: 174.64,
        },
        content: 'Total',
        width: 27.01,
        height: 11,
        rotate: 0,
        alignment: 'right',
        verticalAlignment: 'middle',
        fontSize: 20,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        fontName: 'NotoSerifJP-Regular',
        backgroundColor: '',
        opacity: 1,
        readOnly: true,
        name: 'totalLabel',
      },
      {
        type: 'text',
        content: '${Number(subtotal) + Number(tax)}',
        position: {
          x: 159.05,
          y: 174.64,
        },
        width: 25.95,
        height: 11,
        rotate: 0,
        alignment: 'right',
        verticalAlignment: 'middle',
        fontSize: 20,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        fontName: 'NotoSerifJP-Regular',
        name: 'total',
        readOnly: true,
        required: false,
        dynamicFontSize: {
          min: 4,
          max: 20,
          fit: 'horizontal',
        },
      },
      {
        type: 'text',
        position: {
          x: 20,
          y: 191.58,
        },
        content: 'Thank you!',
        width: 52.67,
        height: 20,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'top',
        fontSize: 20,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        fontName: 'NotoSerifJP-Regular',
        backgroundColor: '',
        opacity: 1,
        readOnly: true,
        name: 'thankyou',
      },
      {
        type: 'text',
        position: {
          x: 20,
          y: 232.67,
        },
        content: 'Payment Information',
        width: 84.69,
        height: 9.42,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'top',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        readOnly: true,
        fontName: 'NotoSerifJP-Regular',
        name: 'paymentInfoLabel',
      },
      {
        type: 'text',
        content:
          'Briard Bank\nAccount Name: Samira Hadid\nAccount No.: 123-456-7890\nPay by: 5 July 2025',
        position: {
          x: 20,
          y: 242.83,
        },
        width: 84.95,
        height: 34.07,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'top',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        dynamicFontSize: {
          min: 3,
          max: 13,
          fit: 'vertical',
        },
        fontName: 'NotoSerifJP-Regular',
        name: 'paymentInfoInput',
      },
      {
        type: 'text',
        position: {
          x: 119.33,
          y: 248.39,
        },
        content: 'Samira Hadid',
        width: 70.67,
        height: 8.36,
        rotate: 0,
        alignment: 'right',
        verticalAlignment: 'top',
        fontSize: 18,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        readOnly: true,
        fontName: 'NotoSerifJP-Regular',
        name: 'shopName',
      },
      {
        type: 'text',
        position: {
          x: 107.69,
          y: 256.9,
        },
        content: '123 Anywhere St., Any City, ST 12345',
        width: 82.31,
        height: 20,
        rotate: 0,
        alignment: 'right',
        verticalAlignment: 'top',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        readOnly: true,
        fontName: 'NotoSerifJP-Regular',
        name: 'shopAddress',
      },
    ],
  ],
  basePdf: {
    width: 210,
    height: 297,
    padding: [20, 20, 20, 20],
    staticSchema: [
      {
        name: 'line',
        type: 'line',
        position: {
          x: 20,
          y: 279,
        },
        width: 170,
        height: 0.2,
        rotate: 0,
        opacity: 1,
        readOnly: true,
        color: '#999999',
        required: false,
        content: '',
      },
      {
        name: 'footerInfo',
        type: 'text',
        content: 'Invoice No.{info.InvoiceNo} • {total}USD due {date}',
        position: {
          x: 20,
          y: 282,
        },
        width: 122.51,
        height: 10,
        rotate: 0,
        alignment: 'left',
        verticalAlignment: 'middle',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        strikethrough: false,
        underline: false,
        required: false,
        readOnly: true,
      },
      {
        name: 'pageNumber',
        type: 'text',
        content: 'Page {currentPage} of {totalPages}',
        position: {
          x: 145,
          y: 282,
        },
        width: 45,
        height: 10,
        rotate: 0,
        alignment: 'right',
        verticalAlignment: 'middle',
        fontSize: 13,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: '#000000',
        backgroundColor: '',
        opacity: 1,
        strikethrough: false,
        underline: false,
        required: false,
        readOnly: true,
      },
    ],
  },
  pdfmeVersion: '5.0.0',
});

const getBlankTemplate = () =>
  ({
    schemas: [{}],
    basePdf: {
      width: 210,
      height: 297,
      padding: [20, 10, 20, 10],
    },
  } as Template);
export const getTemplatePresets = (): {
  key: string;
  label: string;
  template: () => Template;
}[] => [
  { key: 'invoice', label: 'Invoice', template: getInvoiceTemplate },

  { key: 'blank', label: 'Blank', template: getBlankTemplate },
  { key: 'custom', label: 'Custom', template: getBlankTemplate },
];

export const getTemplateByPreset = (templatePreset: string): Template => {
  const templatePresets = getTemplatePresets();
  const preset = templatePresets.find(
    (preset) => preset.key === templatePreset
  );
  return preset ? preset.template() : templatePresets[0].template();
};
