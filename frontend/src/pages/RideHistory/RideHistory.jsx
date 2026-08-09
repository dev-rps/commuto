import { useEffect, useState } from 'react';
import { History, Navigation, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../../lib/api';
import { formatDate, formatDateTime, formatINR } from '../../lib/utils';
import { StatusBadge, EmptyState } from '../../components';
import { SkeletonList } from '../../components/Skeleton';

function groupByMonth(bookings) {
  return bookings.reduce((acc, b) => {
    const key = new Date(b.ride?.departureTime || b.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(b);
    return acc;
  }, {});
}

export default function RideHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getMyBookings()
      .then((b) => setBookings(b.filter((x) => x.status === 'COMPLETED' || x.status === 'PAYMENT_COMPLETED' || x.status === 'CANCELLED')))
      .finally(() => setLoading(false));
  }, []);

  const grouped = groupByMonth(bookings);
  const completed = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'PAYMENT_COMPLETED').length;
  const totalSpent = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'PAYMENT_COMPLETED').reduce((s, b) => s + (b.totalFare || 0), 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Ride History</h1>
        <p className="section-desc">All your past trips in one place</p>
      </div>

      {!loading && bookings.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6 stagger-children">
          {[
            { label: 'Trips Completed', value: completed, gradient: 'var(--gradient-primary)' },
            { label: 'Total Spent',      value: formatINR(totalSpent), gradient: 'var(--gradient-warm)' },
            { label: 'Trips Cancelled',  value: bookings.length - completed, gradient: 'linear-gradient(135deg,#94a3b8,#64748b)' },
          ].map(({ label, value, gradient }) => (
            <div key={label} className="stat-card text-center">
              <p className="text-xl font-bold text-neutral-900 animate-fade-up">{value}</p>
              <p className="text-xs text-neutral-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <SkeletonList count={4} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={History}
          title="No ride history"
          message="Your completed and cancelled trips will appear here."
          action={<button onClick={() => navigate('/rides/find')} className="btn-primary"><Navigation className="w-4 h-4" /> Take your first ride</button>}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{month}</h3>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>
              <div className="space-y-3 stagger-children">
                {items.map((b) => (
                  <div key={b.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-all">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: (b.status === 'COMPLETED' || b.status === 'PAYMENT_COMPLETED') ? 'var(--gradient-accent)' : '#f1f5f9',
                        boxShadow: (b.status === 'COMPLETED' || b.status === 'PAYMENT_COMPLETED') ? '0 2px 8px rgb(16 185 129 / 0.2)' : 'none',
                      }}
                    >
                      <Navigation className={`w-4.5 h-4.5 ${(b.status === 'COMPLETED' || b.status === 'PAYMENT_COMPLETED') ? 'text-white' : 'text-neutral-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {b.ride?.pickupLoc || '—'} → {b.ride?.destination || '—'}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatDateTime(b.ride?.departureTime)} · {b.seatsBooked} seat(s)
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={b.status} />
                      {(b.status === 'COMPLETED' || b.status === 'PAYMENT_COMPLETED') && (
                        <span className="text-sm font-bold text-neutral-900">{formatINR(b.totalFare)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
