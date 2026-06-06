export const prerender = false;
import type { APIRoute } from 'astro';
import { getSettings, setSetting } from '../../../lib/kv';

export const GET: APIRoute = async () => {
  const settings = await getSettings();
  return new Response(settings.musicFavorites || '[]', { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const { favorites } = await request.json();
    await setSetting('musicFavorites', JSON.stringify(favorites));
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};