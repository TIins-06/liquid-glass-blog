import { useState, useEffect, useRef } from 'react';

interface Track { title: string; artist: string; src: string; cover?: string; }

let globalAudio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio();
  }
  return globalAudio;
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
  const progressRef = useRef<HTMLDivElement>(null);
  const inited = useRef(false);

  // Initialize from sessionStorage on client mount
  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

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
  }, []);

  useEffect(() => {
    const audio = getAudio();
    audio.volume = volume;

    const onTimeUpdate = () => {
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
      setDuration(audio.duration || 0);
      setCurrentTime(audio.currentTime || 0);
    };
    const onEnded = () => {
      window.dispatchEvent(new CustomEvent('music-next'));
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.src) {
        const audio = getAudio();
        audio.src = e.detail.src;
        audio.volume = volume;
        audio.load();
        audio.play().catch(() => {});
        setPlaying(true);
        setVisible(true);
        savePlayState(true);
        const title = e.detail.title || '';
        const artist = e.detail.artist || '';
        saveMusicState(e.detail.src, title, artist);
        setTrack({ title: title || '播放中', artist, src: e.detail.src });
      }
    };
    const nextHandler = () => {
      fetch('/api/music').then(r => r.json()).then(data => {
        if (!Array.isArray(data) || data.length === 0) return;
        const playable = data.filter((t: Track) => t.src);
        if (playable.length === 0) return;
        const audio = getAudio();
        const curIdx = playable.findIndex((t: Track) => t.src === audio.src);
        const nextIdx = curIdx >= 0 ? (curIdx + 1) % playable.length : 0;
        const next = playable[nextIdx];
        audio.src = next.src;
        audio.load();
        audio.play().catch(() => {});
        setTrack(next);
        setPlaying(true);
        setVisible(true);
        savePlayState(true);
        saveMusicState(next.src, next.title, next.artist);
      }).catch(() => {});
    };
    window.addEventListener('play-music', handler as EventListener);
    window.addEventListener('music-next', nextHandler);
    return () => {
      window.removeEventListener('play-music', handler as EventListener);
      window.removeEventListener('music-next', nextHandler);
    };
  }, [volume]);

  const togglePlay = () => {
    const audio = getAudio();
    if (playing) { audio.pause(); } else { audio.play().catch(() => {}); }
    setPlaying(!playing);
    savePlayState(!playing);
  };

  const next = () => {
    window.dispatchEvent(new CustomEvent('music-next'));
  };

  const prev = () => {
    fetch('/api/music').then(r => r.json()).then(data => {
      if (!Array.isArray(data) || data.length === 0) return;
      const playable = data.filter((t: Track) => t.src);
      if (playable.length === 0) return;
      const audio = getAudio();
      const curIdx = playable.findIndex((t: Track) => t.src === audio.src);
      const prevIdx = curIdx > 0 ? curIdx - 1 : playable.length - 1;
      const prev = playable[prevIdx];
      audio.src = prev.src;
      audio.load();
      audio.play().catch(() => {});
      setTrack(prev);
      setPlaying(true);
      setVisible(true);
      savePlayState(true);
      saveMusicState(prev.src, prev.title, prev.artist);
    }).catch(() => {});
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
        <div className="mc-track-info" style={{ minWidth: 0, flex: 1 }}>
          <span className="mc-track-title">{track?.title || '播放中'}</span>
          <span className="mc-track-artist">{track?.artist || ''}</span>
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
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        className="mc-progress"
        style={{ width: progress + '%', cursor: 'pointer' }}
      />
    </div>
  );
}
