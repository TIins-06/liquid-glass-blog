export const prerender = false;
import type { APIRoute } from 'astro';
import { getSettings, setSetting } from '../../../lib/kv';

interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
  draft: boolean;
}

async function getArticles(): Promise<Article[]> {
  const settings = await getSettings();
  try { return JSON.parse(settings.articles || '[]'); } catch { return []; }
}

async function saveArticles(articles: Article[]): Promise<void> {
  await setSetting('articles', JSON.stringify(articles));
}

// GET /api/articles/manage?slug=xxx — get single article
export const GET: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug');
  if (!slug) {
    return new Response(JSON.stringify({ error: 'slug required' }), { status: 400 });
  }
  
  const articles = await getArticles();
  const article = articles.find(a => a.slug === slug);
  if (article) {
    return new Response(JSON.stringify(article), { headers: { 'Content-Type': 'application/json' } });
  }
  
  // Try static collection
  try {
    const { getCollection } = await import('astro:content');
    const posts = await getCollection('blog');
    const post = posts.find(p => p.id === slug);
    if (post) {
      // Read the raw content
      const { read } = await import('fs');
      const { join } = await import('path');
      const filePath = join(process.cwd(), 'src/content/blog', post.id + '.mdx');
      let raw = '';
      try { raw = read(filePath, 'utf-8'); } catch {}
      // Extract content after frontmatter
      const contentMatch = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
      return new Response(JSON.stringify({
        slug: post.id,
        title: post.data.title,
        description: post.data.description,
        date: post.data.date.toISOString().split('T')[0],
        tags: post.data.tags || [],
        content: contentMatch ? contentMatch[1].trim() : '',
        draft: post.data.draft || false,
      }), { headers: { 'Content-Type': 'application/json' } });
    }
  } catch {}
  
  return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
};

// PUT /api/articles/manage — create or update article
export const PUT: APIRoute = async ({ request }) => {
  try {
    const article: Article = await request.json();
    if (!article.slug || !article.title) {
      return new Response(JSON.stringify({ error: 'slug and title required' }), { status: 400 });
    }
    
    // Sanitize slug
    article.slug = article.slug.replace(/[^a-zA-Z0-9\-_]/g, '-').toLowerCase();
    if (!article.date) article.date = new Date().toISOString().split('T')[0];
    
    const articles = await getArticles();
    const idx = articles.findIndex(a => a.slug === article.slug);
    if (idx >= 0) {
      articles[idx] = article;
    } else {
      articles.push(article);
    }
    
    await saveArticles(articles);
    return new Response(JSON.stringify({ ok: true, slug: article.slug }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};

// DELETE /api/articles/manage?slug=xxx — delete article
export const DELETE: APIRoute = async ({ url }) => {
  const slug = url.searchParams.get('slug');
  if (!slug) {
    return new Response(JSON.stringify({ error: 'slug required' }), { status: 400 });
  }
  
  const articles = await getArticles();
  const filtered = articles.filter(a => a.slug !== slug);
  if (filtered.length === articles.length) {
    return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
  }
  
  await saveArticles(filtered);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
