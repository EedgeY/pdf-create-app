'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Template, checkTemplate, Lang } from '@pdfme/common';
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const headerHeight = 65;

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
        options: {
          font,
          lang,
          labels: {
            clear: '🗑️',
          },
          theme: {
            token: {
              colorPrimary: '#25c2a0',
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
      console.log(designerInstanceRef.current.getTemplate());
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

  return (
    <div className='w-full'>
      <header className='flex items-center justify-between p-4 bg-gray-100 h-16'>
        <Select onValueChange={onChangeTemplatePresets} value={templatePreset}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select a preset' />
          </SelectTrigger>
          <SelectContent>
            {templatePresets.map((preset) => (
              <SelectItem
                key={preset.key}
                value={preset.key}
                disabled={preset.key === customTemplatePresetKey}
              >
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

          <Button onClick={() => onSaveTemplate()}>Save Template</Button>

          <Button onClick={() => generatePDF(designerInstanceRef.current)}>
            Generate PDF
          </Button>
        </div>
      </header>
      <div
        ref={designerRef}
        style={{ width: '100%', height: `calc(100vh - ${headerHeight}px)` }}
      />
    </div>
  );
}

export default DesignView;
