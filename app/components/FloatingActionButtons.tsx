'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Type,
  Table2,
  FileText,
  Smartphone,
  CreditCard,
  Loader2,
  Palette,
  Image,
  LayoutGrid,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from '@/components/ui/select';
import { models } from '@/app/helper';
import { Switch } from '@/components/ui/switch';

// 一般的な用紙サイズ定義（単位: mm）
const PAPER_SIZES = {
  A4: { width: 210, height: 297, label: 'A4 (210×297mm)' },
  'A4-landscape': { width: 297, height: 210, label: 'A4 横向き (297×210mm)' },
  A3: { width: 297, height: 420, label: 'A3 (297×420mm)' },
  A5: { width: 148, height: 210, label: 'A5 (148×210mm)' },
  B5: { width: 176, height: 250, label: 'B5 (176×250mm)' },
  letter: { width: 216, height: 279, label: 'レター (216×279mm)' },
  postcard: { width: 100, height: 148, label: 'はがき (100×148mm)' },
  'business-card': { width: 91, height: 55, label: '名刺 (91×55mm)' },
};

// カラーパターン定義
const COLOR_PATTERNS = {
  default: {
    label: 'デフォルト',
    primary: '#000000',
    secondary: '#ffffff',
    accent: '#cccccc',
  },
  blue: {
    label: 'ブルー',
    primary: '#1a365d',
    secondary: '#ebf8ff',
    accent: '#3182ce',
  },
  green: {
    label: 'グリーン',
    primary: '#1c4532',
    secondary: '#f0fff4',
    accent: '#38a169',
  },
  red: {
    label: 'レッド',
    primary: '#63171b',
    secondary: '#fff5f5',
    accent: '#e53e3e',
  },
  purple: {
    label: 'パープル',
    primary: '#44337a',
    secondary: '#faf5ff',
    accent: '#805ad5',
  },
  orange: {
    label: 'オレンジ',
    primary: '#7b341e',
    secondary: '#fffaf0',
    accent: '#dd6b20',
  },
  teal: {
    label: 'ティール',
    primary: '#234e52',
    secondary: '#e6fffa',
    accent: '#38b2ac',
  },
  gray: {
    label: 'グレー',
    primary: '#1a202c',
    secondary: '#f7fafc',
    accent: '#718096',
  },
  corporate: {
    label: 'コーポレート',
    primary: '#2c5282',
    secondary: '#f8fafc',
    accent: '#4299e1',
  },
  elegant: {
    label: 'エレガント',
    primary: '#1a202c',
    secondary: '#fff8dc',
    accent: '#d69e2e',
  },
} as const;

type ColorPatternKey = keyof typeof COLOR_PATTERNS;
type PaperSizeKey = keyof typeof PAPER_SIZES;

// SVGアイコン定義
interface SvgIcon {
  id: string;
  name: string;
  path: string;
}

// SVGのデフォルトサイズ
const DEFAULT_SVG_SIZE = {
  width: 210,
  height: 297,
};

interface FloatingActionButtonsProps {
  onApplyElement: (element: any | any[]) => void;
  designerRef: React.MutableRefObject<any>;
}

