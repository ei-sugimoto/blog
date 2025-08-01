# 技術ブログ

Astro.js で構築された個人技術ブログです。Markdown で記事を作成し、静的サイトとして CloudFlare Pages にデプロイされます。

## 特徴

- 📝 **Markdown サポート**: Content Collections を使用した型安全な記事管理
- 🎨 **レスポンシブデザイン**: Tailwind CSS による美しいUI
- 🔍 **全文検索**: Fuse.js による高速な記事検索
- 🏷️ **タグ・カテゴリ管理**: 記事の分類・整理機能
- 📊 **数式表示**: KaTeX による LaTeX 記法の数式レンダリング
- ✨ **構文ハイライト**: Shiki による美しいコードハイライト
- 📡 **RSS/Atom フィード**: 更新通知のためのフィード配信
- ⚡ **高速**: 静的サイト生成による高速な表示
- 🌙 **ダークモード**: システム設定に応じた自動切り替え

## 技術スタック

- **フレームワーク**: [Astro.js](https://astro.build/)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
- **検索**: [Fuse.js](https://fusejs.io/)
- **数式表示**: [KaTeX](https://katex.org/)
- **構文ハイライト**: [Shiki](https://shiki.matsu.io/)
- **デプロイ**: [CloudFlare Pages](https://pages.cloudflare.com/)

## 開発環境のセットアップ

### 前提条件

- Node.js v18 以降
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

開発サーバーは http://localhost:4321 で起動します。

## コマンド

| コマンド | 説明 |
| :--- | :--- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番用ビルドを実行 |
| `npm run preview` | ビルド結果をローカルでプレビュー |
| `npm run astro ...` | Astro CLI コマンドを実行 |

## 記事の作成方法

### 1. 新しい記事ファイルの作成

`src/content/articles/` ディレクトリに新しい `.md` ファイルを作成します。

```bash
# 例: src/content/articles/my-new-article.md
touch src/content/articles/my-new-article.md
```

### 2. Front Matter の設定

記事ファイルの先頭に YAML 形式で記事の情報を記述します。

```yaml
---
title: "記事のタイトル"
date: 2024-01-01
description: "記事の概要（オプション）"
tags: ["JavaScript", "Web開発"]
category: "フロントエンド"
draft: false
author: "著者名（オプション）"
---
```

#### Front Matter フィールド

- `title`: 記事のタイトル（必須）
- `date`: 投稿日（必須）
- `description`: 記事の概要（オプション）
- `tags`: タグの配列（オプション）
- `category`: カテゴリ（オプション）
- `draft`: 下書きフラグ（true の場合は非公開）
- `author`: 著者名（オプション）
- `updated`: 更新日（オプション）

### 3. 記事内容の執筆

Front Matter の後に Markdown で記事内容を記述します。

```markdown
# 見出し1

記事の内容をここに書きます。

## コードブロック

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

## 数式

$$E = mc^2$$

## リスト

- 項目1
- 項目2
- 項目3
```

### 4. プレビューと公開

1. `npm run dev` で開発サーバーを起動してプレビュー
2. Git にコミット・プッシュで自動デプロイ

## CloudFlare Pages デプロイ

### 自動デプロイの設定

1. CloudFlare Pages にログイン
2. GitHub リポジトリを接続
3. ビルド設定:
   - **ビルドコマンド**: `npm run build`
   - **出力ディレクトリ**: `dist`
   - **Node.js バージョン**: `18`

### 手動デプロイ

```bash
# ビルド実行
npm run build

# distディレクトリの内容をCloudFlare Pagesにアップロード
```

## 動作確認

まずはローカルでの動作確認を行います：

```bash
# 開発サーバー起動
npm run dev

# ビルドテスト
npm run build

# ビルド結果のプレビュー
npm run preview
```

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。