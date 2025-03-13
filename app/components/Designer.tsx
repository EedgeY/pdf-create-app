'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { checkTemplate, cloneDeep, Lang, Template } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { Download, FileText, Save, Sparkles, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  downloadJsonFile,
  generatePDF,
  getFontsData,
  getPlugins,
  getTemplateByPreset,
  getTemplatePresets,
  readFile,
} from '../helper';
import { AITemplateGenerator } from './AITemplateGenerator';
import { FloatingActionButtons } from './FloatingActionButtons';
import MarkdownViewer from './MarkdownViewer';
import { svgToPngDataURL } from '../plugins';
import { useImageStore } from '../store/imageStore';
import ReactCodeEditor from './ReactCodeEditor';

const headerHeight = 80;

const initialTemplatePresetKey = 'invoice';
const customTemplatePresetKey = 'custom';

const templatePresets = getTemplatePresets();

function PDFDesignerApp() {
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
  const [isMarkdownDialogOpen, setIsMarkdownDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [isReactEditorOpen, setIsReactEditorOpen] = useState(false);

  // 状態管理ストアから画像データを取得
  const { generatedImage, clearGeneratedImage } = useImageStore();

  useEffect(() => {
    const storedTemplatePreset = localStorage.getItem('templatePreset');
    if (storedTemplatePreset) {
      setTemplatePreset(storedTemplatePreset);
    }
  }, []);

  // SVG画像をデザイナーに追加する処理
  useEffect(() => {
    if (generatedImage && designer.current) {
      console.log('生成された画像をデザイナーに追加します');

      try {
        // 元のhandleAddElementをここで直接使用せず、少し遅延させて実行
        setTimeout(() => {
          // デザイナーが初期化されている場合のみ実行
          if (designer.current) {
            try {
              // スキーマに合った要素を作成して追加
              const element = {
                type: 'image', // スキーマタイプ
                content: generatedImage, // 画像コンテンツ
                width: 150,
                height: 100,
              };

              handleAddElement(element);
              console.log('要素が正常に追加されました');
            } catch (innerError) {
              console.error('要素追加中のエラー:', innerError);
            }
          }
        }, 500);

        // 使用後はストアをクリア
        clearGeneratedImage();
      } catch (error) {
        console.error('デザイナーに要素を追加できませんでした:', error);
      }
    }
  }, [generatedImage]);

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

  // 新しい要素を追加するハンドラ
  const handleAddElement = (elementOrElements: any | any[]) => {
    if (designer.current) {
      try {
        const currentTemplate = designer.current.getTemplate();
        const currentSchemas = currentTemplate.schemas;

        // 現在のスキーマの最初のページに新しい要素を追加
        if (currentSchemas.length > 0) {
          const updatedSchemas = [...currentSchemas];

          // 要素が配列（複数要素）の場合
          if (Array.isArray(elementOrElements)) {
            updatedSchemas[0] = [...updatedSchemas[0], ...elementOrElements];
            console.log(`${elementOrElements.length}個の要素が追加されました`);
          } else {
            // 単一要素の場合
            updatedSchemas[0] = [...updatedSchemas[0], elementOrElements];
            console.log('要素が追加されました:', elementOrElements);
          }

          // テンプレートを更新
          const updatedTemplate = {
            ...currentTemplate,
            schemas: updatedSchemas,
          };

          designer.current.updateTemplate(updatedTemplate);
          setTemplatePreset(customTemplatePresetKey);
        }
      } catch (error) {
        console.error('要素の追加中にエラーが発生しました:', error);
        alert('要素の追加中にエラーが発生しました');
      }
    }
  };

  // テーブル要素を追加する関数
  const handleAddTable = () => {
    const tableElement = {
      name: 'sample_table',
      type: 'table',
      position: { x: 20, y: 20 },
      width: 160,
      height: 80,
      content: '[[null,null,null],[null,null,null],[null,null,null]]',
      showHead: true,
      head: ['項目', '単価', '数量'],
      headWidthPercentages: [33.3, 33.3, 33.4],
      fontName: 'NotoSansJP-Regular',
      tableStyles: {
        borderWidth: 1,
        borderColor: '#000000',
      },
      headStyles: {
        fontName: 'NotoSansJP-Regular',
        fontSize: 10,
        alignment: 'center',
        verticalAlignment: 'middle',
        fontColor: '#000000',
        backgroundColor: '#f5f5f5',
        lineHeight: 1.2,
        characterSpacing: 0,
        borderWidth: {
          top: 1,
          right: 1,
          bottom: 1,
          left: 1,
        },
        padding: {
          top: 2,
          right: 2,
          bottom: 2,
          left: 2,
        },
      },
      bodyStyles: {
        fontName: 'NotoSansJP-Regular',
        fontSize: 10,
        alignment: 'left',
        verticalAlignment: 'middle',
        fontColor: '#000000',
        backgroundColor: '#FFFFFF',
        lineHeight: 1.2,
        characterSpacing: 0,
        borderWidth: {
          top: 0,
          right: 1,
          bottom: 1,
          left: 1,
        },
        padding: {
          top: 2,
          right: 2,
          bottom: 2,
          left: 2,
        },
      },
      columnStyles: {
        alignment: {
          '0': 'left',
          '1': 'right',
          '2': 'center',
        },
      },
    };

    handleAddElement(tableElement);
  };

  // マークダウンビューアを開くハンドラ
  const handleOpenMarkdownView = () => {
    if (designer.current) {
      const template = designer.current.getTemplate();
      console.log('マークダウンビューアに渡すテンプレート:', template);
      setCurrentTemplate(template);
      setIsMarkdownDialogOpen(true);
    } else {
      console.error('デザイナーがまだ初期化されていません');
    }
  };

  // マークダウンから変換されたテンプレート要素を適用するハンドラ
  const handleApplyMarkdownTemplate = (elements: any[]) => {
    try {
      if (designer.current) {
        const currentTemplate = designer.current.getTemplate();
        const currentSchemas = [...currentTemplate.schemas];

        // 最初のページのスキーマを取得（存在しない場合は作成）
        if (currentSchemas.length === 0) {
          currentSchemas.push([] as any);
        }

        // 新しい要素をページに追加
        const newElements: Record<string, any> = {};
        elements.forEach((element) => {
          // 一意のIDを生成
          const elementId = `md-${
            element.name || 'element'
          }-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          // 要素を追加
          newElements[elementId] = element;
        });

        // スキーマの最初のページを更新
        if (Array.isArray(currentSchemas[0])) {
          // 配列の場合は配列形式に変換して代入
          currentSchemas[0] = Object.values(newElements) as any;
        } else {
          // オブジェクトの場合は既存のオブジェクトに追加
          currentSchemas[0] = {
            ...(currentSchemas[0] as any),
            ...newElements,
          } as any;
        }

        // テンプレートを更新
        const updatedTemplate = {
          ...currentTemplate,
          schemas: currentSchemas,
        };

        designer.current.updateTemplate(updatedTemplate);
        setCurrentTemplate(updatedTemplate);
        setIsMarkdownDialogOpen(false);

        // AIを使ってレイアウトを最適化
        optimizeLayoutWithAI(updatedTemplate);
      }
    } catch (error) {
      console.error('マークダウンテンプレート適用エラー:', error);
    }
  };

  // AIを使ってレイアウトを最適化する関数
  const optimizeLayoutWithAI = async (template: Template) => {
    try {
      // 現在のすべての要素を収集
      const allElements: any[] = [];

      template.schemas.forEach((schema) => {
        if (Array.isArray(schema)) {
          schema.forEach((element) => {
            if (element) allElements.push(element);
          });
        } else {
          Object.values(schema).forEach((element) => {
            if (element) allElements.push(element);
          });
        }
      });

      // AIによるレイアウト最適化APIを呼び出す
      const response = await fetch('/api/openrouter/generate-layout-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'PDFの要素を整えて、読みやすく美しいレイアウトにしてください',
          model: 'openai/gpt-3.5-turbo',
          currentElements: allElements,
          pageSize: { width: 210, height: 297 }, // A4サイズ
          layoutOptions: {
            spacing: 'comfortable',
            autoSize: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const optimizedElements = data.optimizedElements || [];

      if (optimizedElements.length > 0 && designer.current) {
        // 最適化された要素でテンプレートを更新
        const currentTemplate = designer.current.getTemplate();
        const currentSchemas = [...currentTemplate.schemas];

        // 最初のページのスキーマを更新
        if (currentSchemas.length === 0) {
          currentSchemas.push([] as any);
        }

        // 新しいスキーマを作成
        const newElements: Record<string, any> = {};

        // 最適化された要素を追加
        optimizedElements.forEach((element: any, index: number) => {
          const elementId = `optimized-${element.name || 'element'}-${index}`;
          newElements[elementId] = element;
        });

        // スキーマを更新
        if (Array.isArray(currentSchemas[0])) {
          // 配列の場合は配列形式に変換
          currentSchemas[0] = Object.values(newElements) as any;
        } else {
          // オブジェクトの場合は新しいオブジェクトで置き換え
          currentSchemas[0] = newElements as any;
        }

        // テンプレートを更新
        const updatedTemplate = {
          ...currentTemplate,
          schemas: currentSchemas,
        };

        designer.current.updateTemplate(updatedTemplate);
      }
    } catch (error) {
      console.error('レイアウト最適化エラー:', error);
    }
  };

  // ReactCodeEditorを開くハンドラ
  const handleOpenReactEditor = () => {
    setIsReactEditorOpen(true);
  };

  const handleReactSvgGenerate = async (svgElement: SVGElement) => {
    try {
      const dataUrl = await svgToPngDataURL(svgElement);
      // 生成された画像データをテンプレートに追加
      if (designer.current) {
        const currentTemplate = designer.current.getTemplate();
        const currentSchemas = [...currentTemplate.schemas];

        // 最初のページのスキーマを取得（存在しない場合は作成）
        if (currentSchemas.length === 0) {
          currentSchemas.push([] as any);
        }

        // 画像要素を追加
        const imageElement = {
          name: `react-image-${Date.now()}`,
          type: 'image',
          content: dataUrl,
          position: { x: 50, y: 50 },
          width: 150,
          height: 100,
        };

        // 最初のページに要素を追加
        if (Array.isArray(currentSchemas[0])) {
          currentSchemas[0] = [...currentSchemas[0], imageElement];
        } else {
          currentSchemas[0] = [imageElement];
        }

        // テンプレートを更新
        designer.current.updateTemplate({
          ...currentTemplate,
          schemas: currentSchemas,
        });
      }
      setIsReactEditorOpen(false);
      return dataUrl;
    } catch (error) {
      console.error('SVG変換エラー:', error);
      throw error;
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
    <div className=' py-6'>
      <div className='mb-6 space-y-4'>
        <div className='flex flex-col sm:flex-row gap-4 justify-between'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
            <div className='space-y-2'>
              <Label htmlFor='template-preset' className='text-sm'>
                テンプレート
              </Label>
              <Select
                value={templatePreset}
                onValueChange={onChangeTemplatePresets}
              >
                <SelectTrigger id='template-preset' className='w-[200px]'>
                  <SelectValue placeholder='テンプレートを選択' />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(templatePresets).map((key) => (
                    <SelectItem key={key} value={key}>
                      {templatePresets[key as any].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='pdf-file' className='text-sm'>
                ベースPDF
              </Label>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-[200px] justify-start'
                  onClick={() => document.getElementById('pdf-file')?.click()}
                >
                  <Upload className='h-4 w-4 mr-2' />
                  PDFをアップロード
                </Button>
                <Input
                  id='pdf-file'
                  type='file'
                  className='hidden'
                  accept='application/pdf'
                  onChange={onChangeBasePDF}
                />
              </div>
            </div>
          </div>

          <div className='flex flex-wrap gap-2 items-end justify-end'>
            <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm'>
                  <Sparkles className='h-4 w-4 mr-2' />
                  AIで生成
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-3xl'>
                <DialogHeader>
                  <DialogTitle>AIテンプレート生成</DialogTitle>
                </DialogHeader>
                <AITemplateGenerator
                  onApplyTemplate={handleApplyAITemplate}
                  currentTemplate={designer.current?.getTemplate()}
                />
              </DialogContent>
            </Dialog>

            <Button
              variant='outline'
              size='sm'
              onClick={() => onSaveTemplate()}
            >
              <Save className='h-4 w-4 mr-2' />
              保存
            </Button>

            <Button variant='outline' size='sm' onClick={onDownloadTemplate}>
              <Download className='h-4 w-4 mr-2' />
              ダウンロード
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => generatePDF(designer.current)}
            >
              <FileText className='h-4 w-4 mr-2' />
              PDF生成
            </Button>

            <Button
              onClick={handleOpenMarkdownView}
              variant='outline'
              className='whitespace-nowrap'
            >
              マークダウン表示
            </Button>

            <Button size='sm' variant='outline' onClick={handleOpenReactEditor}>
              Reactエディタ
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={designerRef}
        style={{
          height: 'calc(100vh - 200px)',
          width: '100%',
        }}
      />

      <FloatingActionButtons
        onApplyElement={handleAddElement}
        designerRef={designerRef}
      />

      {/* マークダウンビューアダイアログ */}
      <Dialog
        open={isMarkdownDialogOpen}
        onOpenChange={setIsMarkdownDialogOpen}
      >
        <DialogContent className='max-w-5xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>マークダウン表示</DialogTitle>
          </DialogHeader>
          <div className='p-0 overflow-auto'>
            {currentTemplate ? (
              <MarkdownViewer
                template={currentTemplate}
                onApplyMarkdownTemplate={handleApplyMarkdownTemplate}
              />
            ) : (
              <div className='p-4 text-red-500'>
                テンプレートが読み込まれていません。デザイナーで要素を追加してから再試行してください。
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ReactCodeEditorダイアログ */}
      <ReactCodeEditor
        open={isReactEditorOpen}
        onOpenChange={setIsReactEditorOpen}
        onGenerateSvg={handleReactSvgGenerate}
      />
    </div>
  );
}

export default PDFDesignerApp;
