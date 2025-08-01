import { getCollection } from 'astro:content';
import { getPublishedArticles } from '../utils/content';

export async function GET(context) {
  const allArticles = await getCollection('articles');
  const publishedArticles = getPublishedArticles(allArticles);
  const siteUrl = context.site;
  
  const atomFeed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Tech Blog</title>
  <subtitle>技術に関する記事とメモを公開しています</subtitle>
  <link href="${siteUrl}atom.xml" rel="self"/>
  <link href="${siteUrl}"/>
  <updated>${publishedArticles[0]?.data.date.toISOString() || new Date().toISOString()}</updated>
  <id>${siteUrl}</id>
  <author>
    <name>Tech Blog</name>
  </author>
  
  ${publishedArticles.slice(0, 20).map((article) => `
  <entry>
    <title>${escapeXml(article.data.title)}</title>
    <link href="${siteUrl}articles/${article.slug}/"/>
    <updated>${article.data.updated?.toISOString() || article.data.date.toISOString()}</updated>
    <published>${article.data.date.toISOString()}</published>
    <id>${siteUrl}articles/${article.slug}/</id>
    <summary type="text">${escapeXml(article.data.description || `${article.data.title}の記事です`)}</summary>
    ${article.data.category ? `<category term="${escapeXml(article.data.category)}"/>` : ''}
    ${article.data.tags.map(tag => `<category term="${escapeXml(tag)}"/>`).join('')}
    ${article.data.author ? `<author><name>${escapeXml(article.data.author)}</name></author>` : ''}
  </entry>`).join('')}
</feed>`;

  return new Response(atomFeed, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  });
}

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}