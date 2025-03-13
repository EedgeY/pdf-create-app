'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Type as TypeIcon,
  Table as TableIcon,
  FileText,
  Smartphone,
  CreditCard,
  Loader2,
  Palette,
  Image as ImageIcon,
  LayoutGrid,
  BarChart3,
  LayoutPanelTop,
  Layers as LayersIcon,
  RefreshCw,
  SquareStack,
  MinusIcon,
  PlusIcon,
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
import { StreamingDialog } from './StreamingDialog';
import ChartGenerator from './chart-generator';
import { Input } from '@/components/ui/input';

// 画像URLのキャッシュ用のMap（グローバルスコープに定義）
const imageCache = new Map<string, string>();

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
    primary: '#333333',
    secondary: '#666666',
    accent: '#999999',
  },
  dark: {
    label: 'ダーク',
    primary: '#121212',
    secondary: '#333333',
    accent: '#555555',
  },
  blue: {
    label: 'ブルー',
    primary: '#0077cc',
    secondary: '#3399ff',
    accent: '#66ccff',
  },
};

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

interface ChartDataItem {
  name: string;
  value: number;
}

// 画像取得のためのインターフェース
interface URLImageData {
  url: string;
  count: number;
  prompt: string;
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
  // 画像URL取得のためのポップオーバー状態
  const [isUrlImagePopoverOpen, setIsUrlImagePopoverOpen] = useState(false);
  const [selectedPaperSize, setSelectedPaperSize] =
    useState<PaperSizeKey>('A4');
  const [svgIcons, setSvgIcons] = useState<SvgIcon[]>([]);
  const [isLoadingSvg, setIsLoadingSvg] = useState(false);

  // 要素生成用の状態
  const [textPrompt, setTextPrompt] = useState('');
  const [tablePrompt, setTablePrompt] = useState('');
  const [v0Prompt, setV0Prompt] = useState('');
  const [layoutEditPrompt, setLayoutEditPrompt] = useState('');
  const [selectedTextModel, setSelectedTextModel] = useState(
    'google/gemini-2.0-flash-001'
  ); // デフォルトモデル
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
    useState('default'); // デフォルトカラー
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

  // ストリーミング用の状態
  const [textStreamData, setTextStreamData] = useState('');
  const [isTextStreamVisible, setIsTextStreamVisible] = useState(false);

  // チャート関連の状態を追加
  const [isChartPopoverOpen, setIsChartPopoverOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 画像URL関連の状態
  const [imageUrl, setImageUrl] = useState('');
  const [imageCount, setImageCount] = useState(1);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

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

  // テキスト生成関数
  const generateTextElement = async () => {
    if (!textPrompt.trim()) {
      setTextError('プロンプトを入力してください');
      return;
    }

    try {
      setIsTextLoading(true);
      setTextError(null);
      setTextStreamData('');
      setIsTextStreamVisible(true);
      setIsTextPopoverOpen(false);

      // APIリクエスト
      const response = await fetch('/api/openrouter/generate-text-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: textPrompt,
          model: selectedTextModel,
          colorPattern:
            COLOR_PATTERNS[
              selectedTextColorPattern as keyof typeof COLOR_PATTERNS
            ],
        }),
      });

      if (!response.ok) {
        throw new Error(`APIエラー: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('レスポンスボディがありません');
      }

      // SSEリーダーを作成
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedData = '';
      let streamingFinished = false;

      while (!streamingFinished) {
        const { done, value } = await reader.read();

        if (done) {
          streamingFinished = true;
          break;
        }

        // バイナリデータをテキストに変換
        const chunk = decoder.decode(value, { stream: true });

        // SSEメッセージを解析
        const lines = chunk.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);

            if (data === '[DONE]') {
              // ストリーミング完了
              streamingFinished = true;
            } else {
              try {
                const parsedData = JSON.parse(data);
                // JSONデータをそのまま表示用にセット
                setTextStreamData((prev) => {
                  // 完全な累積コンテンツがある場合はそれを使用
                  if (parsedData.content) {
                    return parsedData.content;
                  }
                  // デルタのみがある場合は追加
                  if (parsedData.delta) {
                    return prev + parsedData.delta;
                  }
                  return prev;
                });

                // 累積データを更新
                accumulatedData =
                  parsedData.content ||
                  accumulatedData + (parsedData.delta || '');
              } catch (err) {
                console.error('ストリーミングデータの解析エラー:', err, data);
              }
            }
          }
        }
      }

      console.log('テキスト生成完了');
    } catch (error) {
      console.error('テキスト生成エラー:', error);
      setTextError(
        error instanceof Error ? error.message : '不明なエラーが発生しました'
      );
      toast({
        title: 'エラー',
        description:
          error instanceof Error ? error.message : '不明なエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsTextLoading(false);
    }
  };

  // テキスト要素適用ハンドラ
  const applyTextElements = (normalizedData?: string) => {
    try {
      const dataToProcess = normalizedData || textStreamData;
      if (!dataToProcess) return;

      // JSONをパース
      const parsedData = JSON.parse(dataToProcess);

      // 要素配列を作成
      const elements = Array.isArray(parsedData) ? parsedData : [parsedData];

      // 要素を適用
      onApplyElement(elements);

      toast({
        title: 'テキスト要素を追加しました',
        description: `${elements.length}個の要素がPDFデザイナーに追加されました`,
      });

      // 入力をリセット
      setTextPrompt('');
      setTextStreamData('');
    } catch (error) {
      console.error('テキスト要素適用エラー:', error);
      toast({
        title: 'エラー',
        description: 'テキスト要素の適用に失敗しました',
        variant: 'destructive',
      });
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

  // チャートデータからチャート要素を生成する関数
  const handleChartGenerated = (data: ChartDataItem[], chartType: string) => {
    // チャートデータとタイプを基にスキーマを作成
    const chartElement = {
      type: 'chart',
      name: getChartName(chartType, data),
      chartType: chartType,
      chartData: JSON.stringify(data),
      chartOptions: JSON.stringify({}),
      content: '',
      position: { x: 20, y: 20 },
      width: 150,
      height: 100,
    };

    // 要素を適用
    onApplyElement(chartElement);

    // ポップオーバーを閉じる
    setIsChartPopoverOpen(false);

    // 成功メッセージを表示
    toast({
      title: 'チャートを追加しました',
      description: `${chartType}タイプのチャートが生成されました（${data.length}項目）`,
    });
  };

  // チャートの名前を生成
  const getChartName = (chartType: string, data: ChartDataItem[]): string => {
    // データの内容から適切な名前を推測
    let nameHint = '';

    if (data.length > 0) {
      // 最初の数項目をヒントとして使用
      const sampleNames = data
        .slice(0, Math.min(3, data.length))
        .map((item) => item.name);
      nameHint = sampleNames.join('、');

      if (data.length > 3) {
        nameHint += '...';
      }
    }

    switch (chartType) {
      case 'bar':
        return `棒グラフ: ${nameHint}`;
      case 'line':
        return `折れ線グラフ: ${nameHint}`;
      case 'pie':
        return `円グラフ: ${nameHint}`;
      default:
        return `チャート: ${nameHint}`;
    }
  };

  // 画像URLをデータURLに変換する関数
  const fetchImageAsDataURL = async (
    url: string,
    retryCount = 0
  ): Promise<string | null> => {
    // キャッシュにある場合はそれを返す
    if (imageCache.has(url)) {
      console.log(`キャッシュされた画像を使用: ${url}`);
      return imageCache.get(url)!;
    }

    // すでにデータURLの場合はそのまま返す
    if (url.startsWith('data:')) {
      return url;
    }

    // FAL AI画像の不具合対策のため、リトライカウントが3以上の場合は
    // デフォルトのプレースホルダー画像を返す
    const MAX_RETRIES = 3;
    if (retryCount >= MAX_RETRIES) {
      console.warn(`最大リトライ回数に達しました: ${url}`);
      // プレースホルダー画像（透過画像）のデータURL
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA50lEQVR4nO3bQQ6CMBRF0Y/7X6dxIH9AFBqo5ZyZScw1YdCXEHIcAAAAAAAAAAAAAAAAwL+7nO24P86+xdfdrq+dYvZ9uXe+3PsFhEgJkRIiJURKiJQQKSFSQqSESAmREiIlREqIlBApIVJCpIRICZESIiVESoiUECkhUkKkhEgJkRIiJURKiJQQKSFSQqSESAmREiIlREqIlBApIVJCpIRICZESIiVESoiUECkhUkKkhEgJkRIiJURKiNTsD9S4zbexn/1iOHtutNkvi82+r9k/MphNiJQQKSFSQqSESAmRWiLkNnm/5TsLAAAAAAAAAAAAAAAAYGcvn9kWyq9Yb3wAAAAASUVORK5CYII=';
    }

    try {
      // CORSエラー対策
      const corsProxy = 'https://corsproxy.io/?';
      const targetUrl = `${corsProxy}${encodeURIComponent(url)}`;

      console.log(`画像を取得中: ${targetUrl} (リトライ: ${retryCount})`);
      const response = await fetch(targetUrl, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          Accept: 'image/*',
        },
      });

      if (!response.ok) {
        console.error(`HTTP エラー: ${response.status} for URL: ${url}`);

        // 404エラーの場合は、FAL AI画像がまだ準備できていないため、再試行
        if (
          response.status === 404 &&
          url.includes('fal.media') &&
          retryCount < MAX_RETRIES
        ) {
          console.log(
            `404エラーのため${
              retryCount + 1
            }回目の再試行を${1500}ms後に実行します`
          );

          // 再試行の間隔を指数関数的に増加させる（1.5秒、3秒、6秒...）
          const retryDelay = 1500 * Math.pow(2, retryCount);

          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          return fetchImageAsDataURL(url, retryCount + 1);
        }

        throw new Error(`HTTP エラー: ${response.status}`);
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          if (!base64data) {
            reject(new Error('画像をbase64に変換できませんでした'));
            return;
          }
          // キャッシュに保存
          imageCache.set(url, base64data);
          resolve(base64data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('画像の取得エラー:', error);

      // エラー時にリトライカウントが最大未満の場合は再試行
      if (url.includes('fal.media') && retryCount < MAX_RETRIES) {
        console.log(
          `エラーのため${retryCount + 1}回目の再試行を${2000}ms後に実行します`
        );

        // エラーの場合は少し長めの遅延
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return fetchImageAsDataURL(url, retryCount + 1);
      }

      return null;
    }
  };

  // 画像生成要素を生成する関数
  const generateUrlImageElements = async () => {
    if (!imagePrompt.trim()) {
      setImageError('画像の説明（プロンプト）を入力してください');
      return;
    }

    if (imageCount < 1 || imageCount > 4) {
      setImageError('画像枚数は1〜4枚の間で指定してください');
      return;
    }

    setIsImageLoading(true);
    setImageError(null);

    try {
      // FAL AIのAPIを呼び出して画像を生成
      const response = await fetch('/api/fal-ai/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          count: imageCount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '画像生成に失敗しました');
      }

      const data = await response.json();
      console.log('FAL AI応答結果:', data);

      // 画像URLをデータURLに変換
      const imageElements = [];
      for (let i = 0; i < data.images.length; i++) {
        const imageUrl = data.images[i];
        console.log(`画像URL ${i + 1}: ${imageUrl}`);

        // プレースホルダー要素を作成
        const element = {
          type: 'urlimage',
          name: `画像 ${i + 1}`,
          imageUrl: imageUrl,
          // 一時的なプレースホルダー画像を設定
          content:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA50lEQVR4nO3bQQ6CMBRF0Y/7X6dxIH9AFBqo5ZyZScw1YdCXEHIcAAAAAAAAAAAAAAAAwL+7nO24P86+xdfdrq+dYvZ9uXe+3PsFhEgJkRIiJURKiJQQKSFSQqSESAmREiIlREqIlBApIVJCpIRICZESIiVESoiUECkhUkKkhEgJkRIiJURKiJQQKSFSQqSESAmREiIlREqIlBApIVJCpIRICZESIiVESoiUECkhUkKkhEgJkRIiJURKiNTsD9S4zbexn/1iOHtutNkvi82+r9k/MphNiJQQKSFSQqSESAmRWiLkNnm/5TsLAAAAAAAAAAAAAAAAYGcvn9kWyq9Yb3wAAAAASUVORK5CYII=',
          position: {
            x: 20 + (i % 2) * 100,
            y: 20 + Math.floor(i / 2) * 100,
          },
          width: 80,
          height: 80,
        };

        imageElements.push(element);

        // 要素を先に追加し、バックグラウンドで実際の画像を取得
        // このアプローチにより、ユーザーは画像の読み込みを待つ必要がない
        setTimeout(async () => {
          try {
            // 実際の画像を非同期で取得
            const dataUrl = await fetchImageAsDataURL(imageUrl);
            if (dataUrl) {
              console.log(`画像 ${i + 1} を正常に取得しました`);
              // コンテンツを更新（これはDesignerコンポーネントの内部状態を更新するために必要）
              if (designerRef.current) {
                designerRef.current.updateSchema(element.name, {
                  ...element,
                  content: dataUrl,
                });
              }
            }
          } catch (err) {
            console.error(`画像 ${i + 1} の取得に失敗しました:`, err);
          }
        }, 100);
      }

      // 要素を適用（プレースホルダー付き）
      handleApplyElement(imageElements);

      // 成功メッセージを表示
      toast({
        title: '画像を追加しました',
        description: `${imageElements.length}枚の画像を配置しました（バックグラウンドで読み込み中）`,
      });

      // ポップオーバーを閉じる
      setIsUrlImagePopoverOpen(false);

      // 入力をリセット
      setImagePrompt('');
      setImageCount(1);
    } catch (err: any) {
      console.error('画像生成エラー:', err);
      setImageError(
        err instanceof Error ? err.message : '不明なエラーが発生しました'
      );
      toast({
        title: 'エラー',
        description:
          err instanceof Error ? err.message : '不明なエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsImageLoading(false);
    }
  };

  return (
    <div className='fixed bottom-6 right-6 flex flex-col gap-2 z-50'>
      <div className='flex flex-col gap-2 items-end'>
        <Popover open={isTextPopoverOpen} onOpenChange={setIsTextPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              className='w-10 h-10 rounded-full shadow-md flex items-center justify-center bg-primary hover:bg-primary/90'
              size='icon'
              variant='default'
            >
              <TypeIcon className='h-5 w-5' />
              <span className='sr-only'>テキスト追加</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80 p-4' side='left'>
            <div className='space-y-4'>
              <h3 className='font-medium text-sm'>テキスト生成</h3>

              <div className='space-y-2'>
                <Label htmlFor='text-model' className='text-xs'>
                  AIモデル
                </Label>
                <Select
                  value={selectedTextModel}
                  onValueChange={setSelectedTextModel}
                >
                  <SelectTrigger id='text-model' className='text-xs'>
                    <SelectValue placeholder='モデルを選択' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='google/gemini-2.0-flash-001'>
                      Gemini 2.0 Flash
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='text-color' className='text-xs'>
                  カラーパターン
                </Label>
                <Select
                  value={selectedTextColorPattern}
                  onValueChange={(value) =>
                    setSelectedTextColorPattern(
                      value as keyof typeof COLOR_PATTERNS
                    )
                  }
                >
                  <SelectTrigger id='text-color' className='text-xs'>
                    <SelectValue placeholder='カラーを選択' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COLOR_PATTERNS).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        <div className='flex items-center'>
                          <div className='flex mr-2'>
                            <div
                              className='w-3 h-3 rounded-full mr-1'
                              style={{ backgroundColor: value.primary }}
                            />
                            <div
                              className='w-3 h-3 rounded-full'
                              style={{ backgroundColor: value.accent }}
                            />
                          </div>
                          {value.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='text-prompt' className='text-xs'>
                  プロンプト
                </Label>
                <Textarea
                  id='text-prompt'
                  placeholder='生成したいテキスト要素について教えてください'
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  className='h-24 text-xs'
                />
              </div>

              <div className='flex justify-end'>
                <Button
                  size='sm'
                  disabled={isTextLoading || !textPrompt.trim()}
                  onClick={generateTextElement}
                  className='text-xs'
                >
                  {isTextLoading ? (
                    <>
                      <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                      生成中
                    </>
                  ) : (
                    <>生成</>
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* ストリーミングダイアログ */}
        <StreamingDialog
          open={isTextStreamVisible}
          onOpenChange={setIsTextStreamVisible}
          streamData={textStreamData}
          isLoading={isTextLoading}
          onApply={applyTextElements}
          title='テキスト要素の生成'
          errorMessage={textError}
        />

        <Popover open={isTablePopoverOpen} onOpenChange={setIsTablePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              className='w-10 h-10 rounded-full shadow-md flex items-center justify-center bg-primary hover:bg-primary/90'
              size='icon'
              variant='default'
            >
              <TableIcon className='h-5 w-5' />
              <span className='sr-only'>テーブル追加</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80 p-4' side='left'>
            <div className='space-y-4'>
              <h3 className='font-medium text-sm'>テーブル生成</h3>
              <div className='space-y-2'>
                <Label htmlFor='table-prompt' className='text-xs'>
                  プロンプト
                </Label>
                <Textarea
                  id='table-prompt'
                  placeholder='生成したいテーブルについて教えてください'
                  value={tablePrompt}
                  onChange={(e) => setTablePrompt(e.target.value)}
                  className='h-24 text-xs'
                />
              </div>

              <div className='flex justify-end'>
                <Button
                  size='sm'
                  disabled={isTableLoading || !tablePrompt.trim()}
                  onClick={generateTableElement}
                  className='text-xs'
                >
                  {isTableLoading ? (
                    <>
                      <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                      生成中
                    </>
                  ) : (
                    <>生成</>
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={isChartPopoverOpen} onOpenChange={setIsChartPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              className='w-10 h-10 rounded-full shadow-md flex items-center justify-center bg-primary hover:bg-primary/90'
              size='icon'
              variant='default'
            >
              <BarChart3 className='h-5 w-5' />
              <span className='sr-only'>チャート追加</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80 p-4' side='left'>
            <div className='space-y-4'>
              <h3 className='font-medium text-sm'>チャート生成</h3>
              <ChartGenerator onDataGenerated={handleChartGenerated} />
            </div>
          </PopoverContent>
        </Popover>

        {/* <Popover open={isSvgPopoverOpen} onOpenChange={setIsSvgPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              className='w-10 h-10 rounded-full shadow-md flex items-center justify-center bg-primary hover:bg-primary/90'
              size='icon'
              variant='default'
            >
              <ImageIcon className='h-5 w-5' />
              <span className='sr-only'>SVG追加</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80 p-4' side='left'>
            <div className='space-y-4'>
              <h3 className='font-medium text-sm'>アイコン</h3>
              <div className='grid grid-cols-3 gap-2'>
                {isLoadingSvg ? (
                  <div className='col-span-3 flex justify-center py-4'>
                    <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                  </div>
                ) : (
                  svgIcons.slice(0, 9).map((icon) => (
                    <Button
                      key={icon.id}
                      variant='outline'
                      size='sm'
                      className='h-12 flex items-center justify-center p-1'
                      onClick={() => handleApplySvgIcon(icon)}
                    >
                      <img
                        src={icon.path}
                        alt={icon.name}
                        className='h-8 w-8'
                      />
                    </Button>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover> */}

        <Popover
          open={isUrlImagePopoverOpen}
          onOpenChange={setIsUrlImagePopoverOpen}
        >
          <PopoverTrigger asChild>
            <Button
              className='w-10 h-10 rounded-full shadow-md flex items-center justify-center bg-primary hover:bg-primary/90'
              size='icon'
              variant='default'
            >
              <ImageIcon className='h-5 w-5' />
              <span className='sr-only'>画像生成</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80 p-4' side='left'>
            <div className='space-y-4'>
              <h3 className='font-medium text-sm'>AI画像生成</h3>
              <div className='space-y-2'>
                <Label htmlFor='image-prompt' className='text-xs'>
                  プロンプト
                </Label>
                <Textarea
                  id='image-prompt'
                  placeholder='生成したい画像について教えてください'
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className='h-24 text-xs'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='image-count' className='text-xs'>
                  画像枚数 (1-4)
                </Label>
                <Input
                  id='image-count'
                  type='number'
                  min={1}
                  max={4}
                  value={imageCount}
                  onChange={(e) => setImageCount(parseInt(e.target.value) || 1)}
                  className='text-xs'
                />
              </div>
              {imageError && (
                <div className='text-red-500 text-xs'>{imageError}</div>
              )}
              <div className='flex justify-end'>
                <Button
                  size='sm'
                  disabled={isImageLoading || !imagePrompt.trim()}
                  onClick={generateUrlImageElements}
                  className='text-xs'
                >
                  {isImageLoading ? (
                    <>
                      <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                      生成中
                    </>
                  ) : (
                    <>生成</>
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button
        className='w-12 h-12 rounded-full shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90'
        size='icon'
        variant='default'
      >
        <PlusIcon className='h-6 w-6' />
        <span className='sr-only'>追加</span>
      </Button>
    </div>
  );
}

export default FloatingActionButtons;
