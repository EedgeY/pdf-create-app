'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Template, checkTemplate, Lang } from '@pdfme/common';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PdfCodeDisplay from './PdfCodeDisplay';
type SchemaInput = {
  [key: string]: string | string[][];
};

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

function DesignView() {
  const { toast } = useToast();
  const designerRef = useRef<HTMLDivElement | null>(null);
  const designerInstanceRef = useRef<Designer | null>(null);
  const [lang, setLang] = useState<Lang>('ja');
  const [templatePreset, setTemplatePreset] = useState<string>(
    initialTemplatePresetKey
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateSize, setTemplateSize] = useState<{
    width: number;
    height: number;
    padding: [number, number, number, number];
  }>({
    width: 210,
    height: 297,
    padding: [0, 0, 0, 0],
  });
  const [showPdfCode, setShowPdfCode] = useState(false); // PDF生成コードの表示を制御する状態
  const [generatedInputs, setGeneratedInputs] = useState<SchemaInput[]>([]);
  const [templateName, setTemplateName] = useState<string>('');
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
      setTemplateName('template6');

      const inputs: SchemaInput[] = template.schemas.reduce(
        (acc: SchemaInput[], schema) => {
          if (!schema) return acc;

          const schemaInputs: SchemaInput = {};

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
  }, [toast]);

  return (
    <div className='w-full'>
      <header className='flex items-center justify-between p-4 bg-gray-100 h-16'>
        <Select onValueChange={onChangeTemplatePresets} value={templatePreset}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select a preset' />
          </SelectTrigger>
          <SelectContent>
            {templatePresets.map((preset) => (
              <SelectItem key={preset.key} value={preset.key}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span style={{ margin: '0 1rem' }}>/</span>

        <Select
          value={lang}
          onValueChange={(value: Lang) => {
            setLang(value);
          }}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select a language' />
          </SelectTrigger>
          <SelectContent>
            {translations.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className=''>/</span>
        <label style={{ width: 180 }}>
          Change BasePDF
          <Input
            type='file'
            accept='application/pdf'
            onChange={onChangeBasePDF}
          />
        </label>
        <span style={{ margin: '0 1rem' }}>/</span>
        <label style={{ width: 180 }}>
          Load Template
          <input
            type='file'
            accept='application/json'
            onChange={(e) => {
              handleLoadTemplate(e, designerInstanceRef.current);
              setTemplatePreset(templatePreset);
            }}
          />
        </label>
        <div className='flex gap-3'>
          <Button onClick={onDownloadTemplate}>Download Template</Button>
          <Button onClick={() => setShowPdfCode(!showPdfCode)}>
            {showPdfCode ? 'Hide PDF Code' : 'Show PDF Code'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Change Size</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust Template Size</DialogTitle>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <label htmlFor='width'>Width (mm)</label>
                  <Input
                    id='width'
                    name='width'
                    type='number'
                    value={templateSize.width}
                    onChange={handleSizeChange}
                    className='col-span-3'
                  />
                </div>
                <div className='grid grid-cols-4 items-center gap-4'>
                  <label htmlFor='height'>Height (mm)</label>
                  <Input
                    id='height'
                    name='height'
                    type='number'
                    value={templateSize.height}
                    onChange={handleSizeChange}
                    className='col-span-3'
                  />
                </div>
                {['Top', 'Right', 'Bottom', 'Left'].map((side, index) => (
                  <div
                    key={side}
                    className='grid grid-cols-4 items-center gap-4'
                  >
                    <label
                      htmlFor={`padding-${side.toLowerCase()}`}
                    >{`Padding ${side}`}</label>
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
              <Button onClick={applyTemplateSize}>Apply Changes</Button>
            </DialogContent>
          </Dialog>

          <Button onClick={() => onSaveTemplate()}>Save Template</Button>
          <Button onClick={generateTemplateJSON}>Generate Template JSON</Button>

          <Button onClick={() => generatePDF(designerInstanceRef.current)}>
            Generate PDF
          </Button>
        </div>
      </header>
      <div
        ref={designerRef}
        style={{ width: '100%', height: `calc(100vh - ${headerHeight}px)` }}
      />
      {showPdfCode && (
        <PdfCodeDisplay inputs={generatedInputs} templateName={templateName} />
      )}
    </div>
  );
}

export default DesignView;
