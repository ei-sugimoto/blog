import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getPublishedArticles } from '../utils/content';

export async function GET(context) {
  const allArticles = await getCollection('articles');
  const publishedArticles = getPublishedArticles(allArticles);
  
  return rss({
    title: 'Tech Blog',
    description: '技術に関する記事とメモを公開しています',
    site: context.site,
    items: publishedArticles.slice(0, 20).map((article) => ({
      title: article.data.title,
      pubDate: article.data.date,
      description: article.data.description || `${article.data.title}の記事です`,
      link: `/articles/${article.slug}/`,
      categories: article.data.category ? [article.data.category] : [],
      customData: article.data.tags.length > 0 ? 
        `<tags>${article.data.tags.map(tag => `<tag>${tag}</tag>`).join('')}</tags>` : 
        '',
    })),
    customData: `<language>ja-jp</language>`,
  });
}