import { useState, useEffect, useRef, useCallback } from 'react';

interface Track { title: string; artist: string; src: string; }

const DEFAULT_TRACKS: Track[] = [
  { title: 'Ambient Waves', artist: 'Demo Artist', src: '' },
  { title: 'Glass Echoes', artist: 'Liquid Sound', src: '' },
  { title: 'Neon Pulse', artist: 'Synth Wave', src: '' },
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [visible, setVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Drag state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const hasDragged = useRef(false);

  useEffect(() => {
    fetch('/api/music').then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setTracks(data);
    }).catch(() => {});
    const vol = parseFloat(localStorage.getItem('musicVolume') || '0.5');
    setVolume(vol);
    // Restore position
    const savedPos = localStorage.getItem('music-player-pos');
    if (savedPos) {
      try { setPosition(JSON.parse(savedPos)); } catch {}
    }
  }, []);

  useEffect(() => {
    const track = tracks[currentTrack];
    if (!track?.src) return;
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.src = track.src;
    audio.volume = volume;
    audio.load();
    const onTimeUpdate = () => { setCurrentTime(audio.currentTime); setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0); };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => { setCurrentTrack(p => (p + 1) % tracks.length); setProgress(0); };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    return () => { audio.removeEventListener('timeupdate', onTimeUpdate); audio.removeEventListener('loadedmetadata', onLoadedMetadata); audio.removeEventListener('ended', onEnded); };
  }, [currentTrack, tracks, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !tracks[currentTrack]?.src) return;
    if (isPlaying) audio.play().catch(() => {}); else audio.pause();
  }, [isPlaying, currentTrack, tracks]);

  useEffect(() => {
    if (!isPlaying || tracks[currentTrack]?.src) return;
    const interval = setInterval(() => {
      setProgress(p => { if (p >= 100) { setCurrentTrack(t => (t + 1) % tracks.length); return 0; } return p + 0.5; });
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, tracks]);

  // Listen for play events from sidebar
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.src) {
        const idx = tracks.findIndex(t => t.src === e.detail.src);
        if (idx >= 0) { setCurrentTrack(idx); setIsPlaying(true); }
      }
    };
    window.addEventListener('play-music', handler as EventListener);
    return () => window.removeEventListener('play-music', handler as EventListener);
  }, [tracks]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'INPUT') return;
    const rect = dragRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    setIsDragging(true);
    hasDragged.current = false;
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - dragOffset.current.x;
      const y = e.clientY - dragOffset.current.y;
      if (Math.abs(x - position.x) > 3 || Math.abs(y - position.y) > 3) hasDragged.current = true;
      setPosition({ x, y });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem('music-player-pos', JSON.stringify({ x: dragRef.current?.getBoundingClientRect()?.left || 0, y: dragRef.current?.getBoundingClientRect()?.top || 0 }));
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging, position]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => { setCurrentTrack(p => (p + 1) % tracks.length); setProgress(0); };
  const prevTrack = () => { setCurrentTrack(p => (p - 1 + tracks.length) % tracks.length); setProgress(0); };
  const formatTime = (s: number) => { const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return m + ':' + sec.toString().padStart(2, '0'); };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value);
    if (audioRef.current?.duration) audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
    setProgress(pct);
  };

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="music-hidden-btn fixed bottom-4 right-4 z-50 flex items-center gap-1 px-2.5 py-1.5"
        title="显示音乐播放器"
      >
        <span className="text-xs">🎵</span>
      </button>
    );
  }

  const track = tracks[currentTrack];

  if (!expanded) {
    return (
      <div className="music-mini-card" onClick={() => setExpanded(true)}>
        <div className="mmc-top">
          <div className="mmc-art">
            <span className="text-xl">🎵</span>
          </div>
          <div className="mmc-meta">
            <div className="mmc-status">{isPlaying ? '正在播放' : '未在播放'}</div>
            <div className="mmc-title">{track?.title || '无曲目'}</div>
            <div className="mmc-artist">{track?.artist || ''}</div>
          </div>
        </div>
        <div className="mmc-controls" onClick={(e) => e.stopPropagation()}>
          <button onClick={prevTrack} className="mmc-btn">⏮</button>
          <button onClick={togglePlay} className="mmc-btn mmc-btn-main">{isPlaying ? '⏸' : '▶'}</button>
          <button onClick={nextTrack} className="mmc-btn">⏭</button>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setVisible(false); }}
          className="mmc-close-btn"
          title="隐藏"
        >✕</button>
      </div>
    );
  }

  return (
    <div
      ref={dragRef}
      className="music-expanded glass-card"
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        left: position.x || '50%',
        top: position.y || 'auto',
        bottom: position.y ? 'auto' : '1rem',
        transform: position.x ? 'none' : 'translateX(-50%)',
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none',
        borderRadius: 'var(--card-radius)',
        zIndex: 50,
      }}
    >
      <div className="me-top" style={{ cursor: 'grab' }}>
        <div className="me-art">🎵</div>
        <div className="me-info">
          <div className="me-title">{track?.title || '无曲目'}</div>
          <div className="me-artist">{track?.artist || ''}</div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setVisible(false)} className="me-minimize" title="关闭">✕</button>
          <button onClick={(e) => { e.stopPropagation(); setExpanded(false); setPosition({ x: 0, y: 0 }); }} className="me-minimize" title="最小化">▼</button>
        </div>
      </div>
      <div className="me-progress">
        <span className="me-time">{formatTime(currentTime)}</span>
        <input type="range" min="0" max="100" step="0.1" value={progress} onChange={handleSeek}
          style={{ background: 'linear-gradient(to right, var(--accent-1) ' + progress + '%, rgba(255,255,255,0.15) ' + progress + '%)' }} />
        <span className="me-time">{duration ? formatTime(duration) : '--:--'}</span>
      </div>
      <div className="me-controls">
        <button onClick={prevTrack} className="me-btn me-btn-sm">⏮</button>
        <button onClick={togglePlay} className="me-btn me-btn-main">{isPlaying ? '⏸' : '▶'}</button>
        <button onClick={nextTrack} className="me-btn me-btn-sm">⏭</button>
      </div>
    </div>
  );
}