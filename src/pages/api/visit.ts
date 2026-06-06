export const prerender = false;
import type { APIRoute } from 'astro';
import { getSettings, setSetting } from '../../lib/kv';

export const GET: APIRoute = async () => {
  const settings = await getSettings();
  const today = new Date().toISOString().slice(0, 10);
  const lastVisitDate = settings._lastVisitDate || '';
  let todayCount = parseInt(settings._todayVisits || '0');
  let totalCount = parseInt(settings._totalVisits || '0');

  if (lastVisitDate !== today) {
    todayCount = 1;
  } else {
    todayCount += 1;
  }
  totalCount += 1;

  await setSetting('_todayVisits', String(todayCount));
  await setSetting('_totalVisits', String(totalCount));
  await setSetting('_lastVisitDate', today);

  return new Response(JSON.stringify({ today: String(todayCount), total: String(totalCount) }), {
    headers: { 'Content-Type': 'application/json' }
  });
};