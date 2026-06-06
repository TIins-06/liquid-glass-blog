export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q') || '';
  if (!q) {
    return new Response(JSON.stringify({ songs: [] }), { headers: { 'Content-Type': 'application/json' } });
  }
  try {
    const resp = await fetch(`https://music.163.com/api/search/get/web?s=${encodeURIComponent(q)}&type=1&limit=20&offset=0`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com/',
      },
    });
    const data = await resp.json();
    const songs = (data?.result?.songs || []).map((s: any) => ({
      id: s.id,
      title: s.name,
      artist: (s.artists || []).map((a: any) => a.name).join(', '),
      album: s.album?.name || '',
      duration: Math.floor((s.duration || 0) / 1000),
      cover: s.album?.picUrl || '',
      src: `https://music.163.com/song/media/outer/url?id=${s.id}.mp3`,
    }));
    return new Response(JSON.stringify({ songs }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ songs: [], error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};