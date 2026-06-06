import { useState, useEffect } from 'react';

const COLOR_PRESETS = [
  { id: 'purple', label: '紫罗兰', gradient: 'from-purple-500 to-cyan-400' },
  { id: 'ocean', label: '海洋蓝', gradient: 'from-sky-500 to-cyan-400' },
  { id: 'sunset', label: '日落橙', gradient: 'from-rose-500 to-orange-400' },
  { id: 'forest', label: '森林绿', gradient: 'from-emerald-500 to-green-400' },
  { id: 'lavender', label: '薰衣草', gradient: 'from-violet-500 to-fuchsia-400' },
  { id: 'sakura', label: '樱花粉', gradient: 'from-pink-500 to-rose-400' },
];

const STYLE_PRESETS = [
  { id: 'default', label: '默认', radius: '20px', frostBlur: '0px', tint: 'rgba(255,255,255,0.16)', innerBlur: '20px', innerSpread: '-5px' },
  { id: 'frosted', label: '磨砂', radius: '20px', frostBlur: '8px', tint: 'rgba(255,255,255,0.12)', innerBlur: '12px', innerSpread: '-3px' },
  { id: 'crystal', label: '水晶', radius: '28px', frostBlur: '2px', tint: 'rgba(255,255,255,0.2)', innerBlur: '24px', innerSpread: '-8px' },
  { id: 'minimal', label: '极简', radius: '12px', frostBlur: '0px', tint: 'rgba(255,255,255,0.08)', innerBlur: '8px', innerSpread: '-2px' },
  { id: 'pill', label: '胶囊', radius: '100px', frostBlur: '0px', tint: 'rgba(255,255,255,0.18)', innerBlur: '16px', innerSpread: '-4px' },
];

type Tab = 'theme' | 'style' | 'services';

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('theme');
  const [theme, setTheme] = useState('dark');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [colorPreset, setColorPreset] = useState('purple');
  const [stylePreset, setStylePreset] = useState('default');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    const anims = localStorage.getItem('animations') !== 'off';
    const color = localStorage.getItem('color-preset') || 'purple';
    const style = localStorage.getItem('style-preset') || 'default';
    setTheme(saved);
    setAnimationsEnabled(anims);
    setColorPreset(color);
    setStylePreset(style);
  }, []);

  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-settings', handler);
    return () => window.removeEventListener('toggle-settings', handler);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const toggleAnimations = () => {
    const next = !animationsEnabled;
    setAnimationsEnabled(next);
    if (next) {
      document.documentElement.removeAttribute('data-no-animations');
      localStorage.setItem('animations', 'on');
    } else {
      document.documentElement.setAttribute('data-no-animations', '');
      localStorage.setItem('animations', 'off');
    }
  };

  const handleColorChange = (id: string) => {
    setColorPreset(id);
    document.documentElement.setAttribute('data-color', id);
    localStorage.setItem('color-preset', id);
  };

  const handleStyleChange = (preset: typeof STYLE_PRESETS[0]) => {
    setStylePreset(preset.id);
    const root = document.documentElement;
    root.style.setProperty('--lg-radius', preset.radius);
    root.style.setProperty('--frost-blur', preset.frostBlur);
    root.style.setProperty('--glass-tint', preset.tint);
    root.style.setProperty('--inner-blur', preset.innerBlur);
    root.style.setProperty('--inner-spread', preset.innerSpread);
    localStorage.setItem('style-preset', preset.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="lg relative w-full max-w-sm animate-slide-up max-h-[85vh] overflow-y-auto" style={{ borderRadius: '24px', padding: '1.25rem' }}>
        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>⚙️ 设置</h2>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-4 p-0.5 rounded-full" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          {([
            { key: 'theme' as Tab, icon: '🎨', label: '外观' },
            { key: 'style' as Tab, icon: '🖌️', label: '控件' },
            { key: 'services' as Tab, icon: '📐', label: '侧边栏' },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${
                tab === t.key ? 'text-white' : ''
              }`}
              style={{
                background: tab === t.key ? 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' : 'transparent',
                color: tab === t.key ? 'white' : 'var(--text-muted)',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Theme Tab */}
        {tab === 'theme' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>主题模式</span>
              <button onClick={toggleTheme} className="lg-capsule ripple px-3 py-1.5 rounded-full text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {theme === 'dark' ? '🌙 暗色' : '☀️ 亮色'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>动效开关</span>
              <button onClick={toggleAnimations} className="lg-capsule ripple px-3 py-1.5 rounded-full text-xs font-medium" style={{
                background: animationsEnabled ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${animationsEnabled ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: animationsEnabled ? '#22c55e' : '#ef4444',
              }}>
                {animationsEnabled ? '✨ 开启' : '🚫 关闭'}
              </button>
            </div>
            <div>
              <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>配色方案</div>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleColorChange(preset.id)}
                    className={`lg-capsule ripple px-3 py-2 rounded-full text-[10px] font-medium transition-all ${
                      colorPreset === preset.id ? 'ring-1 ring-white/30' : ''
                    }`}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${preset.gradient} mb-1`} />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Style Tab */}
        {tab === 'style' && (
          <div className="space-y-4">
            <div>
              <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>控件样式</div>
              <div className="grid grid-cols-3 gap-2">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleStyleChange(preset)}
                    className={`lg-capsule ripple px-3 py-2 text-[10px] font-medium transition-all ${
                      stylePreset === preset.id ? 'ring-1 ring-white/30' : ''
                    }`}
                    style={{ color: 'var(--text-primary)', borderRadius: preset.radius }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>控件预览</div>
              <div className="space-y-2">
                <div className="lg-capsule ripple flex items-center gap-2 px-3 py-2">
                  <span className="text-sm">🌐</span>
                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>服务按钮示例</span>
                </div>
                <div className="lg flex items-center gap-2 px-3 py-2">
                  <span className="text-sm">📝</span>
                  <span className="text-xs" style={{ color: 'var(--text-primary)' }}>文章卡片示例</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {tab === 'services' && (
          <ServicesTab />
        )}

        <div className="flex items-center justify-between mt-4">
          <a href="/admin" className="text-xs px-3 py-1.5 rounded-full" style={{ color: 'var(--accent-1-light)' }}>⚙️ 管理后台</a>
          <button onClick={() => setIsOpen(false)} className="ripple lg-capsule px-4 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' }}>
            完成
          </button>
        </div>
      </div>
    </div>
  );
}

function ServicesTab() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      try {
        setServices(JSON.parse(data.services || '[]'));
      } catch { setServices([]); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const updateService = (i: number, field: string, val: string) => {
    const next = [...services];
    next[i] = { ...next[i], [field]: val };
    setServices(next);
  };

  const addService = () => {
    setServices([...services, { icon: '🌐', title: '新服务', desc: '描述', url: 'https://', color: 'from-gray-500/20 to-gray-500/20', copyable: false, copyUrl: '' }]);
  };

  const removeService = (i: number) => {
    setServices(services.filter((_, idx) => idx !== i));
  };

  const saveServices = async () => {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: JSON.stringify(services) }),
      });
      alert('侧边栏服务已保存！');
    } catch { alert('保存失败'); }
  };

  if (loading) return <div className="text-xs" style={{ color: 'var(--text-muted)' }}>加载中...</div>;

  return (
    <div className="space-y-3">
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>自定义侧边栏服务</div>
      {services.map((s, i) => (
        <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{s.icon} {s.title}</span>
            <button onClick={() => removeService(i)} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">🗑️</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={s.icon} onChange={(e) => updateService(i, 'icon', e.target.value)} className="service-input text-xs" placeholder="图标" />
            <input value={s.title} onChange={(e) => updateService(i, 'title', e.target.value)} className="service-input text-xs" placeholder="标题" />
            <input value={s.desc} onChange={(e) => updateService(i, 'desc', e.target.value)} className="service-input text-xs" placeholder="描述" />
            <input value={s.url} onChange={(e) => updateService(i, 'url', e.target.value)} className="service-input text-xs" placeholder="链接" />
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <button onClick={addService} className="lg-capsule ripple px-3 py-1.5 rounded-full text-xs" style={{ color: 'var(--text-primary)' }}>➕ 添加</button>
        <button onClick={saveServices} className="ripple px-3 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' }}>💾 保存</button>
      </div>
    </div>
  );
}
