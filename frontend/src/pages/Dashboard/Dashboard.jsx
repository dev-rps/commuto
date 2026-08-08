import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Navigation, Car, Wallet, TrendingUp, Users, MapPin, ChartBar as BarChart3, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getMyBookings, getReportSummary } from '../../lib/api';
import { formatINR, formatDateTime } from '../../lib/utils';
import { StatusBadge, Spinner } from '../../components';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'COMPANY_ADMIN';

  useEffect(() => {
    const load = async () => {
      try {
        const [b, r] = await Promise.all([getMyBookings(), isAdmin ? getReportSummary() : Promise.resolve(null)]);
        setBookings(b.slice(0, 3));
        if (r) setReport(r);
      } finally { setLoading(false); }
    };
    load();
  }, [isAdmin]);

  const employeeActions = [
    { icon: Search, label: 'Find a Ride', desc: 'Search available carpools', to: '/rides/find', color: 'bg-primary-50 text-primary-700' },
    { icon: Navigation, label: 'Offer a Ride', desc: 'Publish a new trip', to: '/rides/offer', color: 'bg-accent-50 text-accent-700' },
    { icon: Car, label: 'My Vehicle', desc: 'Manage your vehicles', to: '/vehicles', color: 'bg-warning/10 text-warning' },
    { icon: Wallet, label: 'Wallet', desc: 'Recharge & pay', to: '/wallet', color: 'bg-neutral-100 text-neutral-700' },
  ];

  if (loading) return <Spinner label="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gradient-to-r from-primary to-primary-700 p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-primary-100 mt-1">{isAdmin ? `Manage ${user?.organization?.name || 'your organization'}'s carpool operations` : 'Where would you like to go today?'}</p>
      </div>

      {!isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {employeeActions.map((action) => (
            <button key={action.label} onClick={() => navigate(action.to)} className="card p-5 text-left hover:shadow-md transition-shadow group">
              <div className={`w-11 h-11 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm">{action.label}</h3>
              <p className="text-xs text-neutral-500 mt-0.5">{action.desc}</p>
              <ArrowRight className="w-4 h-4 text-neutral-400 mt-3 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      )}

      {isAdmin && report?.summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BarChart3} label="Total Trips" value={report.summary.totalTrips} color="text-primary" />
          <StatCard icon={MapPin} label="Total Distance" value={`${report.summary.totalDistance} km`} color="text-accent-600" />
          <StatCard icon={TrendingUp} label="Fuel Cost" value={formatINR(report.summary.totalFuelCost)} color="text-warning" />
          <StatCard icon={Users} label="Passengers" value={report.summary.totalPassengers} color="text-neutral-700" />
        </div>
      )}

      {isAdmin && (
        <div className="card p-6">
          <h3 className="font-semibold text-neutral-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <button onClick={() => navigate('/reports')} className="btn-secondary justify-start"><BarChart3 className="w-4 h-4" /> View Reports</button>
            <button onClick={() => navigate('/rides/history')} className="btn-secondary justify-start"><Clock className="w-4 h-4" /> Ride History</button>
            <button onClick={() => navigate('/vehicles')} className="btn-secondary justify-start"><Car className="w-4 h-4" /> Manage Vehicles</button>
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900">Recent Trips</h3>
          <button onClick={() => navigate('/trips')} className="text-sm text-primary font-medium hover:underline">View all</button>
        </div>
        {bookings.length === 0 ? (
          <p className="text-sm text-neutral-500 py-6 text-center">No trips yet. Find a ride to get started!</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center gap-4 py-3 border-b border-neutral-100 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <Navigation className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{b.ride?.pickupLoc} → {b.ride?.destination}</p>
                  <p className="text-xs text-neutral-500">{formatDateTime(b.ride?.departureTime)} · {b.seatsBooked} seat(s) · {formatINR(b.totalFare)}</p>
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

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5">
      <Icon className={`w-5 h-5 ${color} mb-2`} />
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500 mt-1">{label}</p>
    </div>
  );
}
