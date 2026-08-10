import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Navigation, Car, Wallet, TrendingUp, Users,
  MapPin, BarChart3, Clock, ArrowRight, Leaf, Zap,
  ShieldAlert, Sparkles, Calendar, ChevronRight, CheckCircle2,
  Compass, MessageSquare, Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, getReportSummary } from '../../lib/api';
import { formatINR, formatDateTime } from '../../lib/utils';
import { StatusBadge } from '../../components';
import { SkeletonStatCard, SkeletonCard } from '../../components/Skeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [commuteMode, setCommuteMode] = useState('rider'); // 'rider' | 'driver'
  const [quickDest, setQuickDest] = useState('');

  const isAdmin = user?.role === 'COMPANY_ADMIN';
  const firstName = user?.name?.split(' ')[0] || 'Commuter';

  const load = async () => {
    try {
      const [b, r] = await Promise.all([
        getMyBookings(),
        isAdmin ? getReportSummary() : Promise.resolve(null),
      ]);
      setBookings(b || []);
      if (r) setReport(r);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  useEffect(() => {
    const handleUpdate = () => {
      console.log('[Dashboard] Live update triggered from socket event');
      load();
    };
    window.addEventListener('commuto:update', handleUpdate);
    return () => window.removeEventListener('commuto:update', handleUpdate);
  }, [isAdmin]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickDest.trim()) {
      navigate(`/rides/find?destination=${encodeURIComponent(quickDest.trim())}`);
    } else {
      navigate('/rides/find');
    }
  };

  const quickChips = [
    { label: 'HQ Office', query: 'Tech Park HQ', icon: '🏢' },
    { label: 'Airport T3', query: 'Airport Terminal 3', icon: '✈️' },
    { label: 'Cyber City', query: 'Cyber City Hub', icon: '🏙️' },
    { label: 'Metro Station', query: 'Central Metro', icon: '🚇' },
    { label: 'Saved Places', query: '', icon: '📍', isLink: true, to: '/places' },
  ];

  // Active / Upcoming Ride check
  const activeBooking = bookings.find(
    (b) => b.status === 'CONFIRMED' || b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS'
  );

  const employeeActions = [
    {
      icon: Search,
      label: 'Find a Ride',
      desc: 'Discover poolers near you',
      to: '/rides/find',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      glow: 'rgba(37, 99, 235, 0.3)',
      badge: 'Popular',
      badgeColor: 'bg-blue-100 text-blue-700',
      mode: 'rider',
    },
    {
      icon: Navigation,
      label: 'Offer a Ride',
      desc: 'Share seats & cut fuel costs',
      to: '/rides/offer',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      glow: 'rgba(16, 185, 129, 0.3)',
      badge: 'Earn Credits',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      mode: 'driver',
    },
    {
      icon: Car,
      label: 'My Vehicles',
      desc: 'Manage fleet & EV badges',
      to: '/vehicles',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      glow: 'rgba(245, 158, 11, 0.3)',
      mode: 'driver',
    },
    {
      icon: Wallet,
      label: 'Commuto Wallet',
      desc: `Balance: ${formatINR(user?.walletBalance ?? 0)}`,
      to: '/wallet',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      glow: 'rgba(139, 92, 246, 0.3)',
      badge: formatINR(user?.walletBalance ?? 0),
      badgeColor: 'bg-purple-100 text-purple-700',
      mode: 'all',
    },
  ];

  const filteredActions = employeeActions.filter(
    (action) => action.mode === 'all' || action.mode === commuteMode
  );

  const adminStats = report?.summary ? [
    { icon: BarChart3, label: 'Total Trips',      value: report.summary.totalTrips,                           color: 'var(--gradient-primary)' },
    { icon: MapPin,    label: 'Distance',          value: `${report.summary.totalDistance} km`,                color: 'var(--gradient-accent)' },
    { icon: TrendingUp,label: 'Fuel Cost',         value: formatINR(report.summary.totalFuelCost),            color: 'var(--gradient-warm)' },
    { icon: Users,     label: 'Passengers',        value: report.summary.totalPassengers,                     color: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
  ] : [];

  const employeeStats = [
    { icon: Navigation, label: 'Trips Taken',    value: bookings.length,     color: 'var(--gradient-primary)' },
    { icon: Leaf,       label: 'CO₂ Prevented',  value: `${(bookings.length * 2.3).toFixed(1)} kg`, color: 'var(--gradient-accent)' },
    { icon: Zap,        label: 'Money Saved',    value: formatINR(bookings.length * 60), color: 'var(--gradient-warm)' },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      
      {/* ── Mode Segmented Switcher (Rider vs Driver View for non-admin) ── */}
      {!isAdmin && (
        <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center space-x-1 w-full">
            <button
              onClick={() => setCommuteMode('rider')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 active:scale-95 ${
                commuteMode === 'rider'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Rider View</span>
            </button>
            <button
              onClick={() => setCommuteMode('driver')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 active:scale-95 ${
                commuteMode === 'driver'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Driver View</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Interactive Mobile Hero & Quick Destination Finder Card ────────────────── */}
      <div
        className="rounded-3xl p-5 sm:p-7 text-white relative overflow-hidden transition-all shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%)',
        }}
      >
        {/* Animated background highlights */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 left-10 w-36 h-36 rounded-full bg-emerald-400/20 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 backdrop-blur-md border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
              {getGreeting()}
            </span>
            {user?.organization?.name && (
              <span className="text-[11px] font-medium text-blue-200 bg-black/20 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                🏢 {user.organization.name}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            {firstName} 👋
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-md">
            {isAdmin
              ? `Manage fleet & enterprise carpool stats`
              : commuteMode === 'rider'
              ? 'Find verified corporate rides & share your daily route'
              : 'Publish your upcoming route & share seats with teammates'}
          </p>

          {/* Interactive Quick Destination Finder */}
          {!isAdmin && (
            <div className="mt-4 sm:mt-5">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <MapPin className="w-5 h-5 absolute left-3.5 text-neutral-400 z-10" />
                <input
                  type="text"
                  value={quickDest}
                  onChange={(e) => setQuickDest(e.target.value)}
                  placeholder="Where are you heading today?"
                  className="w-full pl-11 pr-24 py-3 bg-white/95 text-neutral-900 text-xs sm:text-sm font-medium rounded-2xl shadow-lg border border-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 py-2 px-3.5 bg-primary hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Horizontal Scroll Quick Destination Chips */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (chip.isLink) {
                        navigate(chip.to);
                      } else {
                        setQuickDest(chip.query);
                        navigate(`/rides/find?destination=${encodeURIComponent(chip.query)}`);
                      }
                    }}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all"
                  >
                    <span>{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Active / Upcoming Ride Alert Widget (If booking exists) ────────────────── */}
      {!isAdmin && activeBooking && (
        <div className="card p-4 sm:p-5 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white border-2 border-primary/40 shadow-md rounded-3xl animate-scale-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-neutral-900">Active Commute</h3>
            </div>
            <StatusBadge status={activeBooking.status} />
          </div>

          <div className="flex items-center space-x-3 bg-white/80 p-3 rounded-2xl border border-neutral-200/70 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 font-bold text-lg">
              🚗
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-extrabold text-neutral-900 truncate">
                {activeBooking.ride?.pickupLoc} → {activeBooking.ride?.destination}
              </p>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                {formatDateTime(activeBooking.ride?.departureTime)} · {activeBooking.seatsBooked} seat(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => navigate(`/tracking/${activeBooking.rideId}`)}
              className="flex-1 btn-primary py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>Track Live Ride</span>
            </button>
            <button
              onClick={() => navigate(`/chat/${activeBooking.rideId}`)}
              className="btn-secondary py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Employee Interactive Action Grid (Mobile 2x2 Layout) ────────────────── */}
      {!isAdmin && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 stagger-children">
          {filteredActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="card p-4 sm:p-5 text-left group hover:border-primary/40 hover:shadow-lg active:scale-95 transition-all relative overflow-hidden rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-md"
                    style={{ background: action.gradient, boxShadow: `0 4px 14px ${action.glow}` }}
                  >
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  {action.badge && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${action.badgeColor}`}>
                      {action.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold text-neutral-900 text-sm sm:text-base leading-tight group-hover:text-primary transition-colors">
                  {action.label}
                </h3>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">{action.desc}</p>
              </div>

              <div className="flex items-center gap-1 mt-4 text-xs font-bold text-neutral-400 group-hover:text-primary transition-colors">
                <span>Explore</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Quick Stat Cards Grid ────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1,2,3,4].map((i) => <SkeletonStatCard key={i} />)}
        </div>
      ) : (
        <>
          {isAdmin && adminStats.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 stagger-children">
              {adminStats.map((s) => (
                <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} gradient={s.color} />
              ))}
            </div>
          )}
          {!isAdmin && (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 stagger-children">
              {employeeStats.map((s) => (
                <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} gradient={s.color} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Interactive ESG & Green Impact Card ─────────────────────────────── */}
      <div className="card p-5 bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900 text-white shadow-xl rounded-3xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
              <Leaf className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="font-extrabold text-base text-white">ESG Green Commute Impact</h3>
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/40">
                  🏆 Rank #2 in Company
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                Prevented <strong className="text-white font-bold">{(bookings.length * 2.3 + 18.5).toFixed(1)} kg</strong> of CO₂ emissions — equivalent to <strong className="text-emerald-300 font-bold">1.2 trees planted</strong> 🌳
              </p>

              {/* Progress bar towards next ESG milestone */}
              <div className="mt-3 w-full max-w-md">
                <div className="flex justify-between text-[10px] text-emerald-200 mb-1 font-semibold">
                  <span>Milestone Level 3</span>
                  <span>78%</span>
                </div>
                <div className="w-full h-2 bg-emerald-950/60 rounded-full overflow-hidden border border-emerald-500/30 p-0.5">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500 w-[78%]" />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/leaderboard')}
            className="w-full sm:w-auto bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-95 whitespace-nowrap shrink-0"
          >
            <Award className="w-4 h-4" />
            <span>Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Admin Quick Actions ────────────────────────────────────────────── */}
      {isAdmin && (
        <div className="card p-5 rounded-2xl">
          <h3 className="section-title mb-4">Quick Administrative Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'View Reports',   icon: BarChart3,  to: '/reports',        color: 'text-primary' },
              { label: 'Ride History',   icon: Clock,      to: '/rides/history',  color: 'text-amber-600' },
              { label: 'Manage Fleet',   icon: Car,        to: '/vehicles',       color: 'text-emerald-600' },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.to)}
                className="btn-secondary justify-start group py-3 rounded-xl active:scale-95"
              >
                <a.icon className={`w-4.5 h-4.5 ${a.color}`} />
                <span className="font-bold text-xs sm:text-sm">{a.label}</span>
                <ArrowRight className="w-4 h-4 ml-auto text-neutral-300 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Trips Section ──────────────────────────────────────────── */}
      <div className="card rounded-3xl overflow-hidden border border-neutral-200/80 shadow-xs">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h3 className="section-title">Recent Trips</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Your recent carpool activity</p>
          </div>
          <button 
            onClick={() => navigate('/trips')} 
            className="text-xs sm:text-sm text-primary font-extrabold hover:underline flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-primary-50 transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-10 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-3">
              <Navigation className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-neutral-700">No trips recorded yet</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
              Ready to commute eco-friendly? Find your first shared ride today!
            </p>
            <button onClick={() => navigate('/rides/find')} className="btn-primary mt-4 py-2.5 px-5 rounded-xl text-xs font-bold shadow-md">
              <Search className="w-4 h-4" /> Find a Ride
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {bookings.slice(0, 4).map((b) => (
              <div 
                key={b.id} 
                onClick={() => navigate(`/trips`)}
                className="flex items-center gap-3.5 px-4 sm:px-5 py-4 hover:bg-neutral-50/80 active:bg-neutral-100 transition-colors cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Navigation className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-extrabold text-neutral-900 truncate">
                    {b.ride?.pickupLoc} → {b.ride?.destination}
                  </p>
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5 truncate">
                    {formatDateTime(b.ride?.departureTime)} · {b.seatsBooked} seat(s) · <span className="font-bold text-neutral-700">{formatINR(b.totalFare)}</span>
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className="stat-card p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 bg-white shadow-xs hover:shadow-md transition-all">
      <div
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-2 shadow-sm"
        style={{ background: gradient }}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-lg sm:text-xl font-extrabold text-neutral-900 leading-none">{value}</p>
      <p className="text-[11px] text-neutral-500 font-bold mt-1 tracking-tight truncate">{label}</p>
    </div>
  );
}
