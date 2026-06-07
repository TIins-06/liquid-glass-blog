import type { AstroGlobal } from 'astro';

export interface SiteSettings {
  // Profile
  nickname: string;
  qqNumber: string;
  signature: string;
  avatarUrl: string;
  // Appearance
  backgroundUrl: string;
  theme: string;
  animations: boolean | string;
  musicTracks: string;
  musicVolume: string;
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroEmoji: string;
  heroTagline: string;
  // Sidebar
  services: string;
  sidebarTitle: string;
  // Footer
  footerText: string;
  footerTechBadge: string;
  // Section Labels
  sectionBlogsTitle: string;
  sectionBlogsBarColor: string;
  sectionTechTitle: string;
  sectionTechBarColor: string;
  // Misc
  adminPassword: string;
  musicSourceConfig: string;
  articles: string;
  customCss: string;
  cardRadius: string;
  cardBlur: string;
  recommendedArticles: string;
}

export async function getSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = {
    nickname: 'TIins',
    qqNumber: '807592247',
    signature: '保持热爱，奔赴山海 ✨',
    avatarUrl: '',
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
    heroEmoji: '👋',
    heroTagline: 'Hi, Welcome! I\'m %s!',
    services: JSON.stringify([
      { icon: '🌐', title: 'Tunnel VPN', desc: '安全代理服务', url: 'https://cc.likegz.dpdns.org/admin', color: 'from-blue-500/20 to-cyan-500/20', copyable: true, copyUrl: '' },
      { icon: '🖼️', title: 'Telegraph 图床', desc: '高速图片托管', url: 'https://image.hiokt.dpdns.org', color: 'from-green-500/20 to-emerald-500/20' },
      { icon: '📺', title: 'MoonTV 影视', desc: '在线影视平台', url: 'https://moon.hiokt.dpdns.org', color: 'from-purple-500/20 to-pink-500/20' },
      { icon: '📋', title: 'SubTracker 订阅', desc: '订阅管理平台', url: 'https://sub.hiokt.dpdns.org', color: 'from-orange-500/20 to-yellow-500/20' },
    ]),
    sidebarTitle: 'Services',
    footerText: 'Stay curious. Thanks for dropping by. 👋',
    footerTechBadge: 'Built with Astro 6',
    sectionBlogsTitle: 'Latest Blogs',
    sectionBlogsBarColor: 'accent-1',
    sectionTechTitle: 'Tech Stack',
    sectionTechBarColor: 'accent-2',
    adminPassword: 'liquid2026',
    musicSourceConfig: '',
    articles: '[]',
    customCss: '',
    cardRadius: 'medium',
    cardBlur: 'medium',
    recommendedArticles: '[]',
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



