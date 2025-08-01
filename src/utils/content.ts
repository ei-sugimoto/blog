import type { CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getAllTags(articles: Article[]): string[] {
  const allTags = articles.flatMap(article => article.data.tags);
  return [...new Set(allTags)].sort();
}

export function getAllCategories(articles: Article[]): string[] {
  const allCategories = articles
    .map(article => article.data.category)
    .filter((category): category is string => Boolean(category));
  return [...new Set(allCategories)].sort();
}

export function getPublishedArticles(articles: Article[]): Article[] {
  return articles
    .filter(article => !article.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getArticlesByTag(articles: Article[], tag: string): Article[] {
  return getPublishedArticles(articles).filter(article => 
    article.data.tags.includes(tag)
  );
}

export function getArticlesByCategory(articles: Article[], category: string): Article[] {
  return getPublishedArticles(articles).filter(article => 
    article.data.category === category
  );
}

export function getRelatedArticles(articles: Article[], currentArticle: Article, limit: number = 3): Article[] {
  const published = getPublishedArticles(articles);
  const currentTags = currentArticle.data.tags;
  const currentCategory = currentArticle.data.category;
  
  // 現在の記事を除外
  const otherArticles = published.filter(article => article.slug !== currentArticle.slug);
  
  // 関連度を計算
  const scored = otherArticles.map(article => {
    let score = 0;
    
    // 同じカテゴリの場合はスコアを加算
    if (currentCategory && article.data.category === currentCategory) {
      score += 3;
    }
    
    // 共通タグの数だけスコアを加算
    const commonTags = article.data.tags.filter(tag => currentTags.includes(tag));
    score += commonTags.length;
    
    return { article, score };
  });
  
  // スコアが高い順にソートしてlimit数を返す
  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article }) => article);
}