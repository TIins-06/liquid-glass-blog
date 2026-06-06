import { useState, useEffect, useRef, useCallback } from 'react';

interface Track { title: string; artist: string; src: string; }

const DEFAULT_TRACKS: Track[] = [
  { title: 'Ambient Waves', artist: 'Demo Artist', src: '' },
  { title: 'Glass Echoes', artist: 'Liquid Sound', src: '' },
  { title: 'Neon Pulse', artist: 'Synth Wave', src: '' },
];

// Singleton audio element shared across page navigations
let globalAudio: HTMLAudioElement | null = null;
const isBrowser = typeof window !== 'undefined';
let globalTrackIdx = isBrowser ? parseInt(localStorage.getItem('music-track') || '0') : 0;
let globalIsPlaying = isBrowser ? localStorage.getItem('music-playing') === 'true' : false;
let globalVolume = isBrowser ? parseFloat(localStorage.getItem('musicVolume') || '0.5') : 0.5;

function getGlobalAudio() {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.volume = globalVolume;
  }
  return globalAudio;
}

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(globalIsPlaying);
  const [expanded, setExpanded] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(globalTrackIdx);
  const [volume, setVolume] = useState(globalVolume);
  const [progress, setProgress] = useState(0);
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [visible, setVisible] = useState(true);

  // Drag state (shared for both modes)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    fetch('/api/music').then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setTracks(data);
    }).catch(() => {});
    const vol = parseFloat(localStorage.getItem('musicVolume') || '0.5');
    setVolume(vol);
    globalVolume = vol;
    const savedPos = localStorage.getItem('music-player-pos');
    if (savedPos) {
      try { const p = JSON.parse(savedPos); setPosition(p); posRef.current = p; } catch {}
    }
  }, []);

  useEffect(() => {
    const track = tracks[currentTrack];
    if (!track?.src) return;
    const audio = getGlobalAudio();
    localStorage.setItem('music-track', String(currentTrack));
    window.dispatchEvent(new CustomEvent('music-state-change', { detail: { playing: isPlaying, trackIdx: currentTrack } }));
    audio.src = track.src;
    audio.volume = volume;
    audio.load();
    const onTimeUpdate = () => { setCurrentTime(audio.currentTime); setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0); };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => { setCurrentTrack(p => { globalTrackIdx = (p + 1) % tracks.length; return globalTrackIdx; }); setProgress(0); };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    return () => { audio.removeEventListener('timeupdate', onTimeUpdate); audio.removeEventListener('loadedmetadata', onLoadedMetadata); audio.removeEventListener('ended', onEnded); };
  }, [currentTrack, tracks, volume]);

  useEffect(() => {
    const audio = getGlobalAudio();
    globalIsPlaying = isPlaying;
    localStorage.setItem('music-playing', String(isPlaying));
    window.dispatchEvent(new CustomEvent('music-state-change', { detail: { playing: isPlaying, trackIdx: currentTrack } }));
    if (isPlaying) audio.play().catch(() => {}); else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || tracks[currentTrack]?.src) return;
    const interval = setInterval(() => {
      setProgress(p => { if (p >= 100) { setCurrentTrack(t => { globalTrackIdx = (t + 1) % tracks.length; return globalTrackIdx; }); return 0; } return p + 0.5; });
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, tracks]);

  // Listen for play events from sidebar
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.src) {
        const idx = tracks.findIndex(t => t.src === e.detail.src);
        if (idx >= 0) { setCurrentTrack(idx); globalTrackIdx = idx; setIsPlaying(true); }
      }
    };
    window.addEventListener('play-music', handler as EventListener);
    return () => window.removeEventListener('play-music', handler as EventListener);
  }, [tracks]);

  // Drag handlers (works for both mini and expanded)
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, [data-no-drag]')) return;
    dragOffset.current = { x: e.clientX - posRef.current.x, y: e.clientY - posRef.current.y };
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - dragOffset.current.x;
      const y = e.clientY - dragOffset.current.y;
      posRef.current = { x, y };
      setPosition({ x, y });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      localStorage.setItem('music-player-pos', JSON.stringify(posRef.current));
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging]);

  // Touch drag support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button, input, [data-no-drag]')) return;
    const touch = e.touches[0];
    dragOffset.current = { x: touch.clientX - posRef.current.x, y: touch.clientY - posRef.current.y };
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const x = touch.clientX - dragOffset.current.x;
      const y = touch.clientY - dragOffset.current.y;
      posRef.current = { x, y };
      setPosition({ x, y });
    };
    const handleTouchEnd = () => {
      setIsDragging(false);
      localStorage.setItem('music-player-pos', JSON.stringify(posRef.current));
    };
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    return () => { document.removeEventListener('touchmove', handleTouchMove); document.removeEventListener('touchend', handleTouchEnd); };
  }, [isDragging]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const nextTrack = () => { setCurrentTrack(p => { globalTrackIdx = (p + 1) % tracks.length; return globalTrackIdx; }); setProgress(0); };
  const prevTrack = () => { setCurrentTrack(p => { globalTrackIdx = (p - 1 + tracks.length) % tracks.length; return globalTrackIdx; }); setProgress(0); };
  const formatTime = (s: number) => { const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return m + ':' + sec.toString().padStart(2, '0'); };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value);
    const audio = getGlobalAudio();
    if (audio.duration) audio.currentTime = (pct / 100) * audio.duration;
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
  const hasPos = posRef.current.x !== 0 || posRef.current.y !== 0;
  const posStyle: React.CSSProperties = hasPos
    ? { position: 'fixed' as const, left: posRef.current.x, top: posRef.current.y, zIndex: 50 }
    : { position: 'fixed' as const, right: '1rem', bottom: '1rem', zIndex: 50 };

  if (!expanded) {
    return (
      <div
        ref={dragRef}
        className="music-mini-card"
        style={{ ...posStyle, cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        onMouseDown={handleDragStart}
        onTouchStart={handleTouchStart}
      >
        <div className="mmc-top" data-no-drag>
          <div className="mmc-art" onClick={() => setExpanded(true)}>
            <span className="text-xl">🎵</span>
          </div>
          <div className="mmc-meta" onClick={() => setExpanded(true)}>
            <div className="mmc-status">{isPlaying ? '正在播放' : '未在播放'}</div>
            <div className="mmc-title">{track?.title || '无曲目'}</div>
            <div className="mmc-artist">{track?.artist || ''}</div>
          </div>
        </div>
        <div className="mmc-progress" data-no-drag>
          <div className="mmc-progress-bar" style={{ width: progress + '%' }} />
        </div>
        <div className="mmc-controls" data-no-drag>
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
      onMouseDown={handleDragStart}
      onTouchStart={handleTouchStart}
      style={{
        ...posStyle,
        cursor: isDragging ? 'grabbing' : 'default',
        borderRadius: 'var(--card-radius)',
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
          <button onClick={(e) => { e.stopPropagation(); setExpanded(false); setPosition({ x: 0, y: 0 }); posRef.current = { x: 0, y: 0 }; localStorage.removeItem('music-player-pos'); }} className="me-minimize" title="最小化">▼</button>
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