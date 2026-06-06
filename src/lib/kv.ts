import type { AstroGlobal } from 'astro';

export interface SiteSettings {
  nickname: string;
  qqNumber: string;
  signature: string;
  avatarUrl: string;
  backgroundUrl: string;
  theme: string;
  animations: boolean | string;
  musicTracks: string;
  musicVolume: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  adminPassword: string;
}

export async function getSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = {
    nickname: 'TIins',
    qqNumber: '807592247',
    signature: '保持热爱，奔赴山海 ✨',
    avatarUrl: 'https://q.qlogo.cn/g?b=qq&nk=807592247&s=100',
    backgroundUrl: '',
    theme: 'dark',
    animations: true,
    musicTracks: JSON.stringify([
      { title: 'Ambient Waves', artist: 'Demo Artist', src: '' },
      { title: 'Glass Echoes', artist: 'Liquid Sound', src: '' },
      { title: 'Neon Pulse', artist: 'Synth Wave', src: '' }
    ]),
    musicVolume: '0.5',
    heroTitle: '液态玻璃',
    heroSubtitle: 'Blog',
    heroDescription: '一个融合了现代设计美学与前沿前端技术的个人博客',
    adminPassword: 'liquid2026'
  };

  try {
    const { env } = await import('cloudflare:workers');
    const kv = (env as any).BLOG_KV;
    if (!kv) return defaults;
    const keys = Object.keys(defaults);
    const results = await Promise.all(keys.map(k => kv.get(`settings:${k}`)));
    const settings = { ...defaults };
    keys.forEach((k, i) => {
      if (results[i] !== null) {
        (settings as any)[k] = results[i];
      }
    });
    return settings;
  } catch {
    return defaults;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { env } = await import('cloudflare:workers');
  const kv = (env as any).BLOG_KV;
  if (!kv) throw new Error('KV not available');
  await kv.put(`settings:${key}`, value);
}

export async function setSettings(settings: Record<string, string>): Promise<void> {
  const { env } = await import('cloudflare:workers');
  const kv = (env as any).BLOG_KV;
  if (!kv) throw new Error('KV not available');
  await Promise.all(
    Object.entries(settings).map(([k, v]) => kv.put(`settings:${k}`, v))
  );
}
