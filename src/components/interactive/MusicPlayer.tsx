import { useState, useEffect, useRef, useCallback } from 'react';

interface Track { title: string; artist: string; src: string; cover?: string; }

declare global { interface Window { __bgAudio?: HTMLAudioElement } }

function getAudio(): HTMLAudioElement {
  if (typeof window !== 'undefined' && !window.__bgAudio) {
    window.__bgAudio = new Audio();
  }
  return (typeof window !== 'undefined' ? window.__bgAudio : null) || new Audio();
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

function saveMusicState(src: string, title: string, artist: string) {
  if (!isBrowser()) return;
  sessionStorage.setItem('music-current-src', src);
  sessionStorage.setItem('music-current-title', title);
  sessionStorage.setItem('music-current-artist', artist);
}

function savePlayState(playing: boolean) {
  if (!isBrowser()) return;
  sessionStorage.setItem('music-playing', String(playing));
}

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const inited = useRef(false);
  const playlistRef = useRef<HTMLDivElement>(null);

  const loadPlaylist = useCallback(async () => {
    try {
      const res = await fetch('/api/music');
      const data = await res.json();
      if (Array.isArray(data)) {
        setPlaylist(data.filter((t: Track) => t.src));
      }
    } catch { /* ignore */ }
  }, []);

  const playTrack = useCallback((t: Track) => {
    const audio = getAudio();
    audio.src = t.src;
    audio.volume = volume;
    audio.load();
    audio.play().catch(() => {});
    setPlaying(true);
    setVisible(true);
    setTrack(t);
    savePlayState(true);
    saveMusicState(t.src, t.title, t.artist);
  }, [volume]);

  const next = useCallback(() => {
    if (playlist.length === 0) return;
    const audio = getAudio();
    const curIdx = playlist.findIndex((t) => t.src === audio.src);
    const nextIdx = curIdx >= 0 ? (curIdx + 1) % playlist.length : 0;
    playTrack(playlist[nextIdx]);
  }, [playlist, playTrack]);

  const prev = useCallback(() => {
    if (playlist.length === 0) return;
    const audio = getAudio();
    const curIdx = playlist.findIndex((t) => t.src === audio.src);
    const prevIdx = curIdx > 0 ? curIdx - 1 : playlist.length - 1;
    playTrack(playlist[prevIdx]);
  }, [playlist, playTrack]);

  // Initialize from sessionStorage on client mount
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    loadPlaylist();
    if (isBrowser()) {
      const savedSrc = sessionStorage.getItem('music-current-src');
      const wasPlaying = sessionStorage.getItem('music-playing') === 'true';
      const savedVol = sessionStorage.getItem('music-volume');
      if (savedVol) setVolume(parseFloat(savedVol));
      if (savedSrc) {
        setVisible(true);
        setTrack({
          title: sessionStorage.getItem('music-current-title') || '播放中',
          artist: sessionStorage.getItem('music-current-artist') || '',
          src: savedSrc,
        });
        const audio = getAudio();
        audio.src = savedSrc;
        audio.volume = parseFloat(savedVol || '0.5');
        if (wasPlaying) {
          audio.play().catch(() => {});
          setPlaying(true);
        }
      }
    }
  }, [loadPlaylist]);

  // Sync play/pause state from global audio events
  useEffect(() => {
    const audio = getAudio();
    const syncState = () => setPlaying(!audio.paused);
    audio.addEventListener('play', syncState);
    audio.addEventListener('pause', syncState);
    audio.addEventListener('ended', syncState);
    return () => {
      audio.removeEventListener('play', syncState);
      audio.removeEventListener('pause', syncState);
      audio.removeEventListener('ended', syncState);
    };
  }, []);

  // Audio time tracking
  useEffect(() => {
    const audio = getAudio();
    audio.volume = volume;
    const onTimeUpdate = () => {
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
      setDuration(audio.duration || 0);
      setCurrentTime(audio.currentTime || 0);
    };
    const onEnded = () => next();
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [volume, next]);

  // External play-music event (e.g., clicking a play button elsewhere)
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.src) {
        playTrack({
          title: e.detail.title || '播放中',
          artist: e.detail.artist || '',
          src: e.detail.src,
        });
      }
    };
    window.addEventListener('play-music', handler as EventListener);
    return () => window.removeEventListener('play-music', handler as EventListener);
  }, [playTrack]);

  // Close playlist on outside click
  useEffect(() => {
    if (!showPlaylist) return;
    const handleClick = (e: MouseEvent) => {
      if (playlistRef.current && !playlistRef.current.contains(e.target as Node)) {
        setShowPlaylist(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPlaylist]);

  const togglePlay = () => {
    const audio = getAudio();
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    savePlayState(!playing);
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    const audio = getAudio();
    if (!audio.duration || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (isBrowser()) sessionStorage.setItem('music-volume', String(v));
    const audio = getAudio();
    audio.volume = v;
  };

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  };

  if (!visible) return null;

  return (
    <div className="music-capsule-fixed">
      <div className="music-capsule-inner">
        <div className="mc-track-info" style={{ minWidth: 0, flex: 1, position: 'relative' }} ref={playlistRef}>
          <span className="mc-track-title">{track?.title || '播放中'}</span>
          <span className="mc-track-artist">{track?.artist || ''}</span>
          <button
            onClick={() => { setShowPlaylist(!showPlaylist); if (!showPlaylist) loadPlaylist(); }}
            className="mc-ctrl"
            style={{ fontSize: '0.5rem', padding: '2px 4px', marginLeft: '4px' }}
            title="播放列表"
          >☰</button>
          {showPlaylist && playlist.length > 0 && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 0, marginBottom: 8,
              width: 260, maxHeight: 240, overflowY: 'auto',
              background: 'rgba(20,20,30,0.92)', backdropFilter: 'blur(12px)',
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              padding: '6px 0', zIndex: 10001,
            }}>
              {playlist.map((t, i) => (
                <button
                  key={t.src + i}
                  onClick={() => { playTrack(t); setShowPlaylist(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: track?.src === t.src ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: 'var(--text-primary, #e0e0e0)',
                    border: 'none', padding: '8px 14px', cursor: 'pointer',
                    fontSize: '0.65rem', lineHeight: 1.4, fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = track?.src === t.src ? 'rgba(255,255,255,0.1)' : 'transparent')}
                >
                  <span style={{ fontWeight: track?.src === t.src ? 600 : 400 }}>{t.title}</span>
                  {t.artist && <span style={{ opacity: 0.5, marginLeft: 6 }}>{t.artist}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button onClick={prev} className="mc-ctrl" title="上一曲">⏮</button>
          <button onClick={togglePlay} className="mc-ctrl mc-ctrl-main">{playing ? '⏸' : '▶'}</button>
          <button onClick={next} className="mc-ctrl" title="下一曲">⏭</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.55rem', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          title="音量"
          style={{ width: '3rem', height: '3px', accentColor: 'var(--accent-1)', cursor: 'pointer' }}
        />
        <button onClick={() => { setVisible(false); savePlayState(false); }} className="mc-close" title="关闭">✕</button>
      </div>
      <div style={{ position: 'relative', width: '100%', height: 6, cursor: 'pointer' }} ref={progressRef}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 3,
          background: 'rgba(255,255,255,0.06)',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: progress + '%',
          borderRadius: 3, background: 'var(--accent-1, #7b68ee)',
          transition: 'width 0.1s linear',
        }} />
        <div
          onClick={handleProgressClick}
          style={{
            position: 'absolute', left: 0, right: 0, top: -10, bottom: -10,
            cursor: 'pointer', zIndex: 2,
          }}
          onMouseEnter={e => { e.currentTarget.parentElement!.style.height = '12px'; }}
          onMouseLeave={e => { e.currentTarget.parentElement!.style.height = '6px'; }}
        />
      </div>
    </div>
  );
}