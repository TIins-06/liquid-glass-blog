import { useState, useEffect, useRef } from 'react';

interface Track { title: string; artist: string; src: string; }

let globalAudio: HTMLAudioElement | null = null;

function getAudio() {
  if (!globalAudio) globalAudio = new Audio();
  return globalAudio;
}

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [track, setTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.src) {
        const audio = getAudio();
        audio.src = e.detail.src;
        audio.volume = parseFloat(localStorage.getItem('musicVolume') || '0.5');
        audio.load();
        audio.play().catch(() => {});
        setPlaying(true);
        setVisible(true);
        // Fetch track info
        fetch('/api/music').then(r => r.json()).then(data => {
          if (Array.isArray(data)) {
            const found = data.find((t: Track) => t.src === e.detail.src);
            if (found) setTrack(found);
          }
        }).catch(() => {});
      }
    };
    window.addEventListener('play-music', handler as EventListener);
    return () => window.removeEventListener('play-music', handler as EventListener);
  }, []);

  useEffect(() => {
    const audio = getAudio();
    const onTimeUpdate = () => setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    const onEnded = () => { setPlaying(false); setProgress(0); };
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => { audio.removeEventListener('timeupdate', onTimeUpdate); audio.removeEventListener('ended', onEnded); };
  }, []);

  const togglePlay = () => {
    const audio = getAudio();
    if (playing) { audio.pause(); } else { audio.play().catch(() => {}); }
    setPlaying(!playing);
  };

  const next = () => {
    fetch('/api/music').then(r => r.json()).then(data => {
      if (!Array.isArray(data) || data.length === 0) return;
      const srcs = data.filter((t: Track) => t.src).map((t: Track) => t.src);
      if (srcs.length === 0) return;
      const audio = getAudio();
      const curIdx = srcs.indexOf(audio.src);
      const nextIdx = (curIdx + 1) % srcs.length;
      audio.src = srcs[nextIdx];
      audio.load();
      audio.play().catch(() => {});
      setTrack(data.find((t: Track) => t.src === srcs[nextIdx]));
      setPlaying(true);
      setVisible(true);
    }).catch(() => {});
  };

  const prev = () => {
    fetch('/api/music').then(r => r.json()).then(data => {
      if (!Array.isArray(data) || data.length === 0) return;
      const srcs = data.filter((t: Track) => t.src).map((t: Track) => t.src);
      if (srcs.length === 0) return;
      const audio = getAudio();
      const curIdx = srcs.indexOf(audio.src);
      const prevIdx = (curIdx - 1 + srcs.length) % srcs.length;
      audio.src = srcs[prevIdx];
      audio.load();
      audio.play().catch(() => {});
      setTrack(data.find((t: Track) => t.src === srcs[prevIdx]));
      setPlaying(true);
      setVisible(true);
    }).catch(() => {});
  };

  if (!visible) return null;

  return (
    <div className="music-capsule-fixed">
      <div className="music-capsule-inner">
        <button onClick={prev} className="mc-ctrl">⏮</button>
        <button onClick={togglePlay} className="mc-ctrl mc-ctrl-main">{playing ? '⏸' : '▶'}</button>
        <button onClick={next} className="mc-ctrl">⏭</button>
        <div className="mc-track-info">
          <span className="mc-track-title">{track?.title || '播放中'}</span>
          <span className="mc-track-artist">{track?.artist || ''}</span>
        </div>
        <button onClick={() => setVisible(false)} className="mc-close" title="关闭">✕</button>
      </div>
      <div className="mc-progress" style={{ width: progress + '%' }} />
    </div>
  );
}