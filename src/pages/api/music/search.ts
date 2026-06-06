export const prerender = false;
import type { APIRoute } from 'astro';
import { getSettings } from '../../../lib/kv';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q') || '';
  const sourceType = url.searchParams.get('source') || 'netease';
  if (!q) {
    return new Response(JSON.stringify({ songs: [] }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Get custom source from KV settings
  let customApiUrl = '';
  let customSourceType = 'netease';
  try {
    const settings = await getSettings();
    const sourceConfig = settings.musicSourceConfig || '';
    if (sourceConfig) {
      try {
        const cfg = JSON.parse(sourceConfig);
        customApiUrl = cfg.url || '';
        customSourceType = cfg.type || 'netease';
      } catch {}
    }
  } catch {}

  // If custom lx-music-api source is configured, use it
  if (customApiUrl && customSourceType === 'lx') {
    try {
      const lxResp = await fetch(customApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'musicSearch', params: { keyword: q, page: 1, limit: 20, source: 'kw' } }),
      });
      const lxData = await lxResp.json();
      const songs = (lxData.data || lxData.songs || []).map((s: any) => ({
        id: s.songmid || s.id || String(Date.now()),
        title: s.name || s.songName || '',
        artist: s.singer || s.artist || '',
        album: s.album?.name || s.albumName || '',
        duration: s.interval || s.duration || 0,
        cover: s.album?.pic || s.album?.picUrl || s.pic || '',
        src: s.url || s.src || '',
      }));
      if (songs.length > 0) {
        return new Response(JSON.stringify({ songs, source: 'custom-lx' }), { headers: { 'Content-Type': 'application/json' } });
      }
    } catch {}
  }

  // If a custom API URL is set but not lx type, try direct API
  if (customApiUrl && customSourceType !== 'lx' && customSourceType !== 'netease') {
    try {
      const resp = await fetch(customApiUrl + '?search=' + encodeURIComponent(q) + '&source=' + customSourceType);
      const data = await resp.json();
      const songs = (data.songs || data.data || data.result || []).map((s: any) => ({
        id: s.id || String(Date.now() + Math.random()),
        title: s.name || s.songname || '',
        artist: s.artist || s.singer || '',
        album: s.album || '',
        duration: s.duration || 0,
        cover: s.pic || s.picurl || '',
        src: s.url || s.src || '',
      }));
      return new Response(JSON.stringify({ songs, source: 'custom-api' }), { headers: { 'Content-Type': 'application/json' } });
    } catch {}
  }

  // Default: NeteaseCloudMusic API
  try {
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
    return new Response(JSON.stringify({ songs, source: 'netease' }), { headers: { 'Content-Type': 'application/json' } });
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
      return new Response(JSON.stringify({ songs, source: 'fallback' }), { headers: { 'Content-Type': 'application/json' } });
    } catch {
      return new Response(JSON.stringify({ songs: [], error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }
};
