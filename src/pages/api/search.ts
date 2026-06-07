export const prerender = false;
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getSettings } from '../../lib/kv';

export const GET: APIRoute = async ({ url }) => {
  const keyword = url.searchParams.get('q') || '';
  if (!keyword) {
    return new Response(JSON.stringify({ songs: [], posts: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Search blog posts
  const posts = (await getCollection('blog'))
    .filter(p => !p.data.draft)
    .filter(p => {
      const q = keyword.toLowerCase();
      return p.data.title.toLowerCase().includes(q) ||
             p.data.description.toLowerCase().includes(q) ||
             (p.data.tags || []).some(t => t.toLowerCase().includes(q));
    })
    .map(p => ({
      title: p.data.title,
      description: p.data.description,
      slug: p.slug,
      date: p.data.date.toISOString(),
      tags: p.data.tags || [],
    }));

  // Search music
  let songs: any[] = [];
  try {
    const settings = await getSettings();
    const tracks = JSON.parse(settings.musicTracks || '[]');
    const q = keyword.toLowerCase();
    songs = tracks
      .filter((t: any) => t.src && (
        (t.title || '').toLowerCase().includes(q) ||
        (t.artist || '').toLowerCase().includes(q)
      ))
      .map((t: any) => ({
        title: t.title || '未知',
        artist: t.artist || '',
        src: t.src,
        cover: t.cover || '',
      }));
  } catch {}

  return new Response(JSON.stringify({ songs, posts }), {
    headers: { 'Content-Type': 'application/json' }
  });
};