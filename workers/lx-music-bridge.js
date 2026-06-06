# LX Music Source Bridge Worker
# Deploy as separate Cloudflare Worker, then set LX_API_URL in blog's KV settings

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    if (url.pathname === '/api/search') {
      const q = url.searchParams.get('q') || '';
      const source = url.searchParams.get('source') || 'kw';
      if (!q) return Response.json({ songs: [] }, { headers: corsHeaders });
      const lxApiUrl = env.LX_API_URL || 'http://localhost:10001';
      try {
        const resp = await fetch(`${lxApiUrl}/music/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'musicSearch', params: { keyword: q, page: 1, limit: 20, source } })
        });
        const data = await resp.json();
        return Response.json({ songs: data.data || [] }, { headers: corsHeaders });
      } catch (e) {
        return Response.json({ error: e.message, songs: [] }, { status: 500, headers: corsHeaders });
      }
    }

    if (url.pathname === '/api/song') {
      const id = url.searchParams.get('id') || '';
      const source = url.searchParams.get('source') || 'kw';
      const lxApiUrl = env.LX_API_URL || 'http://localhost:10001';
      try {
        const resp = await fetch(`${lxApiUrl}/music/url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'musicUrl', params: { id, source } })
        });
        const data = await resp.json();
        return Response.json({ url: data.data?.url || '' }, { headers: corsHeaders });
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500, headers: corsHeaders });
      }
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  }
};
