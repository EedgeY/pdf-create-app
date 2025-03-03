import {
  Template,
  Font,
  checkTemplate,
  getInputFromTemplate,
  getDefaultFont,
} from '@pdfme/common';
import { Form, Viewer, Designer } from '@pdfme/ui';
import { generate } from '@pdfme/generator';
import {
  // multiVariableText,
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
  // select,
  // checkbox,
  // radioGroup,
} from '@pdfme/schemas';
import { saveTemplate } from './actions';

// PDFmeライブラリの初期化状態を追跡
let isPdfmeInitialized = false;

// PDFmeライブラリを初期化する関数
export const initializePdfme = async (): Promise<boolean> => {
  if (isPdfmeInitialized) return true;

  try {
    // 必要なモジュールを事前に読み込む
    await Promise.all([
      import('@pdfme/generator'),
      import('@pdfme/common'),
      import('@pdfme/ui'),
      import('@pdfme/schemas'),
    ]);

    console.log('PDFmeライブラリの初期化が完了しました');
    isPdfmeInitialized = true;
    return true;
  } catch (error) {
    console.error('PDFmeライブラリの初期化に失敗しました:', error);
    return false;
  }
};

export const getFontsData = (): Font => ({
  ...getDefaultFont(),
});

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
    // 'Multi-Variable Text': multiVariableText,
    Table: table,
    Line: line,
    Rectangle: rectangle,
    Ellipse: ellipse,
    Image: image,
    SVG: svg,
    QR: barcodes.qrcode,
    DateTime: dateTime,
    Date: date,
    Time: time,
    // Select: select,
    // Checkbox: checkbox,
    // RadioGroup: radioGroup,
    // JAPANPOST: barcodes.japanpost,
    // EAN13: barcodes.ean13,
    // EAN8: barcodes.ean8,
    // Code39: barcodes.code39,
    // Code128: barcodes.code128,
    // NW7: barcodes.nw7,
    // ITF14: barcodes.itf14,
    // UPCA: barcodes.upca,
    // UPCE: barcodes.upce,
    // GS1DataMatrix: barcodes.gs1datamatrix,
  };
};

export const translations: { label: string; value: string }[] = [
  { value: 'ja', label: 'Japanese' },
];

export const generatePDF = async (
  currentRef: Designer | Form | Viewer | null
) => {
  if (!currentRef) return;

  try {
    // PDFmeライブラリが初期化されていることを確認
    await initializePdfme();

    const template = currentRef.getTemplate();
    const options = currentRef.getOptions();
    const inputs =
      typeof (currentRef as Viewer | Form).getInputs === 'function'
        ? (currentRef as Viewer | Form).getInputs()
        : getInputFromTemplate(template);

    try {
      const pdf = await generate({
        template,
        inputs,
        options: {
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
      console.error('PDF生成エラー:', e);

      if (e instanceof Error && e.message.includes('ChunkLoadError')) {
        alert(
          'リソースの読み込みに失敗しました。ページを再読み込みして再試行してください。'
        );
      } else {
        alert(`PDF生成エラー: ${e}\n\n詳細はコンソールを確認してください。`);
      }

      throw e;
    }
  } catch (initError) {
    console.error('PDFmeライブラリの初期化エラー:', initError);
    alert(
      'PDFライブラリの初期化に失敗しました。ページを再読み込みして再試行してください。'
    );
  }
};

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch {
    return false;
  }
  return true;
};

export const getBlankTemplate = () =>
  ({
    schemas: [{}],
    basePdf: {
      width: 210,
      height: 297,
      padding: [20, 10, 20, 10],
    },
  } as Template);

// Designer拡張型の定義（表示設定のメソッドを追加）
interface ExtendedDesigner extends Designer {
  getDisplaySettings?: () => any;
  setDisplaySettings?: (settings: any) => void;
}

// 表示設定を含めたテンプレート保存
export const saveTemplateWithSettings = async (
  currentRef: Designer | Form | Viewer | null,
  templateName: string
) => {
  if (!currentRef) return { error: 'デザイナーが初期化されていません' };

  try {
    const template = (currentRef as Designer).getTemplate();
    const displaySettings =
      (currentRef as ExtendedDesigner).getDisplaySettings?.() || {};

    const result = await saveTemplate({
      templateName,
      template,
      elementDisplaySettings: displaySettings,
    });

    return result;
  } catch (error) {
    console.error('テンプレート保存エラー:', error);
    return { error: String(error) };
  }
};
