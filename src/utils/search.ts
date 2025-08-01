import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export interface SearchIndex {
  title: string;
  content: string;
  tags: string[];
  category?: string;
  slug: string;
  date: string;
  description?: string;
}

export async function generateSearchIndex(): Promise<SearchIndex[]> {
  const articles = await getCollection('articles', ({ data }) => {
    return data.draft !== true;
  });
  
  const searchIndex: SearchIndex[] = [];
  
  for (const article of articles) {
    const { Content } = await article.render();
    
    // Markdownコンテンツからプレーンテキストを抽出
    // （実際の実装では、HTMLをパースしてテキストのみを抽出）
    const content = article.body.replace(/[#*`\[\]()]/g, '').trim();
    
    searchIndex.push({
      title: article.data.title,
      content: content,
      tags: article.data.tags,
      category: article.data.category,
      slug: article.slug,
      date: article.data.date.toISOString(),
      description: article.data.description,
    });
  }
  
  return searchIndex.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}