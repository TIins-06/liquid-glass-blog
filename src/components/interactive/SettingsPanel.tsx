import { useState, useEffect } from 'react';

const COLOR_PRESETS = [
  { id: 'purple', label: '紫罗兰', gradient: 'from-purple-500 to-cyan-400' },
  { id: 'ocean', label: '海洋蓝', gradient: 'from-sky-500 to-cyan-400' },
  { id: 'sunset', label: '日落橙', gradient: 'from-rose-500 to-orange-400' },
  { id: 'forest', label: '森林绿', gradient: 'from-emerald-500 to-green-400' },
  { id: 'lavender', label: '薰衣草', gradient: 'from-violet-500 to-fuchsia-400' },
  { id: 'sakura', label: '樱花粉', gradient: 'from-pink-500 to-rose-400' },
];

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [colorPreset, setColorPreset] = useState('purple');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    const anims = localStorage.getItem('animations') !== 'off';
    const vol = parseFloat(localStorage.getItem('musicVolume') || '0.5');
    const color = localStorage.getItem('color-preset') || 'purple';
    setTheme(saved);
    setAnimationsEnabled(anims);
    setMusicVolume(vol);
    setColorPreset(color);
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setMusicVolume(vol);
    localStorage.setItem('musicVolume', String(vol));
    window.dispatchEvent(new CustomEvent('music-volume-change', { detail: { volume: vol } }));
  };

  const handleColorChange = (id: string) => {
    setColorPreset(id);
    document.documentElement.setAttribute('data-color', id);
    localStorage.setItem('color-preset', id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div
        className="relative glass-strong rounded-2xl p-6 w-full max-w-sm animate-slide-up max-h-[85vh] overflow-y-auto"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
      >
        <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--text-primary)' }}>⚙️ 设置</h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>主题模式</span>
          <button onClick={toggleTheme} className="ripple px-3 py-1.5 rounded-lg text-xs font-medium transition-all glass">
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
                className={`ripple px-3 py-2 rounded-xl text-[10px] font-medium transition-all border ${
                  colorPreset === preset.id ? 'border-white/30 bg-white/10' : 'border-transparent'
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
          <button
            onClick={toggleAnimations}
            className="ripple px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: animationsEnabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${animationsEnabled ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: animationsEnabled ? '#22c55e' : '#ef4444',
            }}
          >
            {animationsEnabled ? '✨ 开启' : '🚫 关闭'}
          </button>
        </div>

        {/* Music Volume */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>音乐音量</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{Math.round(musicVolume * 100)}%</span>
          </div>
          <input
            type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={handleVolumeChange}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, var(--accent-1) ${musicVolume * 100}%, var(--glass-border) ${musicVolume * 100}%)` }}
          />
        </div>

        <hr className="mb-4" style={{ borderColor: 'var(--glass-border)' }} />

        {/* Admin Link */}
        <a href="/admin" className="w-full py-2.5 rounded-xl text-sm font-medium text-center transition-all hover:bg-white/10 mb-3 block glass" style={{ color: 'var(--text-primary)' }}>
          ⚙️ 管理后台
        </a>

        {/* Close */}
        <button onClick={() => setIsOpen(false)} className="ripple w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-80" style={{ background: 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' }}>
          完成
        </button>
      </div>
    </div>
  );
}
