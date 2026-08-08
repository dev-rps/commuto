import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 3.5;
      });
    }, 60);

    const t1 = setTimeout(() => setFadeOut(true), 2400);
    const t2 = setTimeout(() => {
      const token = localStorage.getItem('accessToken');
      navigate(token ? '/dashboard' : '/login');
    }, 2900);

    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(interval); };
  }, [navigate]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'var(--gradient-hero)' }}
    >
      {/* Decorative background orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6 animate-scale-in">
        {/* Logo */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
        >
          {/* Car + route icon SVG */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M8 24 C8 20 12 16 20 16 C28 16 32 20 32 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <rect x="6" y="24" width="28" height="10" rx="4" fill="white" fillOpacity="0.9"/>
            <circle cx="12" cy="34" r="3" fill="white"/>
            <circle cx="28" cy="34" r="3" fill="white"/>
            <path d="M20 8 L23 13 L17 13 Z" fill="white" fillOpacity="0.7"/>
          </svg>
        </div>

        {/* Brand text */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">Commuto</h1>
          <p className="text-blue-200 text-sm mt-2 font-medium tracking-widest uppercase">
            Enterprise Carpooling
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Bottom tagline */}
      <p className="absolute bottom-8 text-white/50 text-xs font-medium">
        Smarter commutes. Stronger teams.
      </p>
    </div>
  );
}
