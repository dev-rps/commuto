import { useEffect, useState } from 'react';
import { Factory as History, Navigation } from 'lucide-react';
import { getMyBookings, getMyRides } from '../../lib/api';
import { StatusBadge, Spinner, EmptyState } from '../../components';
import { formatDateTime, formatINR } from '../../lib/utils';

export default function RideHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookings, rides] = await Promise.all([getMyBookings(), getMyRides()]);
        // Completed bookings (as passenger)
        const completedBookings = bookings
          .filter((b) => b.status === 'PAYMENT_COMPLETED' || b.status === 'CANCELLED')
          .map((b) => ({ ...b, type: 'passenger', route: `${b.ride?.pickupLoc} → ${b.ride?.destination}`, departureTime: b.ride?.departureTime, distanceKm: b.ride?.distanceKm }));
        // Completed rides (as driver)
        const completedRides = rides
          .filter((r) => r.status === 'COMPLETED' || r.status === 'CANCELLED')
          .map((r) => ({ ...r, type: 'driver', route: `${r.pickupLoc} → ${r.destination}`, departureTime: r.departureTime, distanceKm: r.distanceKm, totalFare: r.farePerSeat * (r.seatingCap - r.availableSeats) }));
        const combined = [...completedBookings, ...completedRides].sort((a, b) => new Date(b.departureTime) - new Date(a.departureTime));
        setHistory(combined);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <Spinner label="Loading ride history..." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Ride History</h1>
        <p className="text-sm text-neutral-500 mt-1">All your completed and cancelled rides</p>
      </div>

      {history.length === 0 ? (
        <EmptyState icon={History} title="No ride history" message="Your completed and cancelled rides will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left font-semibold text-neutral-700 px-4 py-3">Route</th>
                  <th className="text-left font-semibold text-neutral-700 px-4 py-3">Date</th>
                  <th className="text-left font-semibold text-neutral-700 px-4 py-3">Role</th>
                  <th className="text-right font-semibold text-neutral-700 px-4 py-3">Distance</th>
                  <th className="text-right font-semibold text-neutral-700 px-4 py-3">Fare</th>
                  <th className="text-center font-semibold text-neutral-700 px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span className="font-medium text-neutral-900">{item.route}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{formatDateTime(item.departureTime)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${item.type === 'driver' ? 'bg-primary-50 text-primary-700' : 'bg-neutral-100 text-neutral-600'}`}>
                        {item.type === 'driver' ? 'Driver' : 'Passenger'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-600">{item.distanceKm ? `${item.distanceKm} km` : '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-neutral-900">{item.totalFare ? formatINR(item.totalFare) : '—'}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
