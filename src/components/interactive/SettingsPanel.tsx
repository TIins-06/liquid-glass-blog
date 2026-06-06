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
  { id: 'default', label: '默认', radius: '20px', blur: '0px', tint: 'rgba(255,255,255,0.16)', innerBlur: '20px', innerSpread: '-5px' },
  { id: 'frosted', label: '磨砂', radius: '20px', blur: '8px', tint: 'rgba(255,255,255,0.12)', innerBlur: '12px', innerSpread: '-3px' },
  { id: 'crystal', label: '水晶', radius: '28px', blur: '2px', tint: 'rgba(255,255,255,0.2)', innerBlur: '24px', innerSpread: '-8px' },
  { id: 'minimal', label: '极简', radius: '12px', blur: '0px', tint: 'rgba(255,255,255,0.08)', innerBlur: '8px', innerSpread: '-2px' },
  { id: 'pill', label: '胶囊', radius: '100px', blur: '0px', tint: 'rgba(255,255,255,0.18)', innerBlur: '16px', innerSpread: '-4px' },
];

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
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
    root.style.setProperty('--lg-frost-blur', preset.blur);
    root.style.setProperty('--lg-tint', preset.tint);
    root.style.setProperty('--lg-inner-blur', preset.innerBlur);
    root.style.setProperty('--lg-inner-spread', preset.innerSpread);
    localStorage.setItem('style-preset', preset.id);
    localStorage.setItem('style-values', JSON.stringify(preset));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="lg relative p-6 w-full max-w-sm animate-slide-up max-h-[85vh] overflow-y-auto" style={{ borderRadius: '24px' }}>
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>⚙️ 设置</h2>

        {/* Theme */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>主题模式</span>
          <button onClick={toggleTheme} className="lg-capsule ripple px-3 py-1.5 rounded-full text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {theme === 'dark' ? '🌙 暗色' : '☀️ 亮色'}
          </button>
        </div>

        {/* Color Presets */}
        <div className="mb-4">
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
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${preset.gradient} mb-1`} />
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animations */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>动效开关</span>
          <button onClick={toggleAnimations} className="lg-capsule ripple px-3 py-1.5 rounded-full text-xs font-medium" style={{
            background: animationsEnabled ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${animationsEnabled ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: animationsEnabled ? '#22c55e' : '#ef4444',
          }}>
            {animationsEnabled ? '✨ 开启' : '🚫 关闭'}
          </button>
        </div>

        <hr className="mb-4" style={{ borderColor: 'var(--glass-border)' }} />

        {/* Style Presets */}
        <div className="mb-4">
          <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>控件样式</div>
          <div className="grid grid-cols-3 gap-2">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleStyleChange(preset)}
                className={`lg-capsule ripple px-3 py-2 rounded-full text-[10px] font-medium transition-all ${
                  stylePreset === preset.id ? 'ring-1 ring-white/30' : ''
                }`}
                style={{ color: 'var(--text-primary)', borderRadius: preset.radius }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="mb-4" style={{ borderColor: 'var(--glass-border)' }} />

        {/* Admin Link */}
        <a href="/admin" className="lg-capsule w-full py-2.5 rounded-full text-sm font-medium text-center transition-all block" style={{ color: 'var(--text-primary)' }}>
          ⚙️ 管理后台
        </a>

        <button onClick={() => setIsOpen(false)} className="ripple lg-capsule w-full py-2.5 rounded-full text-sm font-semibold text-white mt-3" style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' }}>
          完成
        </button>
      </div>
    </div>
  );
}