import { useState, useEffect, useRef } from 'react';

const COLOR_PRESETS = [
  { id: 'purple', label: '紫罗兰', gradient: 'from-purple-500 to-cyan-400' },
  { id: 'ocean', label: '海洋蓝', gradient: 'from-sky-500 to-cyan-400' },
  { id: 'sunset', label: '日落橙', gradient: 'from-rose-500 to-orange-400' },
  { id: 'forest', label: '森林绿', gradient: 'from-emerald-500 to-green-400' },
  { id: 'lavender', label: '薰衣草', gradient: 'from-violet-500 to-fuchsia-400' },
  { id: 'sakura', label: '樱花粉', gradient: 'from-pink-500 to-rose-400' },
];

const RADIUS_PRESETS = [
  { id: 'sharp', label: '直角', value: '4px' },
  { id: 'small', label: '小圆角', value: '12px' },
  { id: 'medium', label: '中圆角', value: '20px' },
  { id: 'large', label: '大圆角', value: '28px' },
  { id: 'pill', label: '胶囊', value: '100px' },
];

const BLUR_PRESETS = [
  { id: 'none', label: '无模糊', value: '0px' },
  { id: 'light', label: '轻度', value: '8px' },
  { id: 'medium', label: '中度', value: '20px' },
  { id: 'heavy', label: '重度', value: '32px' },
  { id: 'ultra', label: '超强', value: '48px' },
];

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [colorPreset, setColorPreset] = useState('purple');
  const [cardRadius, setCardRadius] = useState('medium');
  const [cardBlur, setCardBlur] = useState('medium');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    const anims = localStorage.getItem('animations') !== 'off';
    const color = localStorage.getItem('color-preset') || 'purple';
    const radius = localStorage.getItem('card-radius') || 'medium';
    const blur = localStorage.getItem('card-blur') || 'medium';
    setTheme(saved);
    setAnimationsEnabled(anims);
    setColorPreset(color);
    setCardRadius(radius);
    setCardBlur(blur);
    applyCardSettings(radius, blur);
  }, []);

  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-settings', handler);
    return () => window.removeEventListener('toggle-settings', handler);
  }, []);

  const applyCardSettings = (radiusId: string, blurId: string) => {
    const root = document.documentElement;
    const radius = RADIUS_PRESETS.find(r => r.id === radiusId)?.value || '20px';
    const blur = BLUR_PRESETS.find(b => b.id === blurId)?.value || '20px';
    root.style.setProperty('--card-radius', radius);
    root.style.setProperty('--card-blur', blur);
  };

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

  const handleRadiusChange = (id: string) => {
    setCardRadius(id);
    localStorage.setItem('card-radius', id);
    applyCardSettings(id, cardBlur);
  };

  const handleBlurChange = (id: string) => {
    setCardBlur(id);
    localStorage.setItem('card-blur', id);
    applyCardSettings(cardRadius, id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="lg relative w-full max-w-sm animate-slide-up max-h-[85vh] overflow-y-auto" style={{ borderRadius: '24px', padding: '1.25rem' }}>
        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>⚙️ 设置</h2>

        <div className="space-y-4">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>主题模式</span>
            <button
              onClick={toggleTheme}
              className="lg-capsule ripple px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', color: 'white' }}
            >
              {theme === 'dark' ? '🌙 暗色' : '☀️ 亮色'}
            </button>
          </div>

          {/* Animations */}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>动效开关</span>
            <button
              onClick={toggleAnimations}
              className="lg-capsule ripple px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: animationsEnabled ? 'linear-gradient(135deg, #10b981, #34d399)' : 'var(--glass-bg)',
                color: animationsEnabled ? 'white' : 'var(--text-muted)',
                border: animationsEnabled ? 'none' : '1px solid var(--glass-border)',
              }}
            >
              {animationsEnabled ? '✨ 开启' : '💫 关闭'}
            </button>
          </div>

          {/* Color Presets */}
          <div>
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>配色方案</div>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleColorChange(preset.id)}
                  className={`ripple px-3 py-2 rounded-full text-xs font-medium transition-all ${
                    colorPreset === preset.id ? 'settings-btn-active' : 'settings-btn'
                  }`}
                >
                  <span className={`inline-block w-3 h-3 rounded-full bg-gradient-to-r ${preset.gradient} mr-1.5 align-middle`} />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card Radius */}
          <div>
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>卡片圆角</div>
            <div className="flex gap-1.5">
              {RADIUS_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleRadiusChange(preset.id)}
                  className={`ripple flex-1 py-1.5 text-[10px] font-medium transition-all ${
                    cardRadius === preset.id ? 'settings-btn-active' : 'settings-btn'
                  }`}
                  style={{ borderRadius: preset.value }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Card Blur */}
          <div>
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>卡片模糊</div>
            <div className="flex gap-1.5">
              {BLUR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleBlurChange(preset.id)}
                  className={`ripple flex-1 py-1.5 text-[10px] font-medium transition-all ${
                    cardBlur === preset.id ? 'settings-btn-active' : 'settings-btn'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-5">
          <a
            href="/admin"
            className="ripple px-4 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))', textDecoration: 'none' }}
          >
            ⚙️ 管理后台
          </a>
          <button
            onClick={() => setIsOpen(false)}
            className="ripple px-4 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' }}
          >
            完成
          </button>
        </div>
      </div>

      <style>{`
        .settings-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          cursor: pointer;
        }
        .settings-btn:hover {
          border-color: var(--accent-1);
        }
        .settings-btn-active {
          background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
          color: white;
          border-color: transparent;
        }
      `}</style>
    </div>
  );
}