import { useEffect, useRef } from 'react';

export default function CursorEffect() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't show on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;
    
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    };

    const onClick = (e: MouseEvent) => {
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid var(--accent-1, rgba(124, 58, 237, 0.6));
        transform: translate(-50%, -50%) scale(0);
        pointer-events: none;
        z-index: 9999;
        animation: cursorRipple 0.6s ease-out forwards;
      `;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick);
    animate();

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes cursorRipple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
        @media (pointer: coarse) {
          .cursor-dot, .cursor-ring { display: none !important; }
        }
      `}</style>
      <div
        ref={dotRef}
        className="cursor-dot fixed w-1.5 h-1.5 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ background: 'var(--accent-1, #7c3aed)', mixBlendMode: 'difference' }}
      />
      <div
        ref={ringRef}
        className="cursor-ring fixed w-7 h-7 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ border: '1px solid var(--accent-1-light, rgba(167,139,250,0.4))' }}
      />
    </>
  );
}
