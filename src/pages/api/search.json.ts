import type { APIRoute } from 'astro';
import { generateSearchIndex } from '../../utils/search';

export const GET: APIRoute = async () => {
  try {
    const searchIndex = await generateSearchIndex();
    
    return new Response(JSON.stringify(searchIndex), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // 1時間キャッシュ
      },
    });
  } catch (error) {
    console.error('Search index generation failed:', error);
    
    return new Response(JSON.stringify({ error: 'Failed to generate search index' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};