export function FloatingActionButtons({
  onApplyElement,
  designerRef,
}: FloatingActionButtonsProps) {
  const [isTextPopoverOpen, setIsTextPopoverOpen] = useState(false);
  const [isTablePopoverOpen, setIsTablePopoverOpen] = useState(false);
  const [isSizePopoverOpen, setIsSizePopoverOpen] = useState(false);
  const [isSvgPopoverOpen, setIsSvgPopoverOpen] = useState(false);
  const [isV0PopoverOpen, setIsV0PopoverOpen] = useState(false);
  const [isLayoutEditPopoverOpen, setIsLayoutEditPopoverOpen] = useState(false);
  const [selectedPaperSize, setSelectedPaperSize] =
    useState<PaperSizeKey>('A4');
  const [svgIcons, setSvgIcons] = useState<SvgIcon[]>([]);
  const [isLoadingSvg, setIsLoadingSvg] = useState(false);

  // 要素生成用の状態
  const [textPrompt, setTextPrompt] = useState('');
  const [tablePrompt, setTablePrompt] = useState('');
  const [v0Prompt, setV0Prompt] = useState('');
  const [layoutEditPrompt, setLayoutEditPrompt] = useState('');
  const [selectedTextModel, setSelectedTextModel] = useState(models[2]);
  const [selectedTableModel, setSelectedTableModel] = useState(models[2]);
  const [selectedV0Model, setSelectedV0Model] = useState(models[2]);
  const [selectedLayoutEditModel, setSelectedLayoutEditModel] = useState(
    models[2]
  );
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isV0Loading, setIsV0Loading] = useState(false);
  const [isLayoutEditLoading, setIsLayoutEditLoading] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [v0Error, setV0Error] = useState<string | null>(null);
  const [layoutEditError, setLayoutEditError] = useState<string | null>(null);
  const [selectedTextColorPattern, setSelectedTextColorPattern] =
    useState<ColorPatternKey>('default');
  const [selectedTableColorPattern, setSelectedTableColorPattern] =
    useState<ColorPatternKey>('default');
  const [selectedV0ColorPattern, setSelectedV0ColorPattern] =
    useState<ColorPatternKey>('default');
  const [selectedLayoutEditColorPattern, setSelectedLayoutEditColorPattern] =
    useState<ColorPatternKey>('default');
  const [selectedLayoutPattern, setSelectedLayoutPattern] =
    useState('standard');
  const [elementSpacing, setElementSpacing] = useState('standard'); // 'dense', 'standard', 'wide'
  const [autoSizeElements, setAutoSizeElements] = useState(true);

  const { toast } = useToast();

  // SVGアイコンをロード
  useEffect(() => {
    const loadSvgIcons = async () => {
      try {
        setIsLoadingSvg(true);
        // アイコンの配列を拡張
        const icons: SvgIcon[] = [
          {
            id: '背景１',
            name: '１',
            path: '/images/icons/2.svg',
          },
          {
            id: '背景２',
            name: '２',
            path: '/images/icons/3.svg',
          },
        ];

        // デモ用に多くのアイコンを表示するために、同じアイコンを複数回追加します
        const duplicatedIcons = [...icons];
        for (let i = 0; i < 3; i++) {
          icons.forEach((icon) => {
            duplicatedIcons.push({
              ...icon,
              id: `${icon.id}-${i}`,
            });
          });
        }

        setSvgIcons(duplicatedIcons);
      } catch (error) {
        console.error('SVGアイコンの読み込みに失敗しました:', error);
      } finally {
        setIsLoadingSvg(false);
      }
    };

    loadSvgIcons();
  }, []);

  const handleApplyElement = (element: any | any[]) => {
    console.log('適用する要素:', element);

    // 要素を変換する関数
    const convertElement = (item: any) => {
      // テーブル要素の場合、フォーマットを変換
      if (item.type === 'table') {
        // サーバー側で適切に処理済みのため、最小限の変換のみ行う
        console.log(
          'テーブル要素をそのまま利用します:',
          JSON.stringify(item, null, 2)
        );
        return item;
      }

      // その他の要素は変更なしで返す
      return item;
    };

    // 要素が配列の場合は各要素を個別に適用
    if (Array.isArray(element)) {
      element.forEach((item) => {
        const convertedItem = convertElement(item);
        console.log('変換後の要素を適用:', convertedItem);
        onApplyElement(convertedItem);
      });
    } else {
      const convertedElement = convertElement(element);
      console.log('変換後の要素を適用:', convertedElement);
      onApplyElement(convertedElement);
    }

    setIsTextPopoverOpen(false);
    setIsTablePopoverOpen(false);
  };

  // テキスト要素生成
  const generateTextElement = async () => {
    if (!textPrompt.trim()) {
      setTextError('プロンプトを入力してください');
      return;
    }

    setIsTextLoading(true);
    setTextError(null);

    try {
      const response = await fetch('/api/openrouter/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: textPrompt,
          model: selectedTextModel,
          colorPattern: COLOR_PATTERNS[selectedTextColorPattern],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'テキスト要素生成に失敗しました');
      }

      const data = await response.json();
      console.log('APIレスポンス:', data);

      if (!data.elements) {
        throw new Error('テキスト要素を生成できませんでした');
      }

      // 要素を適用
      handleApplyElement(data.elements);

      toast({
        title: 'テキスト要素生成完了',
        description: `${data.model}モデルを使用してテキスト要素を生成しました`,
        variant: 'default',
      });

      // 生成後にプロンプトをクリア
      setTextPrompt('');
      setIsTextPopoverOpen(false);
    } catch (err: any) {
      console.error('テキスト要素生成エラー:', err);
      setTextError(
        err instanceof Error ? err.message : '不明なエラーが発生しました'
      );
      toast({
        title: 'エラー',
        description:
          err instanceof Error ? err.message : '不明なエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsTextLoading(false);
    }
  };

  // テーブル要素生成
  const generateTableElement = async () => {
    if (!tablePrompt.trim()) {
      setTableError('プロンプトを入力してください');
      return;
    }

    setIsTableLoading(true);
    setTableError(null);

    try {
      console.log('テーブル生成開始 - プロンプト:', tablePrompt);

      const response = await fetch('/api/openrouter/generate-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: tablePrompt,
          model: selectedTableModel,
          colorPattern: COLOR_PATTERNS[selectedTableColorPattern],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'テーブル要素生成に失敗しました');
      }

      const data = await response.json();
      console.log('API生のレスポンス:', JSON.stringify(data, null, 2));

      if (!data.element) {
        throw new Error('テーブル要素を生成できませんでした');
      }

      // ログファイルに詳細情報を保存
      try {
        const debugData = {
          timestamp: new Date().toISOString(),
          prompt: tablePrompt,
          originalElement: data.element,
        };

        // クライアントサイドの場合はコンソールに詳細をログ
        console.log('デバッグ情報:', JSON.stringify(debugData, null, 2));
      } catch (logErr) {
        console.error('デバッグログの保存に失敗:', logErr);
      }

      // 要素を適用
      handleApplyElement(data.element);

      toast({
        title: 'テーブル要素生成完了',
        description: `${data.model}モデルを使用してテーブル要素を生成しました`,
        variant: 'default',
      });

      // 生成後にプロンプトをクリア
      setTablePrompt('');
      setIsTablePopoverOpen(false);
    } catch (err: any) {
      console.error('テーブル要素生成エラー:', err);
      setTableError(
        err instanceof Error ? err.message : '不明なエラーが発生しました'
      );
      toast({
        title: 'エラー',
        description:
          err instanceof Error ? err.message : '不明なエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsTableLoading(false);
    }
  };

  const handleChangePaperSize = (sizeKey: PaperSizeKey) => {
    setSelectedPaperSize(sizeKey);
    const size = PAPER_SIZES[sizeKey];

    if (designerRef.current) {
      try {
        const currentTemplate = designerRef.current.getTemplate();

        // basePdfのサイズを更新
        const updatedTemplate = {
          ...currentTemplate,
          basePdf: {
            ...currentTemplate.basePdf,
            width: size.width,
            height: size.height,
          },
          // サイズプロパティも更新
          size: {
            width: size.width,
            height: size.height,
          },
        };

        // テンプレートを更新
        designerRef.current.updateTemplate(updatedTemplate);
        console.log(`用紙サイズを変更: ${size.label}`);
        setIsSizePopoverOpen(false);
      } catch (error) {
        console.error('サイズ変更エラー:', error);
        alert('PDFサイズの変更中にエラーが発生しました');
      }
    } else {
      console.error('designerRef.current が見つかりません');
    }
  };

  const getPaperSizeIcon = (sizeKey: PaperSizeKey) => {
    switch (sizeKey) {
      case 'A3':
      case 'A4':
      case 'A4-landscape':
      case 'B5':
      case 'A5':
      case 'letter':
        return <FileText className='h-4 w-4 mr-1' />;
      case 'postcard':
        return <Smartphone className='h-4 w-4 mr-1' />;
      case 'business-card':
        return <CreditCard className='h-4 w-4 mr-1' />;
      default:
        return <FileText className='h-4 w-4 mr-1' />;
    }
  };

  // SVGアイコンを適用
  const handleApplySvgIcon = async (icon: SvgIcon) => {
    try {
      // SVGファイルを読み込む
      const response = await fetch(icon.path);
      const svgContent = await response.text();

      // SVG要素を作成
      const element = {
        type: 'svg',
        name: icon.name,
        content: svgContent,
        position: { x: 0, y: 0 },
        width: DEFAULT_SVG_SIZE.width,
        height: DEFAULT_SVG_SIZE.height,
      };

      handleApplyElement(element);
      setIsSvgPopoverOpen(false);
    } catch (error) {
      console.error('SVGアイコンの適用に失敗しました:', error);
      toast({
        title: 'エラー',
        description: 'SVGアイコンの適用に失敗しました',
        variant: 'destructive',
      });
    }
  };

  const generateV0Element = async () => {
    if (!v0Prompt.trim()) {
      setV0Error('プロンプトを入力してください');
      return;
    }

    setIsV0Loading(true);
    setV0Error(null);

    try {
      const response = await fetch('/api/openrouter/generate-v0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: v0Prompt,
          model: selectedV0Model,
          colorPattern: COLOR_PATTERNS[selectedV0ColorPattern],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'v0要素生成に失敗しました');
      }

      const data = await response.json();
      console.log('APIレスポンス:', data);

      if (!data.elements) {
        throw new Error('v0要素を生成できませんでした');
      }

      // 要素を適用
      handleApplyElement(data.elements);

      toast({
        title: 'v0要素生成完了',
        description: `${data.model}モデルを使用してv0要素を生成しました`,
        variant: 'default',
      });

      // 生成後にプロンプトをクリア
      setV0Prompt('');
      setIsV0PopoverOpen(false);
    } catch (err: any) {
      console.error('v0要素生成エラー:', err);
      setV0Error(
        err instanceof Error ? err.message : '不明なエラーが発生しました'
      );
      toast({
        title: 'エラー',
        description:
          err instanceof Error ? err.message : '不明なエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsV0Loading(false);
    }
  };

  // レイアウト編集機能
  const generateLayoutEdit = async () => {
    if (!layoutEditPrompt.trim()) {
      setLayoutEditError('プロンプトを入力してください');
      return;
    }

    if (!designerRef.current) {
      setLayoutEditError('デザイナーの参照が見つかりません');
      return;
    }

    setIsLayoutEditLoading(true);
    setLayoutEditError(null);

    try {
      // デザイナーから現在のテンプレートを取得
      // 注: designer.current.getElements() は存在しないので、getTemplate()を使用
      const currentTemplate = designerRef.current.getTemplate?.();

      if (
        !currentTemplate ||
        !currentTemplate.schemas ||
        !currentTemplate.schemas[0]
      ) {
        throw new Error('現在のテンプレート情報が取得できません');
      }

      // 現在のテンプレートから要素を取得
      const currentElements = currentTemplate.schemas[0];

      // ページサイズ情報を取得
      const pageSize = {
        width: currentTemplate.basePdf
          ? 210
          : currentTemplate.options?.format?.width || 210, // デフォルトはA4サイズ
        height: currentTemplate.basePdf
          ? 297
          : currentTemplate.options?.format?.height || 297,
      };

      // 選択されたレイアウトパターンに基づくプロンプト拡張
      let layoutPatternPrompt = '';
      switch (selectedLayoutPattern) {
        case 'newspaper':
          layoutPatternPrompt =
            '新聞のようなレイアウトにしてください。メインのコンテンツを大きく表示し、サブコンテンツを周囲に配置してください。見出しを目立たせ、複数カラムのレイアウトを考慮してください。';
          break;
        case 'invoice':
          layoutPatternPrompt =
            '請求書/ビジネス文書のレイアウトにしてください。ヘッダーには企業情報を配置し、明確なセクション分けを行い、表組みを整えてください。数値は右揃えにし、重要な情報が目立つようにしてください。';
          break;
        case 'catalog':
          layoutPatternPrompt =
            'カタログやパンフレットのようなレイアウトにしてください。視覚的要素を強調し、情報を段組みにして整理してください。関連する要素をグループ化し、視線の流れを考慮したレイアウトにしてください。';
          break;
        case 'even':
          layoutPatternPrompt =
            '均等配置のレイアウトにしてください。要素間の間隔を均等にし、整列を美しく保ってください。バランスの取れた配置で、読みやすさを重視してください。';
          break;
        case 'grid':
          layoutPatternPrompt =
            'グリッドベースのレイアウトにしてください。厳密なグリッドシステムに基づいて要素を配置し、整然とした印象を与えるレイアウトにしてください。列と行を意識した配置を行ってください。';
          break;
        default:
          layoutPatternPrompt =
            '標準的な美しいレイアウトにしてください。要素のバランスを考慮し、読みやすさと視覚的な階層を意識してください。';
      }

      // 要素間隔の設定に関するプロンプト
      let spacingPrompt = '';
      switch (elementSpacing) {
        case 'dense':
          spacingPrompt =
            '要素間の間隔を最小限にし、密接に配置してください。要素同士が接触してもかまいません。コンパクトで情報密度の高いレイアウトを作成してください。';
          break;
        case 'wide':
          spacingPrompt =
            '要素間に十分な余白を設け、広々としたレイアウトにしてください。余白を効果的に使い、各要素が十分に呼吸できるようにしてください。';
          break;
        default:
          spacingPrompt =
            '要素間の間隔は標準的なバランスを保ってください。読みやすさを確保しつつ、全体の一貫性を維持してください。';
      }

      // 自動サイズ調整に関するプロンプト
      const autoSizePrompt = autoSizeElements
        ? '各要素の内容や文字数に応じて、要素のサイズを最適に調整してください。テキスト要素は内容が収まるよう適切な幅と高さを計算し、テーブル要素は行数や列数に応じたサイズにしてください。'
        : '';

      // OpenRouter API にリクエスト
      const response = await fetch('/api/openrouter/generate-layout-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `以下の既存デザインを見て、${layoutEditPrompt}\n\n${layoutPatternPrompt}\n\n${spacingPrompt}\n\n${autoSizePrompt}`,
          model: selectedLayoutEditModel,
          colorPattern: COLOR_PATTERNS[selectedLayoutEditColorPattern],
          currentElements: currentElements, // 現在の要素を渡す
          pageSize: pageSize, // ページサイズ情報を追加
          layoutOptions: {
            spacing: elementSpacing,
            autoSize: autoSizeElements,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'レイアウト編集に失敗しました');
      }

      const data = await response.json();
      console.log('レイアウト編集APIレスポンス:', data);

      if (!data.elements) {
        throw new Error('有効なレイアウト要素が生成されませんでした');
      }

      // テンプレートを更新（要素を置き換える）
      if (designerRef.current) {
        const updatedTemplate = {
          ...currentTemplate,
          schemas: [
            data.elements, // 新しい要素で置き換え
            ...currentTemplate.schemas.slice(1), // 2ページ目以降がある場合は維持
          ],
        };

        // テンプレートを更新
        designerRef.current.updateTemplate(updatedTemplate);
      }

      toast({
        title: 'レイアウト編集完了',
        description: `${data.model}モデルを使用してレイアウトを編集しました`,
        variant: 'default',
      });

      // プロンプトをクリアしてポップオーバーを閉じる
      setLayoutEditPrompt('');
      setIsLayoutEditPopoverOpen(false);
    } catch (err: any) {
      console.error('レイアウト編集エラー:', err);
      setLayoutEditError(
        err instanceof Error ? err.message : '不明なエラーが発生しました'
      );
      toast({
        title: 'エラー',
        description:
          err instanceof Error ? err.message : '不明なエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsLayoutEditLoading(false);
    }
  };

  // レイアウト編集ポップオーバーのUIを修正
  const layoutPatterns = [
    { value: 'standard', label: '標準レイアウト' },
    { value: 'newspaper', label: '新聞スタイル' },
    { value: 'invoice', label: '請求書/ビジネス' },
    { value: 'catalog', label: 'カタログ/パンフレット' },
    { value: 'even', label: '均等配置' },
    { value: 'grid', label: 'グリッドレイアウト' },
  ];

  // 要素間隔の選択肢
  const spacingOptions = [
    { value: 'dense', label: '密接配置' },
    { value: 'standard', label: '標準間隔' },
    { value: 'wide', label: '広め間隔' },
  ];

  return (
    <div className='fixed right-4 bottom-4 flex flex-col items-end space-y-2'>
      <Popover open={isTextPopoverOpen} onOpenChange={setIsTextPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            size='sm'
            className='rounded-full bg-white text-gray-700 hover:bg-gray-100 flex items-center gap-1'
          >
            <Type className='h-5 w-5' />
            <span>テキスト</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80' align='center'>
          <div className='space-y-3'>
            <h3 className='font-medium'>テキスト生成</h3>

            {textError && (
              <Alert variant='destructive' className='py-2'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription className='text-xs'>
                  {textError}
                </AlertDescription>
              </Alert>
            )}

            <div className='space-y-3'>
              <div>
                <Label htmlFor='text-model' className='text-xs'>
                  AIモデル
                </Label>
                <Select
                  value={selectedTextModel}
                  onValueChange={setSelectedTextModel}
                >
                  <SelectTrigger className='w-full h-8 text-xs'>
                    <SelectValue placeholder='AIモデルを選択' />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model} className='text-xs'>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='text-color-pattern' className='text-xs'>
                  カラーパターン
                </Label>
                <Select
                  value={selectedTextColorPattern}
                  onValueChange={(value) =>
                    setSelectedTextColorPattern(value as ColorPatternKey)
                  }
                >
                  <SelectTrigger className='w-full h-8 text-xs'>
                    <SelectValue placeholder='カラーパターンを選択' />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(COLOR_PATTERNS) as ColorPatternKey[]).map(
                      (key) => (
                        <SelectItem key={key} value={key} className='text-xs'>
                          <div className='flex items-center'>
                            <div className='flex mr-2'>
                              <div
                                className='w-3 h-3 rounded-full mr-1'
                                style={{
                                  backgroundColor: COLOR_PATTERNS[key].primary,
                                }}
                              />
                              <div
                                className='w-3 h-3 rounded-full mr-1'
                                style={{
                                  backgroundColor: COLOR_PATTERNS[key].accent,
                                }}
                              />
                              <div
                                className='w-3 h-3 rounded-full'
                                style={{
                                  backgroundColor:
                                    COLOR_PATTERNS[key].secondary,
                                }}
                              />
                            </div>
                            {COLOR_PATTERNS[key].label}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='text-prompt' className='text-xs'>
                  プロンプト
                </Label>
                <Textarea
                  id='text-prompt'
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  placeholder='生成したいテキスト要素の説明'
                  className='min-h-[80px] text-sm'
                />
              </div>

              <div className='flex justify-between gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setTextPrompt('')}
                  disabled={isTextLoading}
                >
                  クリア
                </Button>
                <Button
                  size='sm'
                  onClick={generateTextElement}
                  disabled={isTextLoading || !textPrompt.trim()}
                >
                  {isTextLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      生成中...
                    </>
                  ) : (
                    '生成'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={isTablePopoverOpen} onOpenChange={setIsTablePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            size='sm'
            className='rounded-full bg-white text-gray-700 hover:bg-gray-100 flex items-center gap-1'
          >
            <Table2 className='h-5 w-5' />
            <span>テーブル</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80' align='center'>
          <div className='space-y-3'>
            <h3 className='font-medium'>テーブル生成</h3>

            {tableError && (
              <Alert variant='destructive' className='py-2'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription className='text-xs'>
                  {tableError}
                </AlertDescription>
              </Alert>
            )}

            <div className='space-y-3'>
              <div>
                <Label htmlFor='table-model' className='text-xs'>
                  AIモデル
                </Label>
                <Select
                  value={selectedTableModel}
                  onValueChange={setSelectedTableModel}
                >
                  <SelectTrigger className='w-full h-8 text-xs'>
                    <SelectValue placeholder='AIモデルを選択' />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model} className='text-xs'>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='table-color-pattern' className='text-xs'>
                  カラーパターン
                </Label>
                <Select
                  value={selectedTableColorPattern}
                  onValueChange={(value) =>
                    setSelectedTableColorPattern(value as ColorPatternKey)
                  }
                >
                  <SelectTrigger className='w-full h-8 text-xs'>
                    <SelectValue placeholder='カラーパターンを選択' />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(COLOR_PATTERNS) as ColorPatternKey[]).map(
                      (key) => (
                        <SelectItem key={key} value={key} className='text-xs'>
                          <div className='flex items-center'>
                            <div className='flex mr-2'>
                              <div
                                className='w-3 h-3 rounded-full mr-1'
                                style={{
                                  backgroundColor: COLOR_PATTERNS[key].primary,
                                }}
                              />
                              <div
                                className='w-3 h-3 rounded-full mr-1'
                                style={{
                                  backgroundColor: COLOR_PATTERNS[key].accent,
                                }}
                              />
                              <div
                                className='w-3 h-3 rounded-full'
                                style={{
                                  backgroundColor:
                                    COLOR_PATTERNS[key].secondary,
                                }}
                              />
                            </div>
                            {COLOR_PATTERNS[key].label}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='table-prompt' className='text-xs'>
                  プロンプト
                </Label>
                <Textarea
                  id='table-prompt'
                  value={tablePrompt}
                  onChange={(e) => setTablePrompt(e.target.value)}
                  placeholder='生成したいテーブル要素の説明'
                  className='min-h-[80px] text-sm'
                />
              </div>

              <div className='flex justify-between gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setTablePrompt('')}
                  disabled={isTableLoading}
                >
                  クリア
                </Button>
                <Button
                  size='sm'
                  onClick={generateTableElement}
                  disabled={isTableLoading || !tablePrompt.trim()}
                >
                  {isTableLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      生成中...
                    </>
                  ) : (
                    '生成'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={isV0PopoverOpen} onOpenChange={setIsV0PopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            size='sm'
            className='rounded-full bg-white text-gray-700 hover:bg-gray-100 flex items-center gap-1'
          >
            <Table2 className='h-5 w-5' />
            <span>v0</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80' align='center'>
          <div className='space-y-3'>
            <h3 className='font-medium'>v0</h3>

            {v0Error && (
              <Alert variant='destructive' className='py-2'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription className='text-xs'>
                  {v0Error}
                </AlertDescription>
              </Alert>
            )}

            <div className='space-y-3'>
              <div>
                <Label htmlFor='table-model' className='text-xs'>
                  AIモデル
                </Label>
                <Select
                  value={selectedV0Model}
                  onValueChange={setSelectedV0Model}
                >
                  <SelectTrigger className='w-full h-8 text-xs'>
                    <SelectValue placeholder='AIモデルを選択' />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model} className='text-xs'>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='table-color-pattern' className='text-xs'>
                  カラーパターン
                </Label>
                <Select
                  value={selectedV0ColorPattern}
                  onValueChange={(value) =>
                    setSelectedV0ColorPattern(value as ColorPatternKey)
                  }
                >
                  <SelectTrigger className='w-full h-8 text-xs'>
                    <SelectValue placeholder='カラーパターンを選択' />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(COLOR_PATTERNS) as ColorPatternKey[]).map(
                      (key) => (
                        <SelectItem key={key} value={key} className='text-xs'>
                          <div className='flex items-center'>
                            <div className='flex mr-2'>
                              <div
                                className='w-3 h-3 rounded-full mr-1'
                                style={{
                                  backgroundColor: COLOR_PATTERNS[key].primary,
                                }}
                              />
                              <div
                                className='w-3 h-3 rounded-full mr-1'
                                style={{
                                  backgroundColor: COLOR_PATTERNS[key].accent,
                                }}
                              />
                              <div
                                className='w-3 h-3 rounded-full'
                                style={{
                                  backgroundColor:
                                    COLOR_PATTERNS[key].secondary,
                                }}
                              />
                            </div>
                            {COLOR_PATTERNS[key].label}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='table-prompt' className='text-xs'>
                  プロンプト
                </Label>
                <Textarea
                  id='table-prompt'
                  value={v0Prompt}
                  onChange={(e) => setV0Prompt(e.target.value)}
                  placeholder='生成したいテーブル要素の説明'
                  className='min-h-[80px] text-sm'
                />
              </div>

              <div className='flex justify-between gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setV0Prompt('')}
                  disabled={isV0Loading}
                >
                  クリア
                </Button>
                <Button
                  size='sm'
                  onClick={generateV0Element}
                  disabled={isV0Loading || !v0Prompt.trim()}
                >
                  {isV0Loading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      生成中...
                    </>
                  ) : (
                    '生成'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Popover open={isSvgPopoverOpen} onOpenChange={setIsSvgPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            size='sm'
            className='rounded-full bg-white text-gray-700 hover:bg-gray-100 flex items-center gap-1'
          >
            <Image className='h-5 w-5' />
            <span>背景</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80' align='center'>
          <div className='space-y-3'>
            <h3 className='font-medium'>背景選択</h3>

            <div className='overflow-x-auto pb-2 max-h-[300px]'>
              <div
                className='flex flex-wrap gap-2 p-1'
                style={{ minWidth: 'max-content' }}
              >
                {isLoadingSvg ? (
                  <div className='flex items-center justify-center w-full py-4'>
                    <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
                  </div>
                ) : (
                  svgIcons.map((icon) => (
                    <div
                      key={icon.id}
                      className='flex flex-col items-center cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors'
                      onClick={() => handleApplySvgIcon(icon)}
                    >
                      <div className='w-16 h-16 flex items-center justify-center bg-white rounded-md border border-gray-200 p-2'>
                        <img
                          src={icon.path}
                          alt={icon.name}
                          className='max-w-full max-h-full'
                        />
                      </div>
                      <span className='text-xs mt-1'>{icon.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <p className='text-xs text-gray-500'>
              アイコンをクリックするとPDFに追加されます
            </p>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={isSizePopoverOpen} onOpenChange={setIsSizePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            size='sm'
            className='rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 flex items-center gap-1'
          >
            <FileText className='h-5 w-5' />
            <span>サイズ設定</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80' align='center'>
          <div className='space-y-4'>
            <h3 className='font-medium'>PDFサイズ設定</h3>
            <p className='text-sm text-gray-500'>
              用紙サイズを選択してください。現在のサイズ:{' '}
              {PAPER_SIZES[selectedPaperSize].label}
            </p>

            <div className='grid grid-cols-1 gap-2'>
              {Object.entries(PAPER_SIZES).map(([key, size]) => (
                <Button
                  key={key}
                  variant={selectedPaperSize === key ? 'default' : 'outline'}
                  size='sm'
                  className='justify-start'
                  onClick={() => handleChangePaperSize(key as PaperSizeKey)}
                >
                  {getPaperSizeIcon(key as PaperSizeKey)}
                  {size.label}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover
        open={isLayoutEditPopoverOpen}
        onOpenChange={setIsLayoutEditPopoverOpen}
      >
        <PopoverTrigger asChild>
          <Button
            className='flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-800 dark:hover:bg-indigo-900 text-white'
            size='sm'
          >
            <LayoutGrid className='w-4 h-4' />
            <span>レイアウト編集</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-80'>
          <div className='grid gap-3'>
            <div className='space-y-1'>
              <h4 className='font-medium leading-none'>レイアウト編集</h4>
              <p className='text-sm text-muted-foreground'>
                現在のデザインを編集する指示を入力してください
              </p>
            </div>
            <div className='grid gap-2'>
              <div className='grid gap-1'>
                <Textarea
                  id='layout-edit-prompt'
                  placeholder='例: 見出しを大きくして、テーブルを中央に配置して...'
                  className='col-span-2 h-20'
                  value={layoutEditPrompt}
                  onChange={(e) => setLayoutEditPrompt(e.target.value)}
                  disabled={isLayoutEditLoading}
                />
                {layoutEditError && (
                  <p className='text-sm text-red-500'>{layoutEditError}</p>
                )}
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='grid gap-1'>
                  <Label htmlFor='layout-edit-model'>モデル</Label>
                  <Select
                    value={selectedLayoutEditModel}
                    onValueChange={(value) => setSelectedLayoutEditModel(value)}
                    disabled={isLayoutEditLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='モデルを選択' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {models.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-1'>
                  <Label htmlFor='layout-edit-color'>カラーパターン</Label>
                  <Select
                    value={selectedLayoutEditColorPattern}
                    onValueChange={(value) =>
                      setSelectedLayoutEditColorPattern(
                        value as ColorPatternKey
                      )
                    }
                    disabled={isLayoutEditLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='カラーを選択' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.keys(COLOR_PATTERNS).map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='grid gap-1'>
                <Label htmlFor='layout-pattern'>レイアウトパターン</Label>
                <Select
                  value={selectedLayoutPattern}
                  onValueChange={setSelectedLayoutPattern}
                  disabled={isLayoutEditLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='レイアウトパターンを選択' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {layoutPatterns.map((pattern) => (
                        <SelectItem key={pattern.value} value={pattern.value}>
                          {pattern.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-1'>
                <Label htmlFor='element-spacing'>要素間隔</Label>
                <Select
                  value={elementSpacing}
                  onValueChange={setElementSpacing}
                  disabled={isLayoutEditLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='要素間隔を選択' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {spacingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center space-x-2'>
                <Switch
                  id='auto-size'
                  checked={autoSizeElements}
                  onCheckedChange={setAutoSizeElements}
                  disabled={isLayoutEditLoading}
                />
                <Label htmlFor='auto-size'>
                  コンテンツに応じたサイズ自動調整
                </Label>
              </div>
              <Button
                onClick={generateLayoutEdit}
                disabled={isLayoutEditLoading || !layoutEditPrompt.trim()}
              >
                {isLayoutEditLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    生成中...
                  </>
                ) : (
                  '編集を適用'
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default FloatingActionButtons;
