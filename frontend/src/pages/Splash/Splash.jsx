import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sun,
  Moon,
  Menu,
  X,
  Search,
  Users,
  Wallet,
  Check,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CreditCard,
  Calendar,
  Leaf,
  Zap,
  Sparkles,
  MapPin,
  Bell
} from 'lucide-react';

export default function Splash() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users immediately to dashboard
  useEffect(() => {
    if (!loading && user) {
      const dest = user.role === 'SUPER_ADMIN'
        ? '/superadmin'
        : user.role === 'COMPANY_ADMIN'
        ? '/admin-dashboard'
        : '/dashboard';
      navigate(dest, { replace: true });
    }
  }, [user, loading, navigate]);

  // Dark/Light Theme State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Mobile navigation drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Testimonials / Rider Scenarios Carousel State
  const [activeScenario, setActiveScenario] = useState(0);

  const SCENARIOS = [
    {
      title: "Daily Office Commute",
      description: "Sarah and David both commute from the suburbs to the main tech campus. By sharing a ride, David offsets his gas costs while Sarah gets a comfortable direct ride instead of multiple train transfers.",
      metric: "Save ~$140/month",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      name: "David K. & Sarah M.",
      role: "Engineering & Design at Commuto"
    },
    {
      title: "Cross-Site Meetings",
      description: "Employees traveling between the Downtown Headquarter and the industrial Innovation Hub often go alone in corporate cabs. Commuto lets colleagues match and travel together, driving down inter-office transit expenses.",
      metric: "-45% Corporate Expenses",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
      name: "Marcus G. & Emma L.",
      role: "Operations & HR specialists"
    },
    {
      title: "Eco-Conscious Travel",
      description: "With built-in carbon offset tracking, environmental teams log their shared commutes directly into corporate sustainability reports. Every pooled trip directly helps meet net-zero carbon goals.",
      metric: "Save ~18kg CO2/trip",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
      name: "Elena P. & Team",
      role: "Sustainability Lead"
    }
  ];

  const handleNextScenario = () => {
    setActiveScenario((prev) => (prev + 1) % SCENARIOS.length);
  };

  const handlePrevScenario = () => {
    setActiveScenario((prev) => (prev - 1 + SCENARIOS.length) % SCENARIOS.length);
  };

  // If page is still loading auth state, render a clean loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Smooth scroll handler
  const handleScroll = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 transition-colors duration-300 overflow-x-hidden font-sans">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-400/10 dark:bg-primary-500/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-accent-400/10 dark:bg-accent-500/5 blur-3xl pointer-events-none -z-10" />

      {/* ── HEADER & NAVIGATION ─────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 dark:border-neutral-800/80 dark:bg-neutral-950/80 backdrop-blur-md transition-colors duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-500/20">
              <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                <path d="M8 24 C8 20 12 16 20 16 C28 16 32 20 32 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <rect x="6" y="24" width="28" height="10" rx="4" fill="white" fillOpacity="0.9"/>
                <circle cx="12" cy="34" r="3" fill="white"/>
                <circle cx="28" cy="34" r="3" fill="white"/>
                <path d="M20 8 L23 13 L17 13 Z" fill="white" fillOpacity="0.7"/>
              </svg>
            </div>
            <div>
              <span className="font-sans text-lg font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-primary-800 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                Commuto
              </span>
              <p className="hidden xs:block text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Enterprise Carpooling</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => handleScroll('how-it-works')} className="text-sm font-semibold text-neutral-600 hover:text-primary dark:text-neutral-300 dark:hover:text-white transition-colors">
              How It Works
            </button>
            <button onClick={() => handleScroll('safety')} className="text-sm font-semibold text-neutral-600 hover:text-primary dark:text-neutral-300 dark:hover:text-white transition-colors">
              Safety
            </button>
            <button onClick={() => handleScroll('features')} className="text-sm font-semibold text-neutral-600 hover:text-primary dark:text-neutral-300 dark:hover:text-white transition-colors">
              Features
            </button>
            <button onClick={() => handleScroll('scenarios')} className="text-sm font-semibold text-neutral-600 hover:text-primary dark:text-neutral-300 dark:hover:text-white transition-colors">
              Scenarios
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-300 transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
            </button>

            {/* Login & Get Started */}
            <button
              onClick={() => navigate('/login', { state: { mode: 'login' } })}
              className="text-sm font-bold text-neutral-700 hover:text-primary dark:text-neutral-300 dark:hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/login', { state: { mode: 'signup' } })}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-500/30 transition-all active:scale-[0.98]"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu & Theme Controls */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Mobile Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 w-full bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 animate-fade-in p-6 flex flex-col gap-6 md:hidden">
          <nav className="flex flex-col gap-4">
            <button onClick={() => handleScroll('how-it-works')} className="text-left text-lg font-bold text-neutral-800 dark:text-neutral-200">
              How It Works
            </button>
            <button onClick={() => handleScroll('safety')} className="text-left text-lg font-bold text-neutral-800 dark:text-neutral-200">
              Safety
            </button>
            <button onClick={() => handleScroll('features')} className="text-left text-lg font-bold text-neutral-800 dark:text-neutral-200">
              Features
            </button>
            <button onClick={() => handleScroll('scenarios')} className="text-left text-lg font-bold text-neutral-800 dark:text-neutral-200">
              Scenarios
            </button>
          </nav>
          <hr className="border-neutral-100 dark:border-neutral-800" />
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/login', { state: { mode: 'login' } })}
              className="w-full py-3 rounded-xl border border-neutral-200 font-bold text-center dark:border-neutral-800"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/login', { state: { mode: 'signup' } })}
              className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold text-center"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
              
              {/* Promo badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/50 px-3.5 py-1.5 dark:border-primary-800/40 dark:bg-primary-950/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-300">
                  Now live for daily commuters
                </span>
              </div>

              {/* Title: Share Your Ride, Share The Journey */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-neutral-900 dark:text-white">
                Share Your Ride,<br />
                <span className="bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Share The Journey
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                Connect with verified fellow commuters, split travel costs, reduce emissions, and turn your tedious daily drive into an enjoyable social journey.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/login', { state: { mode: 'signup' } })}
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-4 text-base font-bold text-white shadow-xl shadow-primary-500/20 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary-500/25 transition-all active:scale-[0.98] group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => handleScroll('how-it-works')}
                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 bg-white px-6 py-4 text-base font-bold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all shadow-sm"
                >
                  See How It Works
                </button>
              </div>

              {/* Sub-stats columns */}
              <div className="grid grid-cols-3 gap-6 sm:gap-10 pt-8 border-t border-neutral-100 dark:border-neutral-900 w-full max-w-xl">
                <div>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    Verified
                  </h4>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mt-1">
                    Onboarding
                  </p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    Planned
                  </h4>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mt-1">
                    Shared Trips
                  </p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    Supported
                  </h4>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mt-1">
                    Help & Safety
                  </p>
                </div>
              </div>

            </div>

            {/* Right Hero Phone Mockup */}
            <div className="lg:col-span-5 flex justify-center relative select-none">
              
              {/* Outer glowing design accents */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-gradient-to-tr from-primary-400/20 to-accent-400/10 dark:from-primary-500/10 dark:to-accent-500/5 blur-3xl pointer-events-none" />

              {/* Interactive/Animated Phone Bezel */}
              <div className="relative mx-auto w-[310px] bg-neutral-900 dark:bg-neutral-800 rounded-[50px] p-3 shadow-2xl border-4 border-neutral-800 dark:border-neutral-700 ring-1 ring-white/10 transition-colors">
                
                {/* Internal Screen Frame */}
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-[40px] overflow-hidden relative border border-neutral-200 dark:border-neutral-800 shadow-inner flex flex-col h-[560px]">
                  
                  {/* Phone Header Status Bar */}
                  <div className="bg-neutral-100 dark:bg-neutral-850 px-6 py-3 flex justify-between items-center text-neutral-500 dark:text-neutral-400">
                    <span className="text-[11px] font-bold">9:41</span>
                    {/* Dynamic Island / Notch Mock */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full shadow-inner" />
                    <div className="flex items-center gap-1">
                      <div className="w-3.5 h-2 bg-neutral-400/40 rounded-sm" />
                      <div className="w-3 h-2 bg-neutral-400/40 rounded-sm" />
                      <div className="w-5 h-2.5 bg-neutral-400/70 rounded-[3px]" />
                    </div>
                  </div>

                  {/* App Screen Content */}
                  <div className="p-4 flex-1 flex flex-col gap-3.5 bg-neutral-50 dark:bg-neutral-900 overflow-y-auto">
                    
                    {/* Animated Map Canvas Card */}
                    <div className="h-44 bg-neutral-200 dark:bg-neutral-800/80 rounded-2xl relative overflow-hidden border border-neutral-200 dark:border-neutral-700/60 shadow-sm flex items-center justify-center">
                      
                      {/* Grid background simulation */}
                      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]" style={{
                        backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
                        backgroundSize: '16px 16px'
                      }} />

                      {/* Map Vector SVG with Animated Car Circle */}
                      <svg viewBox="0 0 300 200" className="w-full h-full object-cover z-0">
                        {/* Decorative secondary map route */}
                        <path d="M -20,80 L 140,110 L 320,50" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
                        <path d="M 120,-20 L 120,220" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />

                        {/* Active matching Route Path */}
                        <path id="active-path" d="M 60,140 Q 140,40 180,120 T 250,50" fill="none" stroke="#2563EB" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="5 4" />
                        
                        {/* Start (Green) & End (Red) Dot Markers */}
                        <circle cx="60" cy="140" r="7" fill="#10B981" stroke="white" strokeWidth="2.5" className="shadow-md" />
                        <circle cx="250" cy="50" r="7" fill="#DC2626" stroke="white" strokeWidth="2.5" className="shadow-md" />
                        
                        {/* Glowing ring under travel marker */}
                        <circle r="9" fill="#2563EB" fillOpacity="0.25">
                          <animateMotion dur="7s" repeatCount="indefinite" path="M 60,140 Q 140,40 180,120 T 250,50" />
                        </circle>

                        {/* Animated Travelling Car Blue Circle */}
                        <circle r="5" fill="#2563EB" stroke="white" strokeWidth="1.5">
                          <animateMotion dur="7s" repeatCount="indefinite" path="M 60,140 Q 140,40 180,120 T 250,50" />
                        </circle>
                      </svg>
                      
                      {/* Decorative Location Tags */}
                      <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md bg-white/95 dark:bg-neutral-900/95 shadow-sm text-[9px] font-bold text-neutral-600 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-700/50">
                        📍 Home
                      </div>
                      <div className="absolute top-2.5 right-3 px-2 py-0.5 rounded-md bg-white/95 dark:bg-neutral-900/95 shadow-sm text-[9px] font-bold text-neutral-600 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-700/50">
                        🏢 Office
                      </div>

                    </div>

                    {/* Matched Co-Travelers Section */}
                    <div className="space-y-2.5">
                      
                      {/* Rider 1: Sarah M. */}
                      <div className="bg-white dark:bg-neutral-800 p-3 rounded-xl shadow-sm border border-neutral-200/70 dark:border-neutral-700/60 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                            alt="Sarah M."
                            className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-700"
                          />
                          <div>
                            <h5 className="text-xs font-extrabold text-neutral-800 dark:text-white">Sarah M.</h5>
                            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Design Coordinator</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-accent-500">$12</span>
                          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold mt-0.5">8:15 AM</p>
                        </div>
                      </div>

                      {/* Rider 2: David K. */}
                      <div className="bg-white dark:bg-neutral-800 p-3 rounded-xl shadow-sm border border-neutral-200/70 dark:border-neutral-700/60 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=David"
                            alt="David K."
                            className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-700"
                          />
                          <div>
                            <h5 className="text-xs font-extrabold text-neutral-800 dark:text-white">David K.</h5>
                            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Frontend Architect</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-accent-500">$8</span>
                          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold mt-0.5">8:30 AM</p>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Nav Bar (Simulated UI) */}
                    <div className="mt-auto bg-white dark:bg-neutral-800 rounded-2xl p-2 shadow-md flex justify-around items-center border border-neutral-200/50 dark:border-neutral-700/50">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-500 flex items-center justify-center">
                        <Search className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-500 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-500 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>

                  </div>

                  {/* Floating Notification - Trip Matched */}
                  <div className="absolute top-[184px] -right-5 bg-white dark:bg-neutral-800 py-2.5 px-3.5 rounded-xl shadow-lg border border-neutral-200/80 dark:border-neutral-700 flex items-center gap-3 max-w-[170px] animate-scale-in">
                    <div className="w-8 h-8 bg-accent-500/10 text-accent-600 dark:text-accent-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="leading-tight">
                      <p className="text-[11px] font-extrabold text-neutral-800 dark:text-white">Trip Matched</p>
                      <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium">Route confirmed</p>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Simple Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white mt-2">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-4">
              Commuto matches you seamlessly with other employees, taking the stress out of coordination.
            </p>
          </div>

          {/* 3 Step Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="relative bg-white dark:bg-neutral-800 p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <span className="absolute top-6 right-8 text-6xl font-black text-neutral-100 dark:text-neutral-700 group-hover:text-primary-100 dark:group-hover:text-neutral-600 transition-colors">
                01
              </span>
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                Create or Find a Trip
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                Enter your starting location, work site, and time of travel. Search other trips or create your own ride offer.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white dark:bg-neutral-800 p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <span className="absolute top-6 right-8 text-6xl font-black text-neutral-100 dark:text-neutral-700 group-hover:text-primary-100 dark:group-hover:text-neutral-600 transition-colors">
                02
              </span>
              <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-accent-950 text-accent-600 dark:text-accent-400 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                Match & Connect
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                Our algorithm groups you with colleagues along your route. Chat securely in-app and finalize pickup coordinates.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white dark:bg-neutral-800 p-8 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <span className="absolute top-6 right-8 text-6xl font-black text-neutral-100 dark:text-neutral-700 group-hover:text-primary-100 dark:group-hover:text-neutral-600 transition-colors">
                03
              </span>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                Share & Save
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                Ride together and let Commuto handle the math. Travel expenses are calculated and split automatically inside the app.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── SAFETY FIRST ───────────────────────────────────── */}
      <section id="safety" className="py-20 bg-white dark:bg-neutral-950 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <div className="space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-accent-500">
                Safety First
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white">
                Reliable Safety Built for Your Commute
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                We believe safety leads to better shared trips. Commuto provides integrated security features so you can coordinate with confidence.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                
                {/* 1 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-base">Verified Colleagues</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Profile verification linked directly to corporate credentials.</p>
                  </div>
                </div>

                {/* 2 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-50 dark:bg-accent-950 text-accent-600 dark:text-accent-400 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-base">OTP Trip Start</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Secure ride confirmation via OTP check at time of boarding.</p>
                  </div>
                </div>

                {/* 3 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-base">Live Route Tracking</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Monitor active trips and share live ETAs with emergency contacts.</p>
                  </div>
                </div>

                {/* 4 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white text-base">Emergency SOS</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Instant, in-app emergency alert triggering to company administrators.</p>
                  </div>
                </div>

              </div>

              {/* Badges footer */}
              <div className="flex flex-wrap gap-2.5 pt-6 border-t border-neutral-100 dark:border-neutral-900">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  🔐 Encrypted in Transit
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  🛡️ Active Privacy Controls
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  💬 In-App Live Support
                </span>
              </div>

            </div>

            {/* Right Graphic/Illustration */}
            <div className="relative flex justify-center">
              
              {/* Outer background shape */}
              <div className="absolute inset-0 bg-gradient-to-tr from-accent-500/10 to-primary-500/10 dark:from-accent-500/5 dark:to-primary-500/5 rounded-3xl transform rotate-3" />
              
              <div className="relative w-full max-w-[420px] bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-xl border border-neutral-200/80 dark:border-neutral-700 flex flex-col items-center">
                
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/30 mb-6">
                  <ShieldCheck className="w-12 h-12 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white text-center mb-2">
                  Secure Workspace Isolation
                </h3>
                
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center leading-relaxed mb-6">
                  Unlike public ridesharing apps, Commuto is strictly partitioned by employer. You only ride with verified colleagues belonging to your same organization.
                </p>

                {/* Simulated status cards */}
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-accent-500 rounded-full animate-pulse" />
                      <span className="text-xs font-extrabold text-neutral-800 dark:text-white">Profile Checks Checked</span>
                    </div>
                    <span className="text-[10px] bg-accent-500/10 text-accent-600 dark:text-accent-400 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-accent-500 rounded-full animate-pulse" />
                      <span className="text-xs font-extrabold text-neutral-800 dark:text-white">OTP Verification Enforced</span>
                    </div>
                    <span className="text-[10px] bg-accent-500/10 text-accent-600 dark:text-accent-400 px-2 py-0.5 rounded-full font-bold">READY</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── CORE FEATURES ───────────────────────────────────── */}
      <section id="features" className="py-20 bg-neutral-50 dark:bg-neutral-900 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white mt-2">
              Everything You Need for Smart Commuting
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-4">
              Engineered from the ground up to support employee carpooling requirements.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* 1 */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Smart Ride Matching</h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Algorithm routes matches based on office sites, shifts, geographic proximity, and timing tolerances.
              </p>
            </div>

            {/* 2 */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Real-Time Map ETA</h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Track driver location and live passenger pickups inside the app with integrated map markers.
              </p>
            </div>

            {/* 3 */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">In-App Cashless Splits</h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Automatic expense calculation. Integrated payments and digital wallets eliminate cash issues.
              </p>
            </div>

            {/* 4 */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Verified Profiles</h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Employees are verified via internal company domains before booking. View ratings from previous pools.
              </p>
            </div>

            {/* 5 */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Flexible Scheduling</h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Book recurring weekday rides or set up one-time trips depending on your project team schedules.
              </p>
            </div>

            {/* 6 */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                <Leaf className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Sustainability Dashboard</h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Track your personal and company-wide carbon offsets and fuel reduction metrics in real-time.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── TESTIMONIALS / RIDER SCENARIOS ──────────────────── */}
      <section id="scenarios" className="py-20 bg-white dark:bg-neutral-950 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
              Rider Scenarios
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white mt-2">
              How People Use Commuto
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-4">
              Real-world examples of how employee carpooling helps teams transit efficiently.
            </p>
          </div>

          {/* Slider Container */}
          <div className="max-w-4xl mx-auto relative px-4">
            
            {/* Slide */}
            <div className="bg-neutral-50 dark:bg-neutral-900 p-8 sm:p-12 rounded-3xl border border-neutral-200/60 dark:border-neutral-800/80 transition-all duration-300 flex flex-col md:flex-row gap-8 items-center min-h-[280px]">
              
              {/* Quote / Narrative */}
              <div className="flex-1 space-y-4">
                <span className="inline-block px-3 py-1 text-xs font-bold bg-primary-100 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 rounded-full uppercase tracking-wider">
                  {SCENARIOS[activeScenario].title}
                </span>
                <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                  "{SCENARIOS[activeScenario].description}"
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <img
                    src={SCENARIOS[activeScenario].avatar}
                    alt={SCENARIOS[activeScenario].name}
                    className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-750"
                  />
                  <div>
                    <h5 className="font-extrabold text-neutral-950 dark:text-white text-sm">{SCENARIOS[activeScenario].name}</h5>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">{SCENARIOS[activeScenario].role}</p>
                  </div>
                </div>
              </div>

              {/* Big Metric Box */}
              <div className="w-full md:w-56 bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200/60 dark:border-neutral-700/60 shadow-sm flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-black text-primary-600 dark:text-primary-400">{SCENARIOS[activeScenario].metric.split(' ')[0]}</p>
                <p className="text-xs font-extrabold text-neutral-500 dark:text-neutral-400 mt-2 uppercase tracking-wide">
                  {SCENARIOS[activeScenario].metric.split(' ').slice(1).join(' ')}
                </p>
              </div>

            </div>

            {/* Slider controls */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handlePrevScenario}
                className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm"
                aria-label="Previous scenario"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextScenario}
                className="w-10 h-10 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm"
                aria-label="Next scenario"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Indicator Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {SCENARIOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveScenario(i)}
                  className={`h-2 rounded-full transition-all ${i === activeScenario ? 'w-6 bg-primary' : 'w-2 bg-neutral-300 dark:bg-neutral-700'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-neutral-900 dark:bg-neutral-950 text-neutral-400 border-t border-neutral-800 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
            
            {/* Column 1: Info */}
            <div className="col-span-2 md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                    <path d="M8 24 C8 20 12 16 20 16 C28 16 32 20 32 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    <rect x="6" y="24" width="28" height="10" rx="4" fill="white" fillOpacity="0.9"/>
                    <circle cx="12" cy="34" r="3" fill="white"/>
                    <circle cx="28" cy="34" r="3" fill="white"/>
                  </svg>
                </div>
                <span className="text-white font-extrabold text-lg tracking-tight">Commuto</span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-400 max-w-sm">
                Corporate carpooling platform built to streamline the daily commute. Reduce company carbon footprints and foster team connections.
              </p>
            </div>

            {/* Column 2: Links */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product</h5>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => handleScroll('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => handleScroll('how-it-works')} className="hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => handleScroll('safety')} className="hover:text-white transition-colors">Safety Tools</button></li>
              </ul>
            </div>

            {/* Column 3: Links */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Company</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Column 4: Links */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom Row */}
          <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} Commuto. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">Twitter</a>
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">Instagram</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
