export const prerender = false;
import type { APIRoute } from 'astro';
import { getSettings } from '../../lib/kv';

export const POST: APIRoute = async (Astro) => {
  const env = (Astro.locals as any).runtime?.env ?? {};
  const settings = await getSettings(env);
  try {
    const { password } = await Astro.request.json();
    if (password === settings.adminPassword) {
      return new Response(JSON.stringify({ ok: true, token: btoa('admin:' + Date.now()) }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ ok: false, error: '密码错误' }), { status: 401 });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
};
