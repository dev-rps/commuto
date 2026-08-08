import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from 'lucide-react';

export default function Splash() {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2200);
    const t2 = setTimeout(() => {
      const token = localStorage.getItem('accessToken');
      navigate(token ? '/dashboard' : '/login');
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [navigate]);

  return (
    <div className={`fixed inset-0 bg-primary flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
          <Navigation className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">RideSync</h1>
          <p className="text-primary-100 text-sm mt-2 tracking-wide">Enterprise Carpooling Platform</p>
        </div>
        <div className="w-8 h-8 rounded-full border-[3px] border-white/30 border-t-white animate-spin mt-4" />
      </div>
    </div>
  );
}
