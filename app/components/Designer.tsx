'use client';

import { useRef, useState, useEffect } from 'react';
import { cloneDeep, Template, checkTemplate, Lang } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import {
  getFontsData,
  getTemplatePresets,
  getTemplateByPreset,
  readFile,
  getPlugins,
  handleLoadTemplate,
  generatePDF,
  downloadJsonFile,
  translations,
} from '../helper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AITemplateGenerator from './AITemplateGenerator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const headerHeight = 80;

const initialTemplatePresetKey = 'invoice';
const customTemplatePresetKey = 'custom';

const templatePresets = getTemplatePresets();

function DesinerApp() {
  const designerRef = useRef<HTMLDivElement | null>(null);
  const designer = useRef<Designer | null>(null);
  const [lang, setLang] = useState<Lang>('en');
  const [templatePreset, setTemplatePreset] = useState<string>(
    initialTemplatePresetKey
  );
  const [prevDesignerRef, setPrevDesignerRef] = useState<HTMLDivElement | null>(
    null
  );
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  useEffect(() => {
    const storedTemplatePreset = localStorage.getItem('templatePreset');
    if (storedTemplatePreset) {
      setTemplatePreset(storedTemplatePreset);
    }
  }, []);

  const buildDesigner = () => {
    let template: Template = getTemplateByPreset(
      localStorage.getItem('templatePreset') || ''
    );
    try {
      const templateString = localStorage.getItem('template');
      if (templateString) {
        setTemplatePreset(customTemplatePresetKey);
      }

      const templateJson = templateString
        ? JSON.parse(templateString)
        : getTemplateByPreset(localStorage.getItem('templatePreset') || '');
      checkTemplate(templateJson);
      template = templateJson as Template;
    } catch {
      localStorage.removeItem('template');
    }

    getFontsData().then((font) => {
      if (designerRef.current) {
        designer.current = new Designer({
          domContainer: designerRef.current,
          template,
          options: {
            font,
            lang,
            labels: {
              clear: '🗑️', // Add custom labels to consume them in your own plugins
            },
            theme: {
              token: {
                colorPrimary: '#25c2a0',
              },
            },
            icons: {
              multiVariableText:
                '<svg fill="#000000" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.643,13.072,17.414,2.3a1.027,1.027,0,0,1,1.452,0L20.7,4.134a1.027,1.027,0,0,1,0,1.452L9.928,16.357,5,18ZM21,20H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Z"/></svg>',
            },
          },
          plugins: getPlugins(),
        });
        designer.current.onSaveTemplate(onSaveTemplate);
        designer.current.onChangeTemplate(() => {
          setTemplatePreset(customTemplatePresetKey);
        });
      }
    });
  };

  const onChangeBasePDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      readFile(e.target.files[0], 'dataURL').then(async (basePdf) => {
        if (designer.current) {
          designer.current.updateTemplate(
            Object.assign(cloneDeep(designer.current.getTemplate()), {
              basePdf,
            })
          );
        }
      });
    }
  };

  const onChangePadding = () => {
    if (designerRef.current && designer.current) {
      const currentTemplate = designer.current.getTemplate();
      const updatedTemplate = {
        ...currentTemplate,
        options: {
          ...(currentTemplate.options || {}),
          padding: [10, 10, 10, 10],
        },
        schemas: currentTemplate.schemas,
        basePdf: currentTemplate.basePdf,
      };
      designer.current.updateTemplate(updatedTemplate);
    }
  };

  const onDownloadTemplate = () => {
    if (designer.current) {
      downloadJsonFile(designer.current.getTemplate(), 'template');
      console.log(designer.current.getTemplate());
    }
  };

  const onSaveTemplate = (template?: Template) => {
    if (designer.current) {
      localStorage.setItem(
        'template',
        JSON.stringify(template || designer.current.getTemplate())
      );
      alert('保存しました！');
    }
  };

  const onChangeTemplatePresets = (value: string) => {
    setTemplatePreset(value);
    localStorage.setItem(
      'template',
      JSON.stringify(
        getTemplateByPreset(localStorage.getItem('templatePreset') || '')
      )
    );
    localStorage.removeItem('template');
    localStorage.setItem('templatePreset', value);
    buildDesigner();
  };

  const handleApplyAITemplate = (template: Template) => {
    if (designer.current) {
      designer.current.updateTemplate(template);
      setTemplatePreset(customTemplatePresetKey);
      setIsAIDialogOpen(false);
    }
  };

  if (designerRef.current !== prevDesignerRef) {
    if (prevDesignerRef && designer.current) {
      designer.current.destroy();
    }
    buildDesigner();
    setPrevDesignerRef(designerRef.current);
  }

  return (
    <div className='w-full min-h-svh'>
      <header className='p-4 border-b flex flex-wrap items-center gap-3'>
        <strong className='text-lg mr-2'>Designer</strong>

        <div className='flex items-center gap-2'>
          <Label className='mb-0'>
            テンプレート:
            <Select
              onValueChange={onChangeTemplatePresets}
              value={templatePreset}
            >
              <SelectTrigger className='w-[180px] ml-2'>
                <SelectValue placeholder='テンプレートを選択' />
              </SelectTrigger>
              <SelectContent>
                {templatePresets.map((preset) => (
                  <SelectItem
                    key={preset.key}
                    disabled={preset.key === customTemplatePresetKey}
                    value={preset.key}
                  >
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>

          <Label className='mb-0 ml-4'>
            言語:
            <Select
              onValueChange={(value) => {
                setLang(value as Lang);
                if (designer.current) {
                  designer.current.updateOptions({
                    lang: value as Lang,
                  });
                }
              }}
              value={lang}
            >
              <SelectTrigger className='w-[120px] ml-2'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {translations.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
        </div>

        <div className='flex items-center gap-2 ml-auto'>
          <div className='flex items-center gap-2'>
            <Label className='mb-0'>
              <Button variant='outline' size='sm' asChild>
                <label>
                  ベースPDF変更
                  <Input
                    type='file'
                    accept='application/pdf'
                    onChange={onChangeBasePDF}
                    className='hidden'
                  />
                </label>
              </Button>
            </Label>

            <Label className='mb-0'>
              <Button variant='outline' size='sm' asChild>
                <label>
                  テンプレート読込
                  <Input
                    type='file'
                    accept='application/json'
                    onChange={(e) => {
                      handleLoadTemplate(e, designer.current);
                      setTemplatePreset(customTemplatePresetKey);
                    }}
                    className='hidden'
                  />
                </label>
              </Button>
            </Label>
          </div>

          <div className='flex items-center gap-2 ml-2'>
            <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm'>
                  AI生成
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[625px]'>
                <DialogHeader>
                  <DialogTitle>AI帳票テンプレート生成</DialogTitle>
                </DialogHeader>
                <AITemplateGenerator
                  onApplyTemplate={handleApplyAITemplate}
                  currentTemplate={
                    designer.current
                      ? designer.current.getTemplate()
                      : undefined
                  }
                />
              </DialogContent>
            </Dialog>

            <Button variant='outline' size='sm' onClick={onDownloadTemplate}>
              テンプレート保存
            </Button>

            <Button
              variant='default'
              size='sm'
              onClick={() => generatePDF(designer.current)}
            >
              PDF生成
            </Button>
          </div>
        </div>
      </header>
      <div
        ref={designerRef}
        style={{ width: '100%', height: `calc(100vh - ${headerHeight}px)` }}
      >
        <span />
      </div>
    </div>
  );
}

export default DesinerApp;
