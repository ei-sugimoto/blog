# 技術ブログシステム 設計書

## アーキテクチャ概要

### システム構成
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Markdown      │    │  Static Site    │    │   CloudFlare    │
│   Content       │───▶│   Generator     │───▶│     Pages       │
│   (.md files)   │    │   (Astro)       │    │   (Hosting)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技術スタック選定
- **フレームワーク**: Astro.js
  - 理由: 静的サイト生成に特化、Markdownサポート充実、CloudFlare Pages対応、高速
- **Markdownパーサー**: remark + rehype
- **構文ハイライト**: Shiki（Astro標準）
- **数式表示**: rehype-katex
- **スタイリング**: Tailwind CSS
- **デプロイ**: CloudFlare Pages（Git連携）

## ディレクトリ構造

```
blog/
├── src/
│   ├── components/          # 再利用可能コンポーネント
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ArticleCard.astro
│   │   ├── TagList.astro
│   │   └── Layout.astro
│   ├── pages/              # ページファイル
│   │   ├── index.astro     # トップページ（記事一覧）
│   │   ├── articles/       # 記事詳細ページ
│   │   │   └── [slug].astro
│   │   ├── tags/          # タグ別一覧ページ
│   │   │   └── [tag].astro
│   │   ├── categories/    # カテゴリ別一覧ページ
│   │   │   └── [category].astro
│   │   ├── rss.xml.js     # RSSフィード
│   │   └── atom.xml.js    # Atomフィード
│   ├── content/           # コンテンツファイル
│   │   └── articles/      # Markdownファイル
│   │       ├── article-1.md
│   │       ├── article-2.md
│   │       └── ...
│   ├── layouts/           # レイアウトコンポーネント
│   │   ├── BaseLayout.astro
│   │   └── ArticleLayout.astro
│   └── styles/            # CSSファイル
│       └── global.css
├── public/                # 静的ファイル
│   ├── images/
│   └── favicon.ico
├── astro.config.mjs       # Astro設定
├── tailwind.config.mjs    # Tailwind設定
├── package.json
└── README.md
```

## データモデル設計

### Front Matter スキーマ
```yaml
# 必須フィールド
title: "記事のタイトル"
date: 2024-01-01
draft: false

# オプションフィールド
description: "記事の概要"
tags: ["JavaScript", "React"]
category: "フロントエンド"
updated: 2024-01-02
author: "著者名"
```

### コレクション定義（Astro Content Collections）
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    draft: z.boolean().default(false),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
    updated: z.date().optional(),
    author: z.string().optional(),
  }),
});

export const collections = {
  articles: articlesCollection,
};
```

## コンポーネント設計

### 1. レイアウトコンポーネント

#### BaseLayout.astro
```typescript
interface Props {
  title: string;
  description?: string;
}
```
- HTML基本構造
- メタタグ設定
- ヘッダー・フッター配置
- Tailwind CSS読み込み

#### ArticleLayout.astro
```typescript
interface Props {
  frontmatter: {
    title: string;
    date: Date;
    tags: string[];
    category?: string;
    description?: string;
  };
}
```
- 記事用レイアウト
- パンくずナビ
- 記事メタ情報表示
- タグ・カテゴリリンク

### 2. UIコンポーネント

#### ArticleCard.astro
```typescript
interface Props {
  title: string;
  date: Date;
  description?: string;
  tags: string[];
  slug: string;
}
```
- 記事カード表示
- サムネイル（オプション）
- 記事概要
- タグ表示

#### TagList.astro
```typescript
interface Props {
  tags: string[];
  currentTag?: string;
}
```
- タグ一覧表示
- アクティブタグのハイライト
- タグ別ページへのリンク

## ページ設計

### 1. トップページ（index.astro）
- 機能: 全記事の一覧表示（公開済みのみ）
- ソート: 日付降順
- ページネーション: 10記事/ページ
- フィルタ: draft: false のみ表示

### 2. 記事詳細ページ（articles/[slug].astro）
- 機能: Markdownコンテンツの表示
- 動的ルーティング: ファイル名をslugとして使用
- 構文ハイライト: 自動適用
- 数式表示: KaTeX使用
- 前後記事ナビゲーション

### 3. タグ別一覧ページ（tags/[tag].astro）
- 機能: 特定タグの記事一覧
- 動的ルーティング: タグ名をパラメータとして使用
- フィルタリング: 指定タグを含む記事のみ表示

### 4. カテゴリ別一覧ページ（categories/[category].astro）
- 機能: 特定カテゴリの記事一覧
- 動的ルーティング: カテゴリ名をパラメータとして使用
- フィルタリング: 指定カテゴリの記事のみ表示

## フィード生成設計

### RSS/Atomフィード
- パス: `/rss.xml`, `/atom.xml`
- 内容: 公開済み記事の最新20件
- 更新頻度: ビルド時に自動生成
- メタデータ: タイトル、説明、リンク、日付を含む

## 検索機能設計

### 静的検索実装
- 方式: ビルド時に検索インデックス生成
- ライブラリ: Fuse.js（軽量フルテキスト検索）
- 対象: タイトル、内容、タグ、カテゴリ
- インターフェース: リアルタイム検索UI

```typescript
// 検索インデックス構造
interface SearchIndex {
  title: string;
  content: string;
  tags: string[];
  category?: string;
  slug: string;
  date: string;
}
```

## スタイル設計

### デザインシステム
- **カラーパレット**: Tailwind標準カラー使用
  - Primary: Blue (記事リンク、ボタン)
  - Secondary: Gray (テキスト、ボーダー)
  - Accent: Green (タグ、カテゴリ)
- **タイポグラフィ**: Tailwind Typography プラグイン
- **レスポンシブ**: Mobile-first アプローチ
- **ダークモード**: Tailwind Dark Mode対応（オプション）

### コンポーネントスタイル
```css
/* 記事コンテンツのスタイル */
.prose {
  @apply max-w-none;
}

.prose pre {
  @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto;
}

.prose code {
  @apply bg-gray-100 px-1 py-0.5 rounded text-sm;
}
```

## パフォーマンス最適化

### 画像最適化
- Astroの画像最適化機能使用
- WebP/AVIF形式への変換
- レスポンシブ画像生成
- 遅延読み込み対応

### バンドル最適化
- Astroの自動コード分割
- 未使用CSS除去
- JavaScript最小化
- 静的アセット最適化

## CloudFlare Pages 連携設計

### ビルド設定
```yaml
# .cloudflare/pages.toml (または Pages設定画面)
build:
  command: "npm run build"
  output: "dist"
  
environment:
  NODE_VERSION: "18"
  NPM_VERSION: "latest"
```

### 環境変数
```javascript
// astro.config.mjs
export default defineConfig({
  site: process.env.SITE_URL || 'https://your-blog.pages.dev',
  base: process.env.BASE_PATH || '/',
});
```

### Git連携フロー
1. GitHubリポジトリにpush
2. CloudFlare Pages自動ビルド開始
3. `npm run build`実行
4. `dist`ディレクトリをデプロイ
5. 自動でURLを更新

## 開発ワークフロー

### ローカル開発
```bash
# 開発サーバー起動（ホットリロード付き）
npm run dev

# ビルド実行
npm run build

# ビルド結果のプレビュー
npm run preview
```

### 記事作成フロー
1. `src/content/articles/`に新しい`.md`ファイル作成
2. Front Matterに必要な情報を記入
3. Markdownで記事内容を執筆
4. `npm run dev`でプレビュー確認
5. Gitにコミット・プッシュ
6. CloudFlare Pagesで自動デプロイ

## セキュリティ考慮事項

### XSS対策
- Astroの自動エスケープ機能
- Markdownパーサーのサニタイゼーション
- ユーザー入力の検証（検索機能）

### 依存関係管理
- 定期的な依存関係更新
- 脆弱性スキャン実行
- package-lock.jsonのコミット

## 拡張性設計

### 今後の機能拡張
- **コメント機能**: 外部サービス（Disqus、Giscus）連携
- **アナリティクス**: Google Analytics 4連携
- **PWA対応**: Service Worker追加
- **多言語対応**: i18nルーティング
- **サイトマップ**: 自動生成機能追加

### 設定の外部化
```typescript
// src/config.ts
export const siteConfig = {
  title: 'My Tech Blog',
  description: 'Personal technical blog',
  author: 'Your Name',
  email: 'your@email.com',
  social: {
    twitter: '@yourusername',
    github: 'yourusername',
  },
  pagination: {
    postsPerPage: 10,
  },
};
```

## テスト戦略

### ビルドテスト
- ビルドエラーの自動検出
- リンク切れチェック
- HTMLバリデーション

### 視覚的回帰テスト（オプション）
- 主要ページのスクリーンショット比較
- レスポンシブデザイン確認

## 運用・監視

### パフォーマンス監視
- CloudFlare Analytics
- Core Web Vitals測定
- ページ読み込み速度監視

### エラー監視
- ビルドエラーの通知設定
- 404エラーの監視
- 外部リンクの定期チェック