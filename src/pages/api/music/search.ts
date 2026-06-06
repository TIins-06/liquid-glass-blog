export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q') || '';
  if (!q) {
    return new Response(JSON.stringify({ songs: [] }), { headers: { 'Content-Type': 'application/json' } });
  }
  try {
    // Use neteasecloudmusic API with proper headers
    const searchUrl = `https://music.163.com/api/search/get/web?s=${encodeURIComponent(q)}&type=1&limit=20&offset=0`;
    const resp = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://music.163.com/',
        'Accept': 'application/json',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Cookie': 'os=pc; appver=2.10.11;',
      },
    });
    const data = await resp.json();
    const songs = (data?.result?.songs || []).map((s: any) => ({
      id: String(s.id),
      title: s.name,
      artist: (s.artists || []).map((a: any) => a.name).join(', '),
      album: s.album?.name || '',
      duration: Math.floor((s.duration || 0) / 1000),
      cover: s.album?.picUrl ? s.album.picUrl + '?param=200y200' : '',
      src: `https://music.163.com/song/media/outer/url?id=${s.id}.mp3`,
    }));
    return new Response(JSON.stringify({ songs }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    // Fallback: try alternative API
    try {
      const altResp = await fetch(`https://api.lolimi.cn/API/wydg/?msg=${encodeURIComponent(q)}&n=20`);
      const altData = await altResp.json();
      const songs = (altData?.data || []).map((s: any) => ({
        id: s.id || String(Date.now() + Math.random()),
        title: s.name || s.songname || '',
        artist: s.artist || s.singer || '',
        album: s.album || '',
        duration: s.duration || 0,
        cover: s.pic || s.picurl || '',
        src: s.url || s.src || '',
      }));
      return new Response(JSON.stringify({ songs }), { headers: { 'Content-Type': 'application/json' } });
    } catch {
      return new Response(JSON.stringify({ songs: [], error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }
};