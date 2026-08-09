import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Navigation, Car, Wallet, TrendingUp, Users,
  MapPin, BarChart3, Clock, ArrowRight, Leaf, Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, getReportSummary } from '../../lib/api';
import { formatINR, formatDateTime } from '../../lib/utils';
import { StatusBadge } from '../../components';
import { SkeletonStatCard, SkeletonCard } from '../../components/Skeleton';

function AnimatedNumber({ value }) {
  return <span>{value}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [report, setReport]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const isAdmin = user?.role === 'COMPANY_ADMIN';
  const firstName = user?.name?.split(' ')[0] || 'there';

  const load = async () => {
    try {
      const [b, r] = await Promise.all([
        getMyBookings(),
        isAdmin ? getReportSummary() : Promise.resolve(null),
      ]);
      setBookings(b.slice(0, 4));
      if (r) setReport(r);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally { setLoading(false); }
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

  const employeeActions = [
    {
      icon: Search,
      label: 'Find a Ride',
      desc: 'Browse available carpools',
      to: '/rides/find',
      gradient: 'var(--gradient-primary)',
      glow: 'rgb(37 99 235 / 0.25)',
    },
    {
      icon: Navigation,
      label: 'Offer a Ride',
      desc: 'Publish a trip for colleagues',
      to: '/rides/offer',
      gradient: 'var(--gradient-accent)',
      glow: 'rgb(16 185 129 / 0.25)',
    },
    {
      icon: Car,
      label: 'My Vehicle',
      desc: 'Manage registered cars',
      to: '/vehicles',
      gradient: 'var(--gradient-warm)',
      glow: 'rgb(217 119 6 / 0.25)',
    },
    {
      icon: Wallet,
      label: 'Wallet',
      desc: `Balance: ${formatINR(user?.walletBalance ?? 0)}`,
      to: '/wallet',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      glow: 'rgb(124 58 237 / 0.25)',
    },
  ];

  const adminStats = report?.summary ? [
    { icon: BarChart3, label: 'Total Trips',      value: report.summary.totalTrips,                           color: 'var(--gradient-primary)' },
    { icon: MapPin,    label: 'Distance',          value: `${report.summary.totalDistance} km`,                color: 'var(--gradient-accent)' },
    { icon: TrendingUp,label: 'Fuel Cost',         value: formatINR(report.summary.totalFuelCost),            color: 'var(--gradient-warm)' },
    { icon: Users,     label: 'Passengers',        value: report.summary.totalPassengers,                     color: 'linear-gradient(135deg, #7c3aed, #6d28d9)' },
  ] : [];

  const employeeStats = [
    { icon: Navigation, label: 'Trips Taken',    value: bookings.length,     color: 'var(--gradient-primary)' },
    { icon: Leaf,       label: 'CO₂ Saved',      value: `${(bookings.length * 2.3).toFixed(1)} kg`, color: 'var(--gradient-accent)' },
    { icon: Zap,        label: 'Money Saved',    value: formatINR(bookings.length * 60), color: 'var(--gradient-warm)' },
  ];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* ── Hero welcome banner ───────────────────────────── */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'var(--gradient-hero)', boxShadow: '0 4px 24px rgb(37 99 235 / 0.3)' }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/5 blur-xl" />
        <div className="relative z-10">
          <p className="text-blue-200 text-sm font-medium">{getGreeting()},</p>
          <h1 className="text-3xl font-bold mt-0.5">{firstName} 👋</h1>
          <p className="text-blue-200 text-sm mt-1.5 max-w-md">
            {isAdmin
              ? `Manage ${user?.organization?.name || 'your organization'}'s carpool operations`
              : 'Where would you like to go today?'}
          </p>
        </div>
        {/* Quick action for employees in hero */}
        {!isAdmin && (
          <button
            onClick={() => navigate('/rides/find')}
            className="relative z-10 mt-4 flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all backdrop-blur-sm"
          >
            <Search className="w-4 h-4" /> Find today's ride
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>

      {/* ── Stats row ─────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <SkeletonStatCard key={i} />)}
        </div>
      ) : (
        <>
          {isAdmin && adminStats.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
              {adminStats.map((s) => (
                <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} gradient={s.color} />
              ))}
            </div>
          )}
          {!isAdmin && (
            <div className="grid grid-cols-3 gap-4 stagger-children">
              {employeeStats.map((s) => (
                <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} gradient={s.color} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Employee action cards ─────────────────────────── */}
      {!isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {employeeActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="card-hover p-5 text-left group"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ background: action.gradient, boxShadow: `0 4px 12px ${action.glow}` }}
              >
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">{action.label}</h3>
              <p className="text-xs text-neutral-500 mt-0.5">{action.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-neutral-400 group-hover:text-primary transition-colors">
                <span>Go</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── ESG & Leaderboard Banner ───────────────────────── */}
      <div className="card p-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
            <Leaf className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-white">ESG Green Impact Score</h3>
              <span className="bg-emerald-500/30 text-emerald-200 text-xs px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                Rank #2 in Company
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">
              You have prevented <strong className="text-white">{(bookings.length * 2.3 + 18.5).toFixed(1)} kg</strong> of CO₂ emissions — equal to planting <strong className="text-white">1.2 trees</strong> 🌳
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/leaderboard')}
          className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md whitespace-nowrap"
        >
          <span>View Company Leaderboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Admin quick actions ───────────────────────────── */}
      {isAdmin && (
        <div className="card p-5">
          <h3 className="section-title mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'View Reports',   icon: BarChart3,  to: '/reports',        color: 'text-primary' },
              { label: 'Ride History',   icon: Clock,      to: '/rides/history',  color: 'text-warning' },
              { label: 'Manage Fleet',   icon: Car,        to: '/vehicles',       color: 'text-accent-600' },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.to)}
                className="btn-secondary justify-start group"
              >
                <a.icon className={`w-4 h-4 ${a.color}`} />
                {a.label}
                <ArrowRight className="w-3.5 h-3.5 ml-auto text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}


      {/* ── Recent trips ──────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-neutral-100">
          <h3 className="section-title">Recent Trips</h3>
          <button onClick={() => navigate('/trips')} className="text-sm text-primary font-semibold hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center">
            <Navigation className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-neutral-500">No trips yet</p>
            <p className="text-xs text-neutral-400 mt-1">Find a ride to get started!</p>
            <button onClick={() => navigate('/rides/find')} className="btn-primary mt-4">
              <Search className="w-4 h-4" /> Find a Ride
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'var(--gradient-primary)', boxShadow: '0 2px 8px rgb(37 99 235 / 0.2)' }}
                >
                  <Navigation className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    {b.ride?.pickupLoc} → {b.ride?.destination}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {formatDateTime(b.ride?.departureTime)} · {b.seatsBooked} seat(s) · {formatINR(b.totalFare)}
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
    <div className="stat-card animate-fade-up">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: gradient, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
      >
        <Icon className="w-4.5 h-4.5 text-white" />
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500 font-medium mt-0.5">{label}</p>
    </div>
  );
}
