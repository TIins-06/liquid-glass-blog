export const prerender = false;
import type { APIRoute } from 'astro';
import { getSettings, setSetting } from '../../../lib/kv';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const settings = await getSettings();
  const recommended = settings.recommendedArticles || '[]';
  return new Response(recommended, {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    await setSetting('recommendedArticles', JSON.stringify(body.articles || []));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};