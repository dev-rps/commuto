import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Navigation, X, ArrowRight } from 'lucide-react';
import { getMyBookings, getMyRides, cancelBooking } from '../../lib/api';
import { StatusBadge, Spinner, EmptyState } from '../../components';
import { formatDateTime, formatINR, timeUntil } from '../../lib/utils';

export default function MyTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [offered, setOffered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('booked');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [b, r] = await Promise.all([getMyBookings(), getMyRides()]);
        setTrips(b); setOffered(r);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleCancel = async (bookingId) => {
    setCancelling(bookingId);
    try {
      await cancelBooking(bookingId);
      setTrips(trips.map((t) => (t.id === bookingId ? { ...t, status: 'CANCELLED' } : t)));
    } catch (err) { alert(err.message || 'Failed to cancel booking'); }
    finally { setCancelling(null); }
  };

  if (loading) return <Spinner label="Loading trips..." />;

  const showTracking = (trip) => trip.ride?.status === 'IN_PROGRESS';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">My Trips</h1>
        <p className="text-sm text-neutral-500 mt-1">Track your booked and offered rides</p>
      </div>
      <div className="flex gap-1 mb-6 border-b border-neutral-200">
        <button onClick={() => setTab('booked')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'booked' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
          Booked ({trips.length})
        </button>
        <button onClick={() => setTab('offered')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'offered' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
          Offered ({offered.length})
        </button>
      </div>

      {tab === 'booked' && trips.length === 0 && (
        <EmptyState icon={Calendar} title="No booked trips" message="Find a ride to start your carpooling journey."
          action={<button onClick={() => navigate('/rides/find')} className="btn-primary">Find a Ride</button>} />
      )}
      {tab === 'offered' && offered.length === 0 && (
        <EmptyState icon={Navigation} title="No offered rides" message="Offer a ride and let colleagues join your carpool."
          action={<button onClick={() => navigate('/rides/offer')} className="btn-primary">Offer a Ride</button>} />
      )}

      {tab === 'booked' && trips.length > 0 && (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={trip.status} />
                  {trip.ride?.status === 'IN_PROGRESS' && <span className="badge bg-accent-100 text-accent-700 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-accent-600" /> Live</span>}
                </div>
                <span className="text-xs text-neutral-500">{formatDateTime(trip.ride?.departureTime)}</span>
              </div>
              <div className="flex items-start gap-3 mb-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <div className="w-0.5 h-6 bg-neutral-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{trip.ride?.pickupLoc}</p>
                  <p className="text-sm font-medium text-neutral-900 mt-2">{trip.ride?.destination}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="text-neutral-500"><span className="font-medium text-neutral-700">{trip.seatsBooked}</span> seat(s)</span>
                  <span className="font-medium text-neutral-900">{formatINR(trip.totalFare)}</span>
                  {trip.ride && <span className="text-neutral-500">{timeUntil(trip.ride.departureTime)}</span>}
                </div>
                <div className="flex gap-2">
                  {showTracking(trip) && <button onClick={() => navigate(`/tracking/${trip.rideId}`)} className="btn-accent"><Navigation className="w-4 h-4" /> Track Live</button>}
                  {trip.status === 'BOOKED' && <button onClick={() => handleCancel(trip.id)} disabled={cancelling === trip.id} className="btn-secondary text-error hover:bg-error/5"><X className="w-4 h-4" />{cancelling === trip.id ? 'Cancelling...' : 'Cancel'}</button>}
                  {trip.status === 'PAYMENT_PENDING' && <button onClick={() => navigate('/wallet', { state: { bookingId: trip.id } })} className="btn-primary">Pay Now <ArrowRight className="w-4 h-4" /></button>}
                  {trip.ride && trip.ride.status !== 'COMPLETED' && trip.ride.status !== 'CANCELLED' && <button onClick={() => navigate(`/chat/${trip.rideId}`)} className="btn-ghost">Chat</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'offered' && offered.length > 0 && (
        <div className="space-y-4">
          {offered.map((ride) => (
            <div key={ride.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={ride.status} />
                  {ride.status === 'IN_PROGRESS' && <span className="badge bg-accent-100 text-accent-700 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-accent-600" /> Live</span>}
                </div>
                <span className="text-xs text-neutral-500">{formatDateTime(ride.departureTime)}</span>
              </div>
              <div className="flex items-start gap-3 mb-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <div className="w-0.5 h-6 bg-neutral-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{ride.pickupLoc}</p>
                  <p className="text-sm font-medium text-neutral-900 mt-2">{ride.destination}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="text-neutral-500"><span className="font-medium text-neutral-700">{ride.availableSeats}</span> seats available</span>
                  <span className="font-medium text-neutral-900">{formatINR(ride.farePerSeat)}/seat</span>
                  <span className="text-neutral-500">{ride.distanceKm ? `${ride.distanceKm} km` : ''}</span>
                </div>
                <div className="flex gap-2">
                  {ride.status === 'IN_PROGRESS' && <button onClick={() => navigate(`/tracking/${ride.id}`)} className="btn-accent"><Navigation className="w-4 h-4" /> Track</button>}
                  <button onClick={() => navigate(`/chat/${ride.id}`)} className="btn-ghost">Chat</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
