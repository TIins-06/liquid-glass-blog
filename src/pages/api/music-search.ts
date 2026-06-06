export const prerender = false;
import type { APIRoute } from 'astro';

// Free music search API (NetEase Cloud Music)
const SEARCH_API = 'https://music.163.com/api/search/get';
const DETAIL_API = 'https://music.163.com/api/song/detail';
const SONG_URL_API = 'https://music.163.com/api/song/enhance/player/url';

export const GET: APIRoute = async ({ url }) => {
  const keyword = url.searchParams.get('q') || '';
  const limit = parseInt(url.searchParams.get('limit') || '10');

  if (!keyword) {
    return new Response(JSON.stringify({ songs: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const params = new URLSearchParams({
      s: keyword,
      type: '1',
      limit: String(limit),
      offset: '0',
    });

    const res = await fetch(SEARCH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com/',
      },
      body: params.toString(),
    });

    const data = await res.json();
    const songs = (data.result?.songs || []).map((s: any) => ({
      id: s.id,
      title: s.name,
      artist: (s.artists || []).map((a: any) => a.name).join('/'),
      album: s.album?.name || '',
      duration: s.duration || 0,
      cover: s.album?.picUrl || '',
    }));

    return new Response(JSON.stringify({ songs }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message, songs: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};