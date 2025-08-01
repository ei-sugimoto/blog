# 技術ブログシステム 実装計画

## 実装フェーズ概要

実装を以下の6つのステップに分けて段階的に進めます：

1. **環境構築・初期設定**
2. **基本コンポーネント実装**
3. **コンテンツ管理システム実装**
4. **ページ・ルーティング実装**
5. **検索・フィード機能実装**
6. **デプロイ・動作確認**

## ステップ1: 環境構築・初期設定

### 1.1 Astroプロジェクト初期化
```bash
# Astroプロジェクト作成
npm create astro@latest . -- --template minimal --typescript

# 依存関係のインストール
npm install
```

### 1.2 必要な依存関係のインストール
```bash
# メイン依存関係
npm install @astrojs/tailwind @astrojs/rss tailwindcss

# Markdown関連
npm install @astrojs/markdown-remark remark-math rehype-katex

# 検索機能
npm install fuse.js

# 開発用依存関係
npm install -D @tailwindcss/typography
```

### 1.3 設定ファイルの作成・編集

#### astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  integrations: [tailwind()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'dark-plus',
      wrap: false,
    },
  },
  site: 'https://your-blog.pages.dev',
});
```

#### tailwind.config.mjs
```javascript
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};
```

#### tsconfig.json
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/layouts/*": ["src/layouts/*"]
    }
  }
}
```

### 1.4 ディレクトリ構造の作成
```bash
mkdir -p src/{components,layouts,pages/{articles,tags,categories},content/articles,styles}
mkdir -p public/images
```

### 1.5 グローバルスタイルの作成
```css
/* src/styles/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* KaTeX CSS */
@import 'katex/dist/katex.min.css';

/* カスタムスタイル */
@layer components {
  .article-content {
    @apply prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-800;
  }
}
```

## ステップ2: 基本コンポーネント実装

### 2.1 ベースレイアウト作成（BaseLayout.astro）
```typescript
interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Personal Tech Blog' } = Astro.props;
```

機能:
- HTML基本構造
- メタタグ設定
- Tailwind CSS読み込み
- KaTeX CSS読み込み

### 2.2 サイトヘッダー作成（Header.astro）
機能:
- サイトタイトル・ロゴ
- ナビゲーションメニュー
- レスポンシブ対応

### 2.3 サイトフッター作成（Footer.astro）
機能:
- コピーライト表示
- ソーシャルリンク
- RSSフィードリンク

### 2.4 記事カード作成（ArticleCard.astro）
```typescript
interface Props {
  title: string;
  date: Date;
  description?: string;
  tags: string[];
  slug: string;
  category?: string;
}
```

機能:
- 記事タイトル・概要表示
- 投稿日時表示
- タグ・カテゴリ表示
- 記事詳細へのリンク

## ステップ3: コンテンツ管理システム実装

### 3.1 Content Collections設定

#### src/content/config.ts
```typescript
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

### 3.2 記事レイアウト作成（ArticleLayout.astro）
```typescript
interface Props {
  frontmatter: {
    title: string;
    date: Date;
    updated?: Date;
    tags: string[];
    category?: string;
    description?: string;
  };
}
```

機能:
- 記事メタ情報表示
- タグ・カテゴリリンク
- 前後記事ナビゲーション
- パンくずナビ

### 3.3 サンプル記事作成
```markdown
---
title: "はじめての記事"
date: 2024-01-01
description: "ブログの最初の記事です"
tags: ["はじめまして", "ブログ"]
category: "お知らせ"
draft: false
---

# はじめまして

このブログの最初の記事です。

## コードサンプル

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

## 数式サンプル

$$E = mc^2$$
```

### 3.4 ユーティリティ関数作成
```typescript
// src/utils/content.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP');
}

export function getAllTags(articles: any[]): string[] {
  const allTags = articles.flatMap(article => article.data.tags);
  return [...new Set(allTags)];
}

export function getAllCategories(articles: any[]): string[] {
  const allCategories = articles
    .map(article => article.data.category)
    .filter(Boolean);
  return [...new Set(allCategories)];
}
```

## ステップ4: ページ・ルーティング実装

### 4.1 トップページ実装（index.astro）
機能:
- 全記事一覧表示（draft: false のみ）
- 日付降順ソート
- ページネーション（10記事/ページ）
- TagList コンポーネント表示

### 4.2 記事詳細ページ実装（articles/[slug].astro）
```typescript
export async function getStaticPaths() {
  const articles = await getCollection('articles', ({ data }) => {
    return data.draft !== true;
  });
  
  return articles.map((article) => ({
    params: { slug: article.slug },
    props: { article },
  }));
}
```

機能:
- Markdownコンテンツの表示
- 構文ハイライト適用
- 数式表示対応
- 記事メタ情報表示

### 4.3 タグ別一覧ページ実装（tags/[tag].astro）
```typescript
export async function getStaticPaths() {
  const articles = await getCollection('articles', ({ data }) => {
    return data.draft !== true;
  });
  
  const allTags = getAllTags(articles);
  
  return allTags.map((tag) => ({
    params: { tag },
    props: { 
      articles: articles.filter(article => 
        article.data.tags.includes(tag)
      ),
      tag 
    },
  }));
}
```

### 4.4 カテゴリ別一覧ページ実装（categories/[category].astro）
```typescript
export async function getStaticPaths() {
  const articles = await getCollection('articles', ({ data }) => {
    return data.draft !== true;
  });
  
  const allCategories = getAllCategories(articles);
  
  return allCategories.map((category) => ({
    params: { category },
    props: { 
      articles: articles.filter(article => 
        article.data.category === category
      ),
      category 
    },
  }));
}
```

### 4.5 TagList コンポーネント実装
```typescript
interface Props {
  tags: string[];
  currentTag?: string;
}
```

机能:
- 全タグの一覧表示
- アクティブタグのハイライト
- タグ別ページへのリンク

## ステップ5: 検索・フィード機能実装

### 5.1 検索インデックス生成
```typescript
// src/utils/search.ts
export interface SearchIndex {
  title: string;
  content: string;
  tags: string[];
  category?: string;
  slug: string;
  date: string;
}

export async function generateSearchIndex(): Promise<SearchIndex[]> {
  const articles = await getCollection('articles', ({ data }) => {
    return data.draft !== true;
  });
  
  return articles.map(article => ({
    title: article.data.title,
    content: article.body,
    tags: article.data.tags,
    category: article.data.category,
    slug: article.slug,
    date: article.data.date.toISOString(),
  }));
}
```

### 5.2 検索API エンドポイント実装
```typescript
// src/pages/api/search.json.ts
import type { APIRoute } from 'astro';
import { generateSearchIndex } from '@/utils/search';

export const GET: APIRoute = async () => {
  const searchIndex = await generateSearchIndex();
  
  return new Response(JSON.stringify(searchIndex), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
```

### 5.3 検索コンポーネント実装
```typescript
// Search.astro
interface Props {
  placeholder?: string;
}
```

機能:
- リアルタイム検索UI
- Fuse.js による全文検索
- 検索結果のハイライト表示

### 5.4 RSSフィード実装
```typescript
// src/pages/rss.xml.js
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const articles = await getCollection('articles', ({ data }) => {
    return data.draft !== true;
  });
  
  return rss({
    title: 'My Tech Blog',
    description: 'Personal technical blog',
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.date,
      description: article.data.description,
      link: `/articles/${article.slug}/`,
    })),
  });
}
```

### 5.5 Atomフィード実装
```typescript
// src/pages/atom.xml.js
// RSSフィードと同様の構造でAtom形式で出力
```

## ステップ6: デプロイ・動作確認

### 6.1 ビルド設定ファイル作成

#### package.json scripts更新
```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  }
}
```

### 6.2 CloudFlare Pages設定
```yaml
# wrangler.toml または Pages管理画面での設定
name = "tech-blog"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
cwd = "/"
destination = "dist"

[build.environment_variables]
NODE_VERSION = "18"
```

### 6.3 README.md作成
```markdown
# 技術ブログ

Astro.js で構築された個人技術ブログです。

## 開発

\`\`\`bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build
\`\`\`

## 記事作成

1. `src/content/articles/` に新しい `.md` ファイルを作成
2. Front Matter に必要な情報を記入
3. Markdown で記事内容を執筆
4. Git にコミット・プッシュで自動デプロイ
```

### 6.4 動作確認項目

#### ローカル確認
- [ ] `npm run dev` でサーバーが起動する
- [ ] トップページが表示される
- [ ] 記事詳細ページが表示される
- [ ] タグ・カテゴリページが表示される
- [ ] 検索機能が動作する
- [ ] RSSフィードが生成される

#### ビルド確認
- [ ] `npm run build` が正常に完了する
- [ ] `dist` ディレクトリが生成される
- [ ] 静的ファイルが正しく出力される

#### デプロイ後確認
- [ ] CloudFlare Pages にデプロイされる
- [ ] 本番環境で全ページが表示される
- [ ] 検索機能が動作する
- [ ] RSSフィードにアクセスできる
- [ ] モバイル・デスクトップで適切に表示される

## 実装順序

1. **ステップ1（環境構築）**: 約30分
2. **ステップ2（基本コンポーネント）**: 約1時間
3. **ステップ3（コンテンツ管理）**: 約1時間30分
4. **ステップ4（ページ・ルーティング）**: 約2時間
5. **ステップ5（検索・フィード）**: 約1時間30分
6. **ステップ6（デプロイ・確認）**: 約30分

**合計予想時間**: 約7時間

## 注意事項

### エラーハンドリング
- ビルドエラーが発生した場合は依存関係の再インストールを試行
- TypeScriptエラーが発生した場合は型定義を確認
- 画像が表示されない場合は `public/` ディレクトリの配置を確認

### パフォーマンス
- 記事数が増加したらページネーション実装を検討
- 画像サイズが大きい場合は最適化を実施
- ビルド時間が長くなった場合は不要なファイルを除外

### 拡張性
- 将来的な機能追加に備えて設定を外部化
- コンポーネントの再利用性を考慮した設計
- 型安全性を保つためのTypeScript活用