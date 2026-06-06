import { useState, useEffect } from 'react';

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.5);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    const anims = localStorage.getItem('animations') !== 'off';
    const vol = parseFloat(localStorage.getItem('musicVolume') || '0.5');
    setTheme(saved);
    setAnimationsEnabled(anims);
    setMusicVolume(vol);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div
        className="relative glass-strong rounded-2xl p-8 w-full max-w-md animate-slide-up"
        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
      >
        <h2
          className="text-xl font-bold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          ⚙️ 设置
        </h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between mb-5">
          <span style={{ color: 'var(--text-secondary)' }}>主题模式</span>
          <button
            onClick={toggleTheme}
            className="ripple px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
            }}
          >
            {theme === 'dark' ? '🌙 暗色' : '☀️ 亮色'}
          </button>
        </div>

        {/* Animations Toggle */}
        <div className="flex items-center justify-between mb-5">
          <span style={{ color: 'var(--text-secondary)' }}>动效开关</span>
          <button
            onClick={toggleAnimations}
            className="ripple px-4 py-2 rounded-lg text-sm font-medium transition-all"
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
            <span style={{ color: 'var(--text-secondary)' }}>音乐音量</span>
            <span style={{ color: 'var(--text-muted)' }}>{Math.round(musicVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVolume}
            onChange={handleVolumeChange}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7c3aed ${musicVolume * 100}%, var(--glass-border) ${musicVolume * 100}%)`,
            }}
          />
        </div>

        {/* Admin Link */}
        <a
          href="/admin"
          className="w-full py-2.5 rounded-xl text-sm font-medium text-center transition-all hover:bg-white/10 mb-3 block"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}
        >
          ⚙️ 管理后台
        </a>

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="ripple w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            color: '#fff',
          }}
        >
          完成
        </button>
      </div>
    </div>
  );
}

