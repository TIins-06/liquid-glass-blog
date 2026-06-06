import { useState, useEffect, useRef } from 'react';

interface Track {
  title: string;
  artist: string;
  src: string;
}

const DEFAULT_TRACKS: Track[] = [
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
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch tracks from API on mount
  useEffect(() => {
    fetch('/api/music')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setTracks(data);
      })
      .catch(() => {});

    const vol = parseFloat(localStorage.getItem('musicVolume') || '0.5');
    setVolume(vol);

    const handler = (e: CustomEvent) => {
      setVolume(e.detail.volume);
      if (audioRef.current) audioRef.current.volume = e.detail.volume;
    };
    window.addEventListener('music-volume-change', handler as EventListener);
    return () => window.removeEventListener('music-volume-change', handler as EventListener);
  }, []);

  // Create/update audio element when track changes
  useEffect(() => {
    const track = tracks[currentTrack];
    if (!track?.src) return;

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.src = track.src;
    audio.volume = volume;
    audio.load();

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      setCurrentTrack(prev => (prev + 1) % tracks.length);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentTrack, tracks, volume]);

  // Play/pause control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !tracks[currentTrack]?.src) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, tracks]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setCurrentTrack(prev => (prev + 1) % tracks.length);
    setProgress(0);
  };

  const prevTrack = () => {
    setCurrentTrack(prev => (prev - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value);
    if (audioRef.current?.duration) {
      audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
    }
    setProgress(pct);
  };

  // Simulate progress for demo tracks (no src)
  useEffect(() => {
    if (!isPlaying || tracks[currentTrack]?.src) return;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { nextTrack(); return 0; }
        return prev + 0.5;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, tracks]);

  if (!visible) return null;
  const track = tracks[currentTrack];

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-2xl px-5 py-3 flex items-center gap-4 min-w-[340px]"
      style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
    >
      <button
        onClick={() => setVisible(false)}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center hover:bg-red-400"
        aria-label="关闭播放器"
      >✕</button>

      {/* Album Art */}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white text-lg shrink-0">
        🎵
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {track?.title || '无曲目'}
        </div>
        <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
          {track?.artist || ''}
        </div>
        {/* Progress Bar with Seek */}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7c3aed ${progress}%, var(--glass-border) ${progress}%)`,
            }}
          />
          <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {duration ? formatTime(duration) : '--:--'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button onClick={prevTrack} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text-secondary)' }} aria-label="上一首">⏮</button>
        <button onClick={togglePlay}
          className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 text-white hover:opacity-80 transition-opacity"
          aria-label={isPlaying ? '暂停' : '播放'}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={nextTrack} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: 'var(--text-secondary)' }} aria-label="下一首">⏭</button>
      </div>
    </div>
  );
}
