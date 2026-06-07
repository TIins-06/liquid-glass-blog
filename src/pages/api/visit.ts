export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  // Get client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const today = new Date().toISOString().slice(0, 10);
  const ipKey = `visit:${today}:${ip}`;

  try {
    const { env } = await import('cloudflare:workers');
    const kv = (env as any).BLOG_KV;
    if (!kv) {
      return new Response(JSON.stringify({ today: '0', total: '0' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if this IP already visited today
    const alreadyVisited = await kv.get(ipKey);
    const lastVisitDate = await kv.get('visit:lastDate') || '';
    let todayCount = parseInt((await kv.get('visit:todayCount')) || '0');
    let totalCount = parseInt((await kv.get('visit:totalCount')) || '0');

    if (!alreadyVisited) {
      // New visit from this IP today
      todayCount += 1;
      totalCount += 1;
      // Mark this IP as visited today (expire in 48 hours)
      await kv.put(ipKey, '1', { expirationTtl: 172800 });
      await kv.put('visit:todayCount', String(todayCount));
      await kv.put('visit:totalCount', String(totalCount));
      await kv.put('visit:lastDate', today);
    } else {
      // Already visited today, just read current counts
      if (lastVisitDate !== today) {
        // New day - reset today count
        todayCount = 0;
        await kv.put('visit:todayCount', '0');
        await kv.put('visit:lastDate', today);
      }
    }

    return new Response(JSON.stringify({ today: String(todayCount), total: String(totalCount) }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ today: '0', total: '0' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};