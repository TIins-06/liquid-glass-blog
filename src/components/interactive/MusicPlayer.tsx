import { useState, useEffect, useRef } from 'react';

const DEMO_TRACKS = [
  { title: 'Ambient Waves', artist: 'Demo Artist', src: '' },
  { title: 'Glass Echoes', artist: 'Liquid Sound', src: '' },
  { title: 'Neon Pulse', artist: 'Synth Wave', src: '' },
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const vol = parseFloat(localStorage.getItem('musicVolume') || '0.5');
    setVolume(vol);

    const handler = (e: CustomEvent) => {
      setVolume(e.detail.volume);
      if (audioRef.current) audioRef.current.volume = e.detail.volume;
    };
    window.addEventListener('music-volume-change', handler as EventListener);
    return () => window.removeEventListener('music-volume-change', handler as EventListener);
  }, []);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % DEMO_TRACKS.length);
    setProgress(0);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length);
    setProgress(0);
  };

  // Simulate progress for demo
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextTrack();
          return 0;
        }
        return prev + 0.5;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!visible) return null;

  const track = DEMO_TRACKS[currentTrack];

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl px-5 py-3 flex items-center gap-4 min-w-[320px]"
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
    >
      <button
        onClick={() => setVisible(false)}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center hover:bg-red-400"
        aria-label="关闭播放器"
      >
        ✕
      </button>

      {/* Album Art Placeholder */}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-lg shrink-0">
        🎵
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {track.title}
        </div>
        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
          {track.artist}
        </div>
        {/* Progress Bar */}
        <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--glass-border)' }}>
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={prevTrack}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="上一首"
        >
          ⏮
        </button>
        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 text-white hover:opacity-80 transition-opacity"
          aria-label={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={nextTrack}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="下一首"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
