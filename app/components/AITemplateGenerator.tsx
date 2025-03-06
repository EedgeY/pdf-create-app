'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Template, BLANK_PDF } from '@pdfme/common';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Sparkles, RotateCw } from 'lucide-react';
import { models } from '@/app/helper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AITemplateGeneratorProps {
  onApplyTemplate: (template: Template) => void;
  currentTemplate?: Template; // 現在のデザイナーのテンプレート情報
}

export function AITemplateGenerator({
  onApplyTemplate,
  currentTemplate,
}: AITemplateGeneratorProps) {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(models[3]); // デフォルトはdeepseek/deepseek-chat
  const [selectedTemplateType, setSelectedTemplateType] = useState<string>(''); // テンプレートタイプの選択状態
  const [selectedLocalStyle, setSelectedLocalStyle] = useState<string>(''); // ローカルスタイルの選択状態
  const [selectedLanguage, setSelectedLanguage] = useState<string>('日本語'); // 言語の選択状態（デフォルトは日本語）
  const [selectedPageSize, setSelectedPageSize] = useState<string>('A4'); // ページサイズの選択状態（デフォルトはA4）
  const { toast } = useToast();

  // テンプレートタイプのリスト
  const templateTypes = [
    '請求書',
    '見積書',
    '診断書',
    '報告書',
    '履歴書',
    '契約書',
    '証明書',
    '申請書',
    '議事録',
    'カタログ',
    '名刺',
    'チラシ',
    'メニュー表',
    '予約表',
    '案内状',
  ];

  // ローカルスタイルのリスト
  const localStyles = [
    '日本風',
    'アメリカ風',
    'ヨーロッパ風',
    '中国風',
    '韓国風',
    'モダン',
    'クラシック',
    'ミニマル',
    'カラフル',
    'モノクロ',
    'ビジネス',
    'カジュアル',
    'エレガント',
  ];

  // 言語のリスト
  const languages = [
    '日本語',
    '英語',
    '中国語',
    '韓国語',
    'フランス語',
    'ドイツ語',
    'スペイン語',
    'イタリア語',
    'ポルトガル語',
    'ロシア語',
    'アラビア語',
  ];

  // ページサイズのリスト
  const pageSizes = [
    'A4', // 210mm × 297mm
    'A3', // 297mm × 420mm
    'A5', // 148mm × 210mm
    'B5', // 176mm × 250mm
    'レター', // 215.9mm × 279.4mm
    'リーガル', // 215.9mm × 355.6mm
    '名刺', // 91mm × 55mm
    'ハガキ', // 100mm × 148mm
  ];

  // ランダムなプロンプトを生成する関数
  const generateRandomPrompt = async () => {
    setIsGeneratingPrompt(true);
    setError(null);

    try {
      const response = await fetch('/api/openrouter/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentSize: selectedPageSize, // 選択されたページサイズを送信
          templateType: selectedTemplateType, // 選択されたテンプレートタイプを送信
          localStyle: selectedLocalStyle, // 選択されたローカルスタイルを送信
          language: selectedLanguage, // 選択された言語を送信
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'プロンプト生成に失敗しました');
      }

      const data = await response.json();

      if (!data.text) {
        throw new Error('プロンプトを生成できませんでした');
      }

      setPrompt(data.text);

      toast({
        title: 'プロンプト生成完了',
        description: `${data.model}モデルを使用してプロンプトを生成しました`,
        variant: 'default',
      });
    } catch (err: any) {
      console.error('プロンプト生成エラー:', err);
      setError(
        err instanceof Error ? err.message : '不明なエラーが発生しました'
      );
      toast({
        title: 'エラー',
        description:
          err instanceof Error ? err.message : '不明なエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateTemplate = async () => {
    if (!prompt.trim()) {
      setError('プロンプトを入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    // ページサイズの寸法情報を定義
    const pageSizeDimensions: Record<
      string,
      { width: number; height: number }
    > = {
      A4: { width: 210, height: 297 },
      A3: { width: 297, height: 420 },
      A5: { width: 148, height: 210 },
      B5: { width: 176, height: 250 },
      レター: { width: 215.9, height: 279.4 },
      リーガル: { width: 215.9, height: 355.6 },
      名刺: { width: 91, height: 55 },
      ハガキ: { width: 100, height: 148 },
    };

    try {
      const response = await fetch('/api/openrouter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt:
            prompt +
            `\n\n重要：フォントは全てNotoSerifJP-Regularを使用してください。また、テーブルのcontentは必ず有効なJSON文字列（JSON.stringify()で文字列化した2次元配列）を設定してください。ページサイズは${selectedPageSize}（${pageSizeDimensions[selectedPageSize].width}mm × ${pageSizeDimensions[selectedPageSize].height}mm）です。`,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'テンプレート生成に失敗しました');
      }

      const data = await response.json();

      if (!data.text) {
        throw new Error('返答からテンプレートを取得できませんでした');
      }

      try {
        // レスポンスから生のJSONテキストを取得
        let templateText = data.text;

        // 先頭と末尾の```jsonと```（もしあれば）を削除
        templateText = templateText
          .replace(/^```json\n/, '')
          .replace(/^```\n/, '')
          .replace(/\n```$/, '');

        console.log('解析前のテンプレート:', templateText);

        // JSON文字列のパース
        let parsedTemplate = JSON.parse(templateText);

        console.log('解析後のテンプレート:', parsedTemplate);

        // BLANK_PDFの置き換え
        if (
          typeof parsedTemplate.basePdf === 'string' &&
          parsedTemplate.basePdf === 'BLANK_PDF'
        ) {
          parsedTemplate.basePdf = BLANK_PDF;
        }

        // 選択されたページサイズに基づいてサイズを設定
        const selectedSize = pageSizeDimensions[selectedPageSize];
        if (selectedSize) {
          parsedTemplate.size = {
            width: selectedSize.width,
            height: selectedSize.height,
          };
        } else {
          // デフォルトはA4
          parsedTemplate.size = { width: 210, height: 297 };
        }

        // schemasの構造を確認・修正
        if (!Array.isArray(parsedTemplate.schemas)) {
          throw new Error('テンプレートのschemas構造が無効です');
        }

        // schemasの各要素が配列でない場合の修正
        parsedTemplate.schemas = parsedTemplate.schemas.map(
          (pageSchema: any) => {
            // 既にページ要素の配列である場合はそのまま返す
            if (Array.isArray(pageSchema)) {
              return pageSchema.map((schema: any) => {
                // フォントをNotoSerifJP-Regularに変更
                if (schema.type === 'text' && schema.fontName) {
                  schema.fontName = 'NotoSerifJP-Regular';
                }

                // テーブル要素の場合、contentが文字列でない場合に修正
                if (schema.type === 'table') {
                  // contentがない場合、デフォルトの空テーブルを設定
                  if (!schema.content) {
                    schema.content = JSON.stringify([[''], ['']]);
                  }
                  // contentが文字列でない場合、JSON.stringifyを適用
                  else if (typeof schema.content !== 'string') {
                    try {
                      schema.content = JSON.stringify(schema.content);
                    } catch (e) {
                      console.warn('テーブルcontentの変換に失敗:', e);
                      schema.content = JSON.stringify([['データなし'], ['']]);
                    }
                  }

                  // headが配列でない場合の修正
                  if (!Array.isArray(schema.head)) {
                    schema.head = ['項目1', '項目2'];
                  }

                  // headWidthPercentagesが配列でない場合の修正
                  if (!Array.isArray(schema.headWidthPercentages)) {
                    schema.headWidthPercentages = Array(
                      schema.head.length
                    ).fill(100 / schema.head.length);
                  }
                }

                return schema;
              });
            }
            // オブジェクトが誤って配列でラップされていない場合、配列でラップする
            return [pageSchema];
          }
        );

        // テンプレートの検証
        if (!parsedTemplate.basePdf) {
          throw new Error('テンプレートにbasePdfが設定されていません');
        }

        // 現在のデザイナーのテンプレート情報がある場合、サイズやオプションを維持
        if (currentTemplate) {
          console.log('現在のテンプレート情報を適用:', currentTemplate);

          // オプションの維持（サイズ、余白などの設定）
          parsedTemplate.options = {
            ...(parsedTemplate.options || {}),
            ...(currentTemplate.options || {}),
          };

          // 現在のサイズ情報を優先
          if (currentTemplate.size) {
            parsedTemplate.size = currentTemplate.size;
          } else if (currentTemplate.sizeInPt) {
            // 後方互換性のためにsizeInPtも確認
            parsedTemplate.sizeInPt = currentTemplate.sizeInPt;
          }
        }

        console.log('適用するテンプレート:', parsedTemplate);

        // テンプレートの適用
        onApplyTemplate(parsedTemplate);

        toast({
          title: '成功',
          description: 'AIがテンプレートを生成しました',
          variant: 'default',
        });
      } catch (parseError: any) {
        console.error('JSON解析エラー:', parseError);
        throw new Error(
          `テンプレートの解析に失敗しました: ${parseError.message}`
        );
      }
    } catch (err: any) {
      console.error('エラー:', err);
      setError(
        err instanceof Error ? err.message : '不明なエラーが発生しました'
      );

      toast({
        title: 'エラー',
        description:
          err instanceof Error ? err.message : '不明なエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    `PDF テンプレート生成プロンプト：予約表（A4、1ページ）モダンでクリーンなデザインの予約表テンプレートを生成してください。ヘッダーに予約タイトル（例：「〇月〇日 予約状況」）と日付、フッターに会社名/連絡先を配置。本文は予約情報を記載するテーブルを配置し、視覚的階層を明確にします。カラースキームは、背景色を#f0f8ff（薄い水色）、メインテキストカラーを#333333、アクセントカラーを#4682b4（青色）とします。レイアウトは、ヘッダー：本文：フッターの比率を1:7:2とし、上下の余白を20mm、左右の余白を15mmに設定。グリッドシステムを用いて要素を整列させ、一貫性を持たせます。タイポグラフィは、見出しに'Noto Sans JP' 16pt、本文に'Noto Sans JP' 11pt、注釈に'Noto Sans JP' 9ptを使用。テーブルは5行4列とし、罫線はsolid 1px #ccccccで指定。デザイン要素として、ヘッダー下部に#4682b4の区切り線を配置します。schema: [
  ["header", "text", "予約状況", "font-size: 16pt; color: #333333;"],
  ["date", "text", "2024年〇月〇日", "font-size: 12pt; color: #333333;"],
  ["table", "table", "[["時間","氏名","コース","担当"],["10:00","山田太郎","カット","田中"],["11:00","佐藤花子","パーマ","鈴木"],["13:00","田中一郎","カラー","高橋"],["14:00","　","　","　"]]", "border: solid 1px #cccccc; font-size: 11pt;"],
  ["footer", "text", "株式会社〇〇　連絡先：〇〇", "font-size: 9pt; color: #333333; text-align: right;"]
]`,

    `PDFテンプレート生成AIへ：A4サイズのメニュー表を作成してください。カラースキームは、背景色を#f8f8ff（明るいグレー）、メインテキスト色を#333333（濃いグレー）、アクセントカラーを#e67e22（オレンジ）とします。デザインスタイルはモダンでクリーンな印象を目指してください。

レイアウト構成は、ヘッダーに店名（フォント: 'Noto Sans JP', サイズ: 18pt, 色: #e67e22）、本文にメニュー項目、フッターに連絡先情報を配置します。ヘッダーの高さは20mm、フッターの高さは15mmとし、本文領域を最大限確保してください。余白は上下20mm、左右15mmに設定。

メニュー項目はテーブル形式で表示し、'商品名'、'説明'、'価格'の3列構成とします。テーブルのフォントサイズは11pt、行間は1.5とし、読みやすさを重視してください。テーブルの罫線はsolid 1px #ccccccで、セルのpaddingは5pxとします。
テーブルは最大5行とし、ページに収まるようにしてください。
contentは、[["ハンバーグ","デミグラスソース","1200"],["ステーキ","ミディアムレア","2500"],["パスタ","カルボナーラ","1500"],["サラダ","シーザーサラダ","800"],["　","　","　"]]とします。
行が足りない部分は空白文字で埋めてください。

フッターの連絡先情報は、'住所'、'電話番号'、'営業時間'を記載し、フォントサイズは9pt、色は#777777とします。

視覚的階層をつけるため、商品名は太字（font-weight: bold）で強調し、価格はアクセントカラーを使用してください。区切り線として、各カテゴリの間にdashed 1px #ddddddの線を引いてください。全体的に角丸のradius: 4pxを適用し、柔らかい印象に仕上げてください。

schema: [
  ["header", "store_name"],
  ["table", "menu_items"],
  ["footer", "contact_info"]
]
`,

    `診断書のPDFテンプレートを生成してください。A4サイズ、プロフェッショナルでクリーンなデザインを希望します。

レイアウトは、ヘッダーに病院名・ロゴ、患者情報、発行日を配置。本文は診断結果、医師の所見、処方内容を記載。フッターに病院の連絡先、医師名、署名欄を設けてください。

視覚的階層は、タイトル（病院名、診断書名）を最大フォントサイズ、見出し（患者情報、診断結果）を中フォントサイズ、本文、注釈は小フォントサイズで表現。重要情報は枠線や背景色で強調してください。

余白は上下20mm、左右15mm。'Noto Sans JP'フォントを使用し、見出し16pt、本文11pt、注釈9pt。メインカラーは#336699、アクセントカラーは#f0f8ff。

ロゴはヘッダー左上に配置、病院名を右側に配置（行を分けてください）。区切り線はヘッダー下部とフッター上部に「solid 1px #cccccc」。角丸はボタンや入力フィールドに「border-radius: 4px」。影効果は「box-shadow: 0 2px 4px rgba(0,0,0,0.1)」を控えめに使用。

処方内容を示すテーブルは５行以内とし、以下のダミーデータを含めてください。
"content": "[["薬剤名A","1回1錠","朝食後","7日分"],["薬剤名B","1回2錠","夕食後","14日分"],["薬剤名C","頓服","症状時","必要時"],["　","　","　","　"],["　","　","　","　"]]”。テーブルの各列の幅を適切に調整してください。

schema: [
  ["header"],
  ["patient_info"],
  ["diagnosis_title"],
  ["diagnosis_results"],
  ["doctor_opinion"],
  ["prescription_table"],
  ["notes"],
  ["doctor_signature"],
 ["date"],
  ["footer"]
]
`,
  ];

  return (
    <Card className='w-full'>
      <CardHeader className='relative overflow-hidden'>
        <div className='absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-20'></div>
        <div className='absolute -left-10 -bottom-10 w-32 h-32 bg-gradient-to-tr from-blue-400 to-cyan-500 rounded-full opacity-20'></div>

        <CardTitle className='flex items-center gap-2 text-2xl font-bold'>
          <span className='bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text'>
            AI帳票テンプレート生成
          </span>
          <span className='text-xs font-normal px-2 py-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white'>
            PDF
          </span>
          <span className='text-xs font-normal px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white'>
            OpenRouter
          </span>
        </CardTitle>
        <CardDescription className='relative z-10'>
          生成AIに希望する帳票の詳細を伝えて、テンプレートを自動生成します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor='template-type-select'>テンプレートタイプ</Label>
          <Select
            value={selectedTemplateType}
            onValueChange={setSelectedTemplateType}
          >
            <SelectTrigger id='template-type-select'>
              <SelectValue placeholder='テンプレートタイプを選択' />
            </SelectTrigger>
            <SelectContent>
              {templateTypes.map((type, index) => (
                <SelectItem key={index} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='mt-4'>
          <Label htmlFor='page-size-select'>ページサイズ</Label>
          <Select value={selectedPageSize} onValueChange={setSelectedPageSize}>
            <SelectTrigger id='page-size-select'>
              <SelectValue placeholder='ページサイズを選択' />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((size, index) => (
                <SelectItem key={index} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='mt-4'>
          <Label htmlFor='local-style-select'>スタイル</Label>
          <Select
            value={selectedLocalStyle}
            onValueChange={setSelectedLocalStyle}
          >
            <SelectTrigger id='local-style-select'>
              <SelectValue placeholder='スタイルを選択' />
            </SelectTrigger>
            <SelectContent>
              {localStyles.map((style, index) => (
                <SelectItem key={index} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='mt-4'>
          <Label htmlFor='language-select'>言語</Label>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger id='language-select'>
              <SelectValue placeholder='言語を選択' />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language, index) => (
                <SelectItem key={index} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-4'>
          <div className='relative'>
            <Label htmlFor='prompt'>プロンプト</Label>
            <div className='relative'>
              <Textarea
                id='prompt'
                placeholder=' 作成したい帳票の詳細を入力してください（例：請求書テンプレートを作成してください。会社名、ロゴ、請求日...）　
                プロンプト生成もできます(google/gemini-2.0-flash-001)。'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className='min-h-32 pr-10'
              />
              <Button
                variant='ghost'
                size='icon'
                className='absolute right-2 top-2 p-1'
                onClick={generateRandomPrompt}
                disabled={isGeneratingPrompt}
              >
                {isGeneratingPrompt ? (
                  <RotateCw className='h-5 w-5 animate-spin' />
                ) : (
                  <Sparkles className='h-5 w-5' />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor='model-select'>使用するモデル</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger id='model-select'>
                <SelectValue
                  placeholder='モデルを選択'
                  defaultValue={models[2]}
                />
              </SelectTrigger>
              <SelectContent>
                {models.map((model, index) => (
                  <SelectItem key={index} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={generateTemplate}
          disabled={isLoading}
          className='w-full'
        >
          {isLoading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              生成中...
            </>
          ) : (
            'テンプレートを生成'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AITemplateGenerator;
