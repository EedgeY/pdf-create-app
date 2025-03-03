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
  const { toast } = useToast();

  // ランダムなプロンプトを生成する関数
  const generateRandomPrompt = async () => {
    setIsGeneratingPrompt(true);
    setError(null);

    try {
      // ランダムな文書サイズを選択（A4が最も一般的なため、80%の確率でA4を選択）
      const documentSizes = ['A4', 'A3', 'B5', 'レター', 'リーガル'];
      const sizeRandom = Math.random();
      const documentSize =
        sizeRandom < 0.8
          ? 'A4'
          : documentSizes[Math.floor(Math.random() * documentSizes.length)];

      const response = await fetch('/api/openrouter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentSize,
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

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt:
            prompt +
            '\n\n重要：フォントは全てNotoSerifJP-Regularを使用してください。また、テーブルのcontentは必ず有効なJSON文字列（JSON.stringify()で文字列化した2次元配列）を設定してください。',
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

        // A4サイズを明示的に設定（ミリメートル単位）
        parsedTemplate.size = { width: 210, height: 297 };

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
    'A4サイズの請求書テンプレートを作成してください。会社ロゴ用のエリアを左上に、会社情報（名前、住所、連絡先）を右上に配置し、請求書番号、発行日、支払期日のフィールドを含めてください。顧客情報セクション、ID、説明、数量、単価、金額の列を持つ詳細な項目テーブル、右下に小計、税金（10％）、合計金額、下部に支払条件と銀行詳細を配置してください。',

    'A4サイズの診断書テンプレートを作成してください。上部に病院ロゴスペース、患者詳細セクション（名前、生年月日、ID番号、住所）、診断セクション（診察日、詳細な医学的所見エリア）、治療推奨事項、投薬詳細（用量と期間）、フォローアップ予約セクション、日付と公印エリアを含む医師の署名ブロックを配置してください。',

    'A4サイズの在庫管理レポートを作成してください。会社ヘッダー、レポート生成日、倉庫位置選択器、上部に在庫サマリー統計（総アイテム数、総価値、再注文ポイント以下のアイテム）、SKU、製品名、カテゴリー、現在の数量、最小レベル、再注文ポイント、単価、総価値、最終入庫日、担当スタッフメンバーの列を持つメインアイテムテーブルを含めてください。',

    'A4サイズのプロジェクト状況レポートテンプレートを作成してください。上部に会社ブランディングエリア、プロジェクトタイトルとIDセクション、報告期間日付、エグゼクティブサマリーセクション、プロジェクトメトリクスダッシュボード（完了率、予算状況、スケジュール状況をトラフィックライトインジケーターで表示）、計画日と実際の日付を比較するマイルストーントラッキングテーブル、優先レベル付きの問題/リスクセクション、次のステップ、プロジェクトマネージャーと利害関係者の承認署名ブロックを含めてください。',
  ];

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>AI帳票テンプレート生成</CardTitle>
        <CardDescription>
          生成AIに希望する帳票の詳細を伝えて、テンプレートを自動生成します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='relative'>
            <Label htmlFor='prompt'>プロンプト</Label>
            <div className='relative'>
              <Textarea
                id='prompt'
                placeholder='作成したい帳票の詳細を入力してください（例：請求書テンプレートを作成してください。会社名、ロゴ、請求日...）'
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

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <h4 className='text-sm font-medium mb-2'>プロンプト例</h4>
            <div className='flex flex-col gap-2 max-h-60 overflow-y-auto pr-2'>
              {examplePrompts.map((examplePrompt, index) => (
                <Button
                  key={index}
                  variant='outline'
                  className='justify-start h-auto p-2 text-left whitespace-normal break-words'
                  onClick={() => setPrompt(examplePrompt)}
                >
                  {examplePrompt}
                </Button>
              ))}
            </div>
          </div>
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
