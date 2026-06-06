export const prerender = false;
import type { APIRoute } from 'astro';
import { getSettings, setSettings } from '../../lib/kv';

export const GET: APIRoute = async (Astro) => {
  const settings = await getSettings();
  const safe = { ...settings, adminPassword: '***' };
  return new Response(JSON.stringify(safe), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
};

export const PUT: APIRoute = async (Astro) => {
  try {
    const body = await Astro.request.json();
    // Filter out adminPassword to prevent overwriting
    const { adminPassword, ...safeBody } = body;
    await setSettings(safeBody);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
