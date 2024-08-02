'use client';
import { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { Template, checkTemplate, Lang } from '@pdfme/common';
import { signature } from '../plugins/signature';
import {
  text,
  readOnlyText,
  barcodes,
  image,
  readOnlyImage,
  svg,
  readOnlySvg,
  line,
  tableBeta,
  rectangle,
  ellipse,
} from '@pdfme/schemas';
import { saveAs } from 'file-saver';
import { Designer } from '@pdfme/ui';
import {
  getFontsData,
  getTemplatePresets,
  getTemplateByPreset,
  readFile,
  cloneDeep,
  handleLoadTemplate,
  generatePDF,
  downloadJsonFile,
} from '../helper';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PdfCodeDisplay from './PdfCodeDisplay';
import { Label } from '@/components/ui/label';
import { SelectLabel } from '@radix-ui/react-select';
import TemplateList from './TemplateList';
import {
  BotIcon,
  BotMessageSquare,
  Code2,
  CurlyBraces,
  Download,
  FileJson2,
  FileText,
  Import,
  ImportIcon,
  Loader2,
  RulerIcon,
  SaveIcon,
  TextCursorInput,
  Trash2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { set } from 'zod';
import DynamicTemplateForm from './DynamicTemplateForm';

interface TemplateInput {
  [key: string]: any;
}

const headerHeight = 65;

export const getPlugins = () => {
  return {
    Text: text,
    ReadOnlyText: readOnlyText,
    Table: tableBeta,
    Line: line,
    Rectangle: rectangle,
    Ellipse: ellipse,
    Image: image,
    ReadOnlyImage: readOnlyImage,
    SVG: svg,
    ReadOnlySvg: readOnlySvg,
    QR: barcodes.qrcode,
    Code128: barcodes.code128,
    Signature: signature,
  };
};

const initialTemplatePresetKey = 'invoice';
const customTemplatePresetKey = 'custom';

const templatePresets = getTemplatePresets();

const translations: { label: string; value: string }[] = [
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
interface PdfData {
  _id: string;
  name: string;
  data: any;
  updated_at: string;
}

interface TemplateListProps {
  templates: PdfData[];
}

function DesignView<TemplateListProps>({
  templates,
}: {
  templates: PdfData[];
}) {
  const { toast } = useToast();
  const designerRef = useRef<HTMLDivElement | null>(null);
  const designerInstanceRef = useRef<Designer | null>(null);
  const [lang, setLang] = useState<Lang>('ja');
  const [templatePreset, setTemplatePreset] = useState<string>(
    initialTemplatePresetKey
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogLoadingOpen, setIsDialogLoadingOpen] = useState(false);
  const [templateSize, setTemplateSize] = useState<{
    width: number;
    height: number;
    padding: [number, number, number, number];
  }>({
    width: 210,
    height: 297,
    padding: [0, 0, 0, 0],
  });
  const [showPdfCode, setShowPdfCode] = useState(false);
  const [generatedInputs, setGeneratedInputs] = useState<TemplateInput[]>([]);
  const [templateName, setTemplateName] = useState<string>('');
  const [showDynamicForm, setShowDynamicForm] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみ localStorage を使用
    const storedTemplatePreset = localStorage.getItem('templatePreset');
    if (storedTemplatePreset) {
      setTemplatePreset(storedTemplatePreset);
    }
  }, []);

  const onSaveTemplate = useCallback(
    (template?: Template) => {
      if (designerInstanceRef.current) {
        const templateToSave =
          template || designerInstanceRef.current.getTemplate();
        const templateString = JSON.stringify(templateToSave);
        const blob = new Blob([templateString], { type: 'application/json' });
        saveAs(blob, 'template.json');
        localStorage.setItem('template', templateString);

        toast({
          variant: 'success',
          title: 'Template saved as JSON file!',
          description: 'Friday, February 10, 2023 at 5:57 PM',
        });

        console.log('Saved template:', templateToSave);
      }
    },
    [toast]
  );
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTemplateSize((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handlePaddingChange = (index: number, value: string) => {
    setTemplateSize((prev) => {
      const newPadding: [number, number, number, number] = [...prev.padding];
      newPadding[index] = parseInt(value, 10);
      return { ...prev, padding: newPadding };
    });
  };

  const applyTemplateSize = () => {
    if (designerInstanceRef.current) {
      const template = designerInstanceRef.current.getTemplate();
      if (typeof template.basePdf === 'object' && 'width' in template.basePdf) {
        template.basePdf.width = templateSize.width;
        template.basePdf.height = templateSize.height;
        template.basePdf.padding = templateSize.padding;
        designerInstanceRef.current.updateTemplate(template);
      }
    }
    setIsDialogOpen(false);
  };

  const destroyDesigner = useCallback(() => {
    if (designerInstanceRef.current) {
      try {
        designerInstanceRef.current.destroy();
      } catch (error) {
        console.error('Error destroying designer:', error);
      }
      designerInstanceRef.current = null;
    }
  }, []);

  const buildDesigner = useCallback(async () => {
    if (!designerRef.current) return;

    let template: Template = getTemplateByPreset(templatePreset);
    try {
      const templateString = localStorage.getItem('template');
      if (templateString) {
        setTemplatePreset(customTemplatePresetKey);
      }

      const templateJson = templateString
        ? JSON.parse(templateString)
        : getTemplateByPreset(templatePreset);
      checkTemplate(templateJson);
      template = templateJson as Template;
    } catch {
      localStorage.removeItem('template');
    }

    try {
      const font = await getFontsData();

      destroyDesigner();

      designerInstanceRef.current = new Designer({
        domContainer: designerRef.current,
        template,

        plugins: getPlugins(),
        options: {
          font,
          lang,
          labels: {
            clear: '🗑️',
          },
          theme: {
            token: {
              colorPrimary: '#red',
            },
          },
        },
      });

      designerInstanceRef.current.onSaveTemplate(onSaveTemplate);
      designerInstanceRef.current.onChangeTemplate(() => {
        setTemplatePreset(templatePreset);
      });
    } catch (error) {
      console.error('Error building designer:', error);
      setIsDialogLoadingOpen(false);
    }
  }, [lang, templatePreset, destroyDesigner, onSaveTemplate]);

  useEffect(() => {
    buildDesigner();
    return destroyDesigner;
  }, [buildDesigner, destroyDesigner]);

  const onChangeBasePDF = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target && e.target.files) {
        readFile(e.target.files[0], 'dataURL').then(async (basePdf) => {
          if (designerInstanceRef.current) {
            designerInstanceRef.current.updateTemplate(
              Object.assign(
                cloneDeep(designerInstanceRef.current.getTemplate()),
                {
                  basePdf,
                }
              )
            );
          }
        });
      }
    },
    []
  );

  const onDownloadTemplate = useCallback(() => {
    if (designerInstanceRef.current) {
      downloadJsonFile(designerInstanceRef.current.getTemplate(), 'template');
      console.log(designerInstanceRef.current.getTemplate().schemas);
    }
  }, []);

  const onChangeTemplatePresets = useCallback((value: string) => {
    setTemplatePreset(value);
    localStorage.setItem(
      'template',
      JSON.stringify(getTemplateByPreset(value))
    );
    localStorage.removeItem('template');
    localStorage.setItem('templatePreset', value);
  }, []);

  const generateTemplateJSON = useCallback(() => {
    if (designerInstanceRef.current) {
      const template: Template = designerInstanceRef.current.getTemplate();

      const inputs: TemplateInput[] = template.schemas.reduce(
        (acc: TemplateInput[], schema) => {
          if (!schema) return acc;

          const schemaInputs: TemplateInput = {};

          Object.entries(schema).forEach(([key, field]) => {
            if (
              field &&
              typeof field === 'object' &&
              'type' in field &&
              !field.type.startsWith('readOnly')
            ) {
              if (field.type === 'table' && Array.isArray(field.content)) {
                schemaInputs[key] = field.content;
              } else if (typeof field.content === 'string') {
                schemaInputs[key] = field.content;
              }
            }
          });

          if (Object.keys(schemaInputs).length > 0) {
            acc.push(schemaInputs);
          }

          return acc;
        },
        []
      );

      setGeneratedInputs(inputs);

      const templateJSON = {
        templateName: templateName, // ここで直接stateの値を使用
        inputs: inputs,
      };

      const blob = new Blob([JSON.stringify(templateJSON, null, 2)], {
        type: 'application/json',
      });
      saveAs(blob, 'template_inputs.json');

      toast({
        variant: 'success',
        title: 'Template JSON generated!',
        description: 'The JSON file has been downloaded.',
      });

      console.log('Generated Template JSON:', templateJSON);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error generating Template JSON',
        description: 'Designer instance not found.',
      });
    }
  }, [toast, templateName]); // templateNameをdependency arrayに追加

  const generateTemplateCode = useCallback(() => {
    if (designerInstanceRef.current) {
      const template: Template = designerInstanceRef.current.getTemplate();

      const inputs: TemplateInput[] = template.schemas.reduce(
        (acc: TemplateInput[], schema) => {
          if (!schema) return acc;

          const schemaInputs: TemplateInput = {};

          Object.entries(schema).forEach(([key, field]) => {
            if (
              field &&
              typeof field === 'object' &&
              'type' in field &&
              !field.type.startsWith('readOnly')
            ) {
              if (field.type === 'table' && Array.isArray(field.content)) {
                schemaInputs[key] = field.content;
              } else if (typeof field.content === 'string') {
                schemaInputs[key] = field.content;
              }
            }
          });

          if (Object.keys(schemaInputs).length > 0) {
            acc.push(schemaInputs);
          }

          return acc;
        },
        []
      );

      setGeneratedInputs(inputs);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error generating Template JSON',
        description: 'Designer instance not found.',
      });
    }
  }, [toast]);

  const saveTemplateToMongoDB = useCallback(async () => {
    if (designerInstanceRef.current) {
      const date = new Date();
      const template = designerInstanceRef.current.getTemplate();
      const templateName = prompt('テンプレート名を入力してください:');

      if (!templateName) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'テンプレート名が必要です。',
        });
        return;
      }

      try {
        const response = await fetch('/api/mongo-templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: templateName,
            data: template,
            updated_at: date.toISOString(),
          }),
        });

        if (response.ok) {
          toast({
            variant: 'success',
            title: 'Success',
            description: `テンプレート "${templateName}" が保存されました。`,
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Unknown error occurred');
        }
      } catch (error) {
        console.error('Error saving template to MongoDB:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `テンプレートの保存に失敗しました: ${error}`,
        });
      }
    }
  }, [toast]);

  const loadTemplateFromMongoDB = useCallback(async () => {
    const templateName = prompt('読み込むテンプレート名を入力してください:');
    if (!templateName) return;

    try {
      const response = await fetch(
        `/api/mongo-templates?name=${encodeURIComponent(templateName)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const templates = await response.json();
      const template = templates.find((t: any) => t.name === templateName);

      if (template && designerInstanceRef.current) {
        designerInstanceRef.current.updateTemplate(template.data);
        toast({
          variant: 'success',
          title: 'Success',
          description: `テンプレート "${templateName}" を読み込みました。`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `テンプレート "${templateName}" が見つかりません。`,
        });
      }
    } catch (error) {
      console.error('Error loading template from MongoDB:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `テンプレートの読み込みに失敗しました: ${error}`,
      });
    }
  }, [toast]);

  const loadTemplateButtonMongoDB = useCallback(
    async (name: string) => {
      setIsDialogLoadingOpen(true);

      if (!name) return;

      try {
        const response = await fetch(
          `/api/mongo-templates?name=${encodeURIComponent(name)}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const templates = await response.json();
        const template = templates.find((t: any) => t.name === name);

        if (template && designerInstanceRef.current) {
          designerInstanceRef.current.updateTemplate(template.data);
          setIsDialogLoadingOpen(false);
          toast({
            variant: 'success',
            title: 'Success',
            description: `テンプレート "${name}" を読み込みました。`,
          });
          setTemplateName(name);
        } else {
          setIsDialogLoadingOpen(false);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: `テンプレート "${name}" が見つかりません。`,
          });
        }
      } catch (error) {
        setIsDialogLoadingOpen(false);
        console.error('Error loading template from MongoDB:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `テンプレートの読み込みに失敗しました: ${error}`,
        });
      }
    },
    [toast]
  );

  const deleteTemplateFromMongoDB = useCallback(async () => {
    const templateName = prompt('削除するテンプレート名を入力してください:');
    if (!templateName) return;

    try {
      const response = await fetch(
        `/api/mongo-templates?name=${encodeURIComponent(templateName)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      toast({
        variant: 'success',
        title: 'Success',
        description: `テンプレート "${templateName}" が削除されました。`,
      });
    } catch (error) {
      console.error('Error deleting template from MongoDB:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `テンプレートの削除に失敗しました: ${error}`,
      });
    }
  }, [toast]);

  const generateTemplateInputs = useCallback(() => {
    if (designerInstanceRef.current) {
      const template: Template = designerInstanceRef.current.getTemplate();

      const inputs: TemplateInput[] = template.schemas.map((schema) => {
        if (!schema) return {};

        const schemaInputs: TemplateInput = {};

        Object.entries(schema).forEach(([key, field]) => {
          if (
            field &&
            typeof field === 'object' &&
            'type' in field &&
            !field.type.startsWith('readOnly')
          ) {
            if (field.type === 'table' && Array.isArray(field.content)) {
              schemaInputs[key] = { value: field.content, include: true };
            } else if (typeof field.content === 'string') {
              schemaInputs[key] = { value: field.content, include: true };
            }
          }
        });

        return schemaInputs;
      });

      setGeneratedInputs(inputs);
      return inputs;
    }
    return [];
  }, []);

  const handleDynamicFormSubmit = useCallback((formData: any) => {
    // フォームデータを処理し、必要に応じてdesignerInstanceRefを更新
    if (designerInstanceRef.current) {
      const template = designerInstanceRef.current.getTemplate();
      // formDataを使用してtemplateを更新
      // 例: template.schemas = formData.inputs;
      designerInstanceRef.current.updateTemplate(template);
    }
    setShowDynamicForm(false);
  }, []);
  const generateTemplateFormJSON = useCallback(() => {
    const inputs = generateTemplateInputs();

    const templateJSON = {
      templateName: templateName,
      inputs: inputs,
    };

    // const blob = new Blob([JSON.stringify(templateJSON, null, 2)], {
    //   type: 'application/json',
    // });
    // saveAs(blob, 'template_inputs.json');

    toast({
      variant: 'success',
      title: 'Template JSON generated!',
      description: 'The JSON file has been downloaded.',
    });

    console.log('Generated Template JSON:', templateJSON);
  }, [generateTemplateInputs, templateName, toast]);

  // Update the handleDynamicFormOpen function
  const handleDynamicFormOpen = useCallback(() => {
    const inputs = generateTemplateInputs();
    setGeneratedInputs(inputs);
    setShowDynamicForm(true);
  }, [generateTemplateInputs]);

  return (
    <div className='w-full'>
      <header className='flex items-center justify-center p-4 h-32  gap-3'>
        <Dialog open={showDynamicForm} onOpenChange={setShowDynamicForm}>
          <DialogContent className='max-w-3xl max-h-xl'>
            <DialogHeader>
              <DialogTitle>テンプレート入力データ編集</DialogTitle>
            </DialogHeader>
            <DynamicTemplateForm
              initialData={generatedInputs}
              onSubmit={handleDynamicFormSubmit}
            />
          </DialogContent>
        </Dialog>
        <div className='grid w-full max-w-sm items-center gap-3'>
          <Input
            type='text'
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder='テンプレート名'
            value={templateName}
          />

          <Select
            onValueChange={onChangeTemplatePresets}
            value={templatePreset}
          >
            <SelectTrigger className=''>
              <SelectValue placeholder='テンプレート選択' />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectLabel>テンプレート選択</SelectLabel>
                {templatePresets.map((preset) => (
                  <SelectItem key={preset.key} value={preset.key}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='flex flex-col gap-2'>
          <div className='flex  w-full max-w-sm items-center gap-3'>
            <Label htmlFor='loadTemplate'>
              <BotMessageSquare className='h-5 w-5 text-green-600' />
            </Label>

            <Input
              type='file'
              accept='application/pdf'
              placeholder='Base PDF'
              onChange={onChangeBasePDF}
            />
          </div>
          <div className='flex w-full max-w-sm items-center gap-3'>
            <Label htmlFor='loadTemplate'>
              <BotIcon className='h-5 w-5 text-orange-600' />
            </Label>

            <Input
              type='file'
              accept='application/json'
              placeholder='Load Template'
              onChange={(e) => {
                handleLoadTemplate(e, designerInstanceRef.current);
                setTemplatePreset(templatePreset);
              }}
            />
          </div>
        </div>
        <div className='flex gap-3 pt-6'>
          <div className='grid grid-cols-5 gap-1.5 '>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={onDownloadTemplate} className='size-sm '>
                    <Download className='h-5 w-5 text-yellow-400 font-bold' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>テンプレートダウンロード</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Dialog open={showPdfCode} onOpenChange={setShowPdfCode}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => generateTemplateCode()}
                        className='size-sm '
                      >
                        <Code2 className='h-5 w-5 text-fuchsia-600 font-bold' />
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>コード生成</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DialogContent className='max-w-7xl '>
                <PdfCodeDisplay
                  inputs={generatedInputs}
                  templateName={templateName}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button className='size-sm '>
                        <RulerIcon className='h-5 w-5 text-yellow-400 font-bolds' />
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>サイズ・余白</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DialogContent className='max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>サイズ・余白</DialogTitle>
                </DialogHeader>
                <div className='flex flex-col gap-4 py-4 items-center justify-center '>
                  <div className='flex flex-col w-full mx-2  gap-4'>
                    <Label htmlFor='width'>幅 (mm)</Label>
                    <Input
                      id='width'
                      name='width'
                      type='number'
                      value={templateSize.width}
                      onChange={handleSizeChange}
                      className='col-span-3'
                    />
                  </div>
                  <div className='flex flex-col w-full mx-2  gap-4'>
                    <Label htmlFor='height'>高さ (mm)</Label>
                    <Input
                      id='height'
                      name='height'
                      type='number'
                      value={templateSize.height}
                      onChange={handleSizeChange}
                      className='col-span-3'
                    />
                  </div>
                  {['高さ', '右', '下', '左'].map((side, index) => (
                    <div key={side} className='flex flex-col w-full mx-2 gap-4'>
                      <Label
                        htmlFor={`padding-${side.toLowerCase()}`}
                      >{`余白 ${side}`}</Label>
                      <Input
                        id={`padding-${side.toLowerCase()}`}
                        type='number'
                        value={templateSize.padding[index]}
                        onChange={(e) =>
                          handlePaddingChange(index, e.target.value)
                        }
                        className='col-span-3'
                      />
                    </div>
                  ))}
                </div>
                <Button onClick={applyTemplateSize}>設定変更</Button>
                <DialogDescription>
                  A4 = 幅:210　高さ:297 / A3 = 幅:297　高さ:420
                </DialogDescription>
              </DialogContent>
            </Dialog>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={saveTemplateToMongoDB} className='size-sm '>
                    <SaveIcon className=' h-5 w-5 text-fuchsia-600 font-bold' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>テンプレート保存</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={loadTemplateFromMongoDB}
                    className='size-sm flex items-center justify-center'
                  >
                    <ImportIcon className=' h-5 w-5 text-yellow-400 font-bold' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>テンプレート読込</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={deleteTemplateFromMongoDB}
                    className='size-xs '
                  >
                    <Trash2 className=' h-5 w-5 text-yellow-400 font-bold' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>テンプレート削除</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TemplateList
              templates={templates}
              onLoadTemplate={loadTemplateButtonMongoDB}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => onSaveTemplate()} className='size-sm '>
                    <FileJson2 className=' h-5 w-5 text-yellow-400 font-bold' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>templateJson</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={generateTemplateJSON} className='size-sm '>
                    <CurlyBraces className=' h-5 w-5 text-fuchsia-600 font-bold' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>curl用JSON</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => generatePDF(designerInstanceRef.current)}
                    className='size-sm '
                  >
                    <FileText className=' h-5 w-5 text-yellow-400 font-bold' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>PDF生成</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button onClick={handleDynamicFormOpen} className='size-sm'>
            <TextCursorInput className='h-5 w-5 text-blue-600' />
          </Button>
        </div>
        <Dialog
          open={isDialogLoadingOpen}
          onOpenChange={setIsDialogLoadingOpen}
        >
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent className='flex items-center justify-center gap-4  '>
            <Loader2 className='mr-2 h-20  w-20 animate-spin' />
            <DialogDescription>
              テンプレートを読み込んでいます...
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </header>
      <Suspense fallback={<div>Loading...</div>}>
        <div
          ref={designerRef}
          style={{ width: '100%', height: `calc(100vh - ${headerHeight}px)` }}
        />
      </Suspense>
    </div>
  );
}

export default DesignView;
