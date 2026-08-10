import { useState, useEffect } from 'react';
import { Navigation, Car, Leaf, Shield, Sparkles, Zap, RefreshCw, ChevronRight } from 'lucide-react';

const ECO_TRIVIA = [
  {
    icon: Leaf,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
    title: 'Did you know?',
    fact: 'Carpooling 3 days a week cuts personal carbon emissions by over 1.2 metric tons annually!',
  },
  {
    icon: Car,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60',
    title: 'Commute Fact',
    fact: 'Shared rides reduce peak-hour highway congestion by up to 35% in major tech corridors.',
  },
  {
    icon: Zap,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
    title: 'Wallet Savings',
    fact: 'Commuto riders save an average of ₹3,400 monthly on fuel and parking expenses.',
  },
  {
    icon: Shield,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60',
    title: 'Enterprise Safety',
    fact: 'All rides feature live GPS tracking and instant 1-tap SOS emergency alert dispatch.',
  },
];

const WAKEUP_STEPS = [
  'Connecting to Commuto Cloud...',
  'Waking up backend server instances (Render)...',
  'Initializing enterprise security & DB...',
  'Syncing live carpool routes...',
  'Almost ready! Finalizing session...',
];

export function InteractiveColdStartLoader() {
  const [progress, setProgress] = useState(10);
  const [stepIndex, setStepIndex] = useState(0);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [tappedLikes, setTappedLikes] = useState(0);

  // Smooth fake progress bar for Render cold start (takes ~8-15s if sleeping)
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92; // hold at 92 until real auth finishes
        const increment = Math.floor(Math.random() * 8) + 4;
        const next = prev + increment;
        
        // Update step index based on progress
        if (next > 70) setStepIndex(3);
        else if (next > 45) setStepIndex(2);
        else if (next > 20) setStepIndex(1);
        
        return Math.min(next, 92);
      });
    }, 600);

    // Rotate trivia every 4 seconds
    const triviaTimer = setInterval(() => {
      setTriviaIndex((prev) => (prev + 1) % ECO_TRIVIA.length);
    }, 4000);

    return () => {
      clearInterval(progressTimer);
      clearInterval(triviaTimer);
    };
  }, []);

  const CurrentIcon = ECO_TRIVIA[triviaIndex].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white px-4 overflow-hidden select-none">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6 text-center animate-fade-up">
        {/* Brand logo badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Navigation className="w-5 h-5 text-white animate-bounce" strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-extrabold text-white tracking-tight leading-none">Commuto</h1>
            <p className="text-[11px] text-blue-400 font-semibold mt-0.5">Enterprise Carpooling</p>
          </div>
        </div>

        {/* Status card */}
        <div className="card p-6 bg-slate-900/80 border-slate-800 backdrop-blur-2xl rounded-2xl shadow-2xl space-y-5 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Waking Up Cloud Server
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">{progress}%</span>
          </div>

          {/* Animated route progress line */}
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-400 transition-all duration-500 rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/80 animate-pulse rounded-full" />
              </div>
            </div>
            <p className="text-xs font-medium text-slate-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span>{WAKEUP_STEPS[stepIndex]}</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Free cloud servers take ~10 seconds to spin up after periods of inactivity. Thank you for your patience!
            </span>
          </div>
        </div>

        {/* Interactive Eco Trivia Widget */}
        <div className="card p-5 bg-slate-900/60 border-slate-800/80 backdrop-blur-xl rounded-2xl space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Interactive Eco Quiz & Facts ({triviaIndex + 1}/{ECO_TRIVIA.length})
            </span>
            <button
              onClick={() => setTriviaIndex((prev) => (prev + 1) % ECO_TRIVIA.length)}
              className="text-[11px] text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Next tip</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-start gap-3.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${ECO_TRIVIA[triviaIndex].color}`}>
              <CurrentIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">{ECO_TRIVIA[triviaIndex].title}</p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{ECO_TRIVIA[triviaIndex].fact}</p>
            </div>
          </div>

          {/* Interactive Tap-to-boost button while waiting */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Tap to send eco encouragement:</span>
            <button
              type="button"
              onClick={() => setTappedLikes((v) => v + 1)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 active:scale-95 transition-all cursor-pointer"
            >
              <span>🌱 Send Eco Pulse</span>
              {tappedLikes > 0 && <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full font-black text-[10px]">{tappedLikes}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
