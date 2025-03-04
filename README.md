# PDF 作成アプリ

このアプリケーションは、カスタマイズ可能な PDF テンプレートのデザインと生成を行うためのツールです。請求書、領収書、報告書などの様々なビジネス文書を作成することができます。

## 機能

- 複数のテンプレートプリセット（請求書など）
- カスタム PDF テンプレートのデザイン
- テンプレートの JSON エクスポートとインポート
- ベース PDF の変更機能
- 多言語対応
- AI によるテンプレート生成サポート

## 技術スタック

- [Next.js](https://nextjs.org/) - React フレームワーク
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [PDFME](https://github.com/pdfme/pdfme) - PDF テンプレート生成ライブラリ
- [Radix UI](https://www.radix-ui.com/) - アクセシブルな UI コンポーネント
- [OpenRouter](https://openrouter.ai/) - AI テンプレート生成用 API

## はじめに

### 必要条件

- Node.js 18 以上
- npm または yarn
- OpenRouter API キー

### 環境変数の設定

アプリケーションを実行するには、プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、以下の環境変数を設定する必要があります：

```
# OpenRouter API Key（必須）
OPENROUTER_API_KEY=あなたのOpenRouterAPIキー

# Next.js public URL
NEXT_PUBLIC_URL=http://localhost:3000
```

OpenRouter API キーは [OpenRouter 公式サイト](https://openrouter.ai/) から取得できます。

### インストール

```bash
# リポジトリをクローン
git clone [リポジトリURL]

# プロジェクトディレクトリに移動
cd pdf-create-app

# 依存関係をインストール
npm install
# または
yarn install

# 開発サーバーを起動
npm run dev
# または
yarn dev
```

アプリケーションは http://localhost:3000 で実行されます。

## 使い方

1. テンプレートプリセットを選択するか、カスタムテンプレートを作成します
2. デザイナーインターフェースでテンプレートを編集します
3. 必要に応じてベース PDF をアップロードします
4. テンプレートを保存またはエクスポートします
5. PDF を生成します

### AI テンプレート生成機能

AI テンプレート生成機能を使用するには：

1. デザイナーインターフェースで「AI テンプレート生成」ボタンをクリックします
2. 生成したいテンプレートの説明を入力するか、「ランダムプロンプト生成」ボタンをクリックします
3. 「テンプレート生成」ボタンをクリックして AI にテンプレートを生成させます
4. 生成されたテンプレートを確認し、「適用」ボタンをクリックして使用します

この機能には OpenRouter API が使用されており、`.env.local` ファイルに有効な API キーが必要です。

## ライセンス

[使用しているライセンスを記載]

## 謝辞

- [PDF-me](https://github.com/pdfme/pdfme) - PDF テンプレート生成ライブラリ
- [OpenRouter](https://openrouter.ai/) - AI モデルへのアクセスを提供
- その他使用しているライブラリ・リソース
