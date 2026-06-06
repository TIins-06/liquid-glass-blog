import { useState, useEffect, useRef } from 'react';

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

  useEffect(() => {
    fetch('/api/music').then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setTracks(data);
    }).catch(() => {});
    const vol = parseFloat(localStorage.getItem('musicVolume') || '0.5');
    setVolume(vol);
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
    // Show a tiny pill to reopen
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-4 right-4 z-50 lg-capsule ripple flex items-center gap-1 px-2 py-1"
        style={{ borderRadius: '100px' }}
        title="显示音乐播放器"
      >
        <span className="text-xs">🎵</span>
      </button>
    );
  }

  const track = tracks[currentTrack];

  if (!expanded) {
    return (
      <div className="music-capsule lg-capsule" onClick={() => setExpanded(true)}>
        <button
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="mc-play"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div className="mc-info">
          <div className="mc-title">{track?.title || '无曲目'}</div>
          <div className="mc-artist">{track?.artist || ''}</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setVisible(false); }}
          className="ml-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text-muted)' }}
          title="隐藏播放器"
        >
          ✕
        </button>
        <div
          className="absolute bottom-0 left-0 h-[2px] rounded-full"
          style={{ width: progress + '%', background: 'linear-gradient(to right, var(--accent-1), var(--accent-2))' }}
        />
      </div>
    );
  }

  return (
    <div className="music-expanded lg-capsule">
      <div className="me-top">
        <div className="me-art">🎵</div>
        <div className="me-info">
          <div className="me-title">{track?.title || '无曲目'}</div>
          <div className="me-artist">{track?.artist || ''}</div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setVisible(false)} className="me-minimize" title="关闭">✕</button>
          <button onClick={() => setExpanded(false)} className="me-minimize" title="最小化">▼</button>
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
