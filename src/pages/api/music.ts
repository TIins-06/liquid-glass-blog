export const prerender = false;
import type { APIRoute } from 'astro';
import { getSettings, setSetting } from '../../lib/kv';

export const GET: APIRoute = async (Astro) => {
  const settings = await getSettings();
  return new Response(settings.musicTracks, {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const PUT: APIRoute = async (Astro) => {
  try {
    const { tracks } = await Astro.request.json();
    await setSetting('musicTracks', JSON.stringify(tracks));
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
