import React, { useState } from 'react';
import { useCompletion } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BarChart3, LineChart, PieChart } from 'lucide-react';

interface ChartDataItem {
  name: string;
  value: number;
}

interface ChartGeneratorProps {
  onDataGenerated: (data: ChartDataItem[], chartType: string) => void;
}

const DEFAULT_DATA_FORMAT = `[
  { "name": "項目名1", "value": 数値1 },
  { "name": "項目名2", "value": 数値2 },
  ...
]`;

// チャートタイプの説明
const CHART_TYPE_DESCRIPTIONS = {
  bar: '棒グラフ - カテゴリ比較に最適',
  line: '折れ線グラフ - 時系列データや傾向分析に最適',
  pie: '円グラフ - 構成比や比率の表示に最適',
};

export default function ChartGenerator({
  onDataGenerated,
}: ChartGeneratorProps) {
  const [userPrompt, setUserPrompt] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [dataFormat, setDataFormat] = useState(DEFAULT_DATA_FORMAT);
  const [modelName, setModelName] = useState('anthropic/claude-3-opus:beta');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { complete } = useCompletion({
    api: '/api/openrouter/generate-chart',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const handleGenerateChart = async () => {
    if (!userPrompt.trim()) {
      setError('プロンプトを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // APIに送信するパラメータを準備（必ずデフォルト値を設定）
      const promptParams = {
        prompt: userPrompt,
        chartType: chartType || 'bar',
        dataFormat: isAdvancedMode ? dataFormat : DEFAULT_DATA_FORMAT,
        model: isAdvancedMode ? modelName : 'anthropic/claude-3-opus:beta',
      };

      console.log('チャートデータ生成を開始:', promptParams);

      // AIにチャートデータの生成を依頼（ストリーミング応答を処理）
      const response = await fetch('/api/openrouter/generate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptParams),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API応答エラー: ${
            errorData.error || response.statusText || '不明なエラー'
          }`
        );
      }

      // ストリーミングレスポンスから完全なテキストを読み込む
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('レスポンスボディが読み取れません');
      }

      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // ArrayBufferをテキストに変換
        const chunk = new TextDecoder().decode(value);
        result += chunk;
      }

      console.log('APIから受信したデータ:', result);

      if (!result || result.trim() === '') {
        throw new Error('生成結果が空です');
      }

      // JSONパース処理
      try {
        // 余分なスペース、改行、マークダウン記法などを削除して、JSONだけを取得
        const jsonContent = result
          .trim()
          .replace(/```json|```/g, '')
          .trim();
        console.log('パース前のJSONデータ:', jsonContent);

        let chartData;
        try {
          // JSONをパース
          chartData = JSON.parse(jsonContent);
        } catch (parseError) {
          console.error('JSON解析エラー:', parseError);

          // JSONっぽい部分を抽出して再試行
          const jsonPattern = /\[([\s\S]*)\]/;
          const match = jsonContent.match(jsonPattern);

          if (match) {
            try {
              const extractedJson = match[0].trim();
              console.log('抽出されたJSON:', extractedJson);
              chartData = JSON.parse(extractedJson);
            } catch (extractError) {
              console.error('抽出したJSONの解析に失敗:', extractError);
              throw new Error('JSONデータの抽出に失敗しました');
            }
          } else {
            throw new Error('有効なJSON形式ではありません');
          }
        }

        console.log('パース後のチャートデータ:', chartData);

        // 適切な形式かチェック
        if (
          Array.isArray(chartData) &&
          chartData.length > 0 &&
          chartData.every(
            (item) =>
              typeof item === 'object' &&
              item !== null &&
              'name' in item &&
              'value' in item
          )
        ) {
          // 値が数値型であることを確認し、必要に応じて変換
          const validatedData = chartData.map((item) => {
            // nameが文字列であることを確認
            const name = String(item.name);

            // valueが数値であることを確認
            let value: number;
            if (typeof item.value === 'number') {
              value = item.value;
            } else if (typeof item.value === 'string') {
              // 文字列の場合は数値に変換を試みる
              const parsedValue = parseFloat(item.value);
              if (isNaN(parsedValue)) {
                throw new Error(
                  `項目「${name}」の値「${item.value}」が数値に変換できません`
                );
              }
              value = parsedValue;
            } else {
              throw new Error(
                `項目「${name}」の値が数値型でも文字列型でもありません`
              );
            }

            return { name, value };
          });

          console.log('検証済みチャートデータ:', validatedData);

          // 検証済みのデータをチャートスキーマに変換
          const chartElement = createChartElement(validatedData, chartType);
          console.log('生成されたチャート要素:', chartElement);

          onDataGenerated(validatedData, chartType);
        } else {
          throw new Error('AIが生成したデータが正しい形式ではありません');
        }
      } catch (parseError) {
        console.error('データのパースに失敗しました:', parseError, result);

        // より詳細なエラーメッセージ
        let errorMessage = '生成されたデータが正しい形式ではありません。';

        if (parseError instanceof Error) {
          errorMessage += ' ' + parseError.message;
        }

        errorMessage += ' もう一度お試しください。';

        setError(errorMessage);
      }
    } catch (error) {
      console.error('チャートデータの生成に失敗しました:', error);

      let errorMessage = 'チャートデータの生成に失敗しました。';

      if (error instanceof Error) {
        errorMessage += ' ' + error.message;
      }

      setError(errorMessage + ' もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // チャート要素を生成する関数
  const createChartElement = (
    chartData: ChartDataItem[],
    chartType: string
  ) => {
    // チャートスキーマの基本構造
    return {
      type: 'chart',
      name: getChartNameFromType(chartType),
      chartType: chartType,
      chartData: JSON.stringify(chartData),
      chartOptions: JSON.stringify({}),
      content: '', // SVG->PNG変換はプラグイン側で行うため空にしておく
      position: { x: 20, y: 20 },
      width: 150,
      height: 100,
      required: false,
    };
  };

  // チャートタイプに応じた名前を生成
  const getChartNameFromType = (chartType: string): string => {
    const prefix =
      userPrompt.length > 20 ? userPrompt.substring(0, 20) + '...' : userPrompt;

    switch (chartType) {
      case 'bar':
        return `棒グラフ: ${prefix}`;
      case 'line':
        return `折れ線グラフ: ${prefix}`;
      case 'pie':
        return `円グラフ: ${prefix}`;
      default:
        return `チャート: ${prefix}`;
    }
  };

  // チャートタイプに対応するアイコンを返す関数
  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar':
        return <BarChart3 className='h-4 w-4 mr-2' />;
      case 'line':
        return <LineChart className='h-4 w-4 mr-2' />;
      case 'pie':
        return <PieChart className='h-4 w-4 mr-2' />;
      default:
        return <BarChart3 className='h-4 w-4 mr-2' />;
    }
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='chart-type'>チャートタイプ</Label>
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger id='chart-type' className='w-full'>
            <SelectValue placeholder='チャートタイプを選択' />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CHART_TYPE_DESCRIPTIONS).map(
              ([value, description]) => (
                <SelectItem key={value} value={value}>
                  <span className='flex items-center'>
                    {getChartIcon(value)}
                    {description}
                  </span>
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='chart-prompt'>どのようなデータが必要ですか？</Label>
        <Textarea
          id='chart-prompt'
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder='例: 2020年から2023年までの日本の四半期GDP成長率データを作成してください'
          className='min-h-[120px]'
        />
      </div>

      <div className='flex items-center space-x-2'>
        <Switch
          id='advanced-mode'
          checked={isAdvancedMode}
          onCheckedChange={setIsAdvancedMode}
        />
        <Label htmlFor='advanced-mode'>詳細設定を表示</Label>
      </div>

      {isAdvancedMode && (
        <Card className='border border-border/40'>
          <CardContent className='pt-6 space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='model-select'>AIモデル</Label>
              <Select value={modelName} onValueChange={setModelName}>
                <SelectTrigger id='model-select'>
                  <SelectValue placeholder='モデルを選択' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='anthropic/claude-3-opus:beta'>
                    Claude 3 Opus
                  </SelectItem>
                  <SelectItem value='anthropic/claude-3-sonnet:beta'>
                    Claude 3 Sonnet
                  </SelectItem>
                  <SelectItem value='anthropic/claude-3-haiku:beta'>
                    Claude 3 Haiku
                  </SelectItem>
                  <SelectItem value='openai/gpt-4o'>GPT-4o</SelectItem>
                  <SelectItem value='openai/gpt-4-turbo'>
                    GPT-4 Turbo
                  </SelectItem>
                  <SelectItem value='openai/gpt-3.5-turbo'>
                    GPT-3.5 Turbo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='data-format'>
                データフォーマット (JSONスキーマ)
              </Label>
              <Textarea
                id='data-format'
                value={dataFormat}
                onChange={(e) => setDataFormat(e.target.value)}
                className='min-h-[120px] font-mono text-sm'
              />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleGenerateChart}
        disabled={isLoading}
        className='w-full'
      >
        {isLoading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            データを生成中...
          </>
        ) : (
          <>
            {getChartIcon(chartType)}
            チャートデータを生成
          </>
        )}
      </Button>
    </div>
  );
}
