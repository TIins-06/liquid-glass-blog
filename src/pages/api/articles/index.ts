export const prerender = false;
import type { APIRoute } from 'astro';

// Articles are stored in KV as JSON alongside the static MDX files
// This API manages the KV-stored articles

interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string;
  draft: boolean;
}

export const GET: APIRoute = async ({ url }) => {
  const { getSettings } = await import('../../../lib/kv');
  const settings = await getSettings();
  
  let articles: Article[] = [];
  try {
    articles = JSON.parse(settings.articles || '[]');
  } catch {}
  
  // Also merge with static MDX articles from content collection
  const { getCollection } = await import('astro:content');
  const staticPosts = await getCollection('blog');
  const staticArticles: Article[] = staticPosts.map(p => ({
    slug: p.id,
    title: p.data.title,
    description: p.data.description,
    date: p.data.date.toISOString().split('T')[0],
    tags: p.data.tags || [],
    content: '',
    draft: p.data.draft || false,
    source: 'static',
  }));
  
  // Merge: static articles + KV articles (KV takes priority for same slug)
  const slugSet = new Set(articles.map(a => a.slug));
  const merged = [...articles];
  for (const sa of staticArticles) {
    if (!slugSet.has(sa.slug)) merged.push(sa);
  }
  
  merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return new Response(JSON.stringify(merged), {
    headers: { 'Content-Type': 'application/json' }
  });
};
