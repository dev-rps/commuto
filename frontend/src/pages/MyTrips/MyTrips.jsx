import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Navigation, X, ArrowRight, MessageSquare, Filter } from 'lucide-react';
import { getMyBookings, getMyRides, cancelBooking } from '../../lib/api';
import { StatusBadge, EmptyState } from '../../components';
import { SkeletonCard } from '../../components/Skeleton';
import { formatDateTime, formatINR, timeUntil } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

const STATUS_FILTERS = ['All', 'BOOKED', 'IN_PROGRESS', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'];

export default function MyTrips() {
  const navigate = useNavigate();
  const toast    = useToast();
  const [trips, setTrips]       = useState([]);
  const [offered, setOffered]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('booked');
  const [filter, setFilter]     = useState('All');
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
      setTrips((prev) => prev.map((t) => t.id === bookingId ? { ...t, status: 'CANCELLED' } : t));
      toast.success('Booking cancelled');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally { setCancelling(null); }
  };

  const showList = tab === 'booked' ? trips : offered;
  const filtered = filter === 'All' ? showList : showList.filter((item) => {
    const s = tab === 'booked' ? item.status : item.status;
    return s === filter;
  });

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-neutral-900">My Trips</h1>
        <p className="section-desc">Track your booked and offered rides</p>
      </div>

      {/* Tab bar */}
      <div className="tab-bar mb-4">
        <button
          onClick={() => setTab('booked')}
          className={`tab-item ${tab === 'booked' ? 'tab-active' : 'tab-inactive'}`}
        >
          Booked
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${tab === 'booked' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500'}`}>
            {trips.length}
          </span>
        </button>
        <button
          onClick={() => setTab('offered')}
          className={`tab-item ${tab === 'offered' ? 'tab-active' : 'tab-inactive'}`}
        >
          Offered
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${tab === 'offered' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-500'}`}>
            {offered.length}
          </span>
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
              filter === f
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {f === 'All' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map((i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        tab === 'booked' ? (
          <EmptyState icon={Calendar} title="No trips found" message="Find a ride to start carpooling."
            action={<button onClick={() => navigate('/rides/find')} className="btn-primary"><Navigation className="w-4 h-4" /> Find a Ride</button>} />
        ) : (
          <EmptyState icon={Navigation} title="No rides offered" message="Share your commute with colleagues."
            action={<button onClick={() => navigate('/rides/offer')} className="btn-primary"><Navigation className="w-4 h-4" /> Offer a Ride</button>} />
        )
      ) : (
        <div className="space-y-4 stagger-children">
          {filtered.map((item) => {
            const isTrip = tab === 'booked';
            const status = item.status;
            const rideStatus = isTrip ? item.ride?.status : item.status;

            return (
              <div key={item.id} className="card p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={status} />
                    {rideStatus === 'IN_PROGRESS' && (
                      <span className="badge bg-accent-100 text-accent-700 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-600" /> Live
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 shrink-0">
                    {formatDateTime(isTrip ? item.ride?.departureTime : item.departureTime)}
                  </span>
                </div>

                {/* Route */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="route-line mt-1">
                    <div className="route-dot-start" />
                    <div className="route-connector" />
                    <div className="route-dot-end" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-neutral-900">
                      {isTrip ? item.ride?.pickupLoc : item.pickupLoc}
                    </p>
                    <p className="text-sm font-semibold text-neutral-900">
                      {isTrip ? item.ride?.destination : item.destination}
                    </p>
                  </div>
                </div>

                {/* OTP Display for Passengers */}
                {isTrip && item.otp && rideStatus !== 'COMPLETED' && rideStatus !== 'CANCELLED' && (
                  <div className="mb-4 p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-between">
                    <div className="text-sm text-neutral-600">Give this OTP to the driver to start the ride:</div>
                    <div className="text-xl font-bold tracking-[0.2em] bg-white px-3 py-1 rounded-lg border border-neutral-200">
                      {item.otp}
                    </div>
                  </div>
                )}

                {/* Footer meta + actions */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-100 flex-wrap">
                  <div className="flex flex-wrap gap-3 text-xs">
                    {isTrip ? (
                      <>
                        <span className="font-semibold text-neutral-900">{formatINR(item.totalFare)}</span>
                        <span className="text-neutral-500">{item.seatsBooked} seat(s)</span>
                        {item.ride && <span className="text-neutral-400">{timeUntil(item.ride.departureTime)}</span>}
                      </>
                    ) : (
                      <>
                        <span className="font-semibold text-neutral-900">{formatINR(item.farePerSeat)}/seat</span>
                        <span className="text-neutral-500">{item.availableSeats} seats available</span>
                        {item.distanceKm && <span className="text-neutral-400">{item.distanceKm} km</span>}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {(rideStatus === 'IN_PROGRESS' || (!isTrip && (rideStatus === 'PUBLISHED' || rideStatus === 'AT_PICKUP'))) && (
                      <button onClick={() => navigate(`/tracking/${isTrip ? item.rideId : item.id}`)} className="btn-accent">
                        <Navigation className="w-4 h-4" /> {!isTrip && rideStatus !== 'IN_PROGRESS' ? 'Start Ride' : 'Track'}
                      </button>
                    )}
                    {isTrip && status === 'BOOKED' && rideStatus === 'PUBLISHED' && (
                      <button onClick={() => handleCancel(item.id)} disabled={cancelling === item.id}
                        className="btn-secondary text-error border-error/30 hover:bg-error/5">
                        <X className="w-4 h-4" />
                        {cancelling === item.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                    {isTrip && status === 'PAYMENT_PENDING' && (
                      <button onClick={() => navigate('/wallet', { state: { bookingId: item.id } })} className="btn-primary">
                        Pay Now <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                    {rideStatus !== 'COMPLETED' && rideStatus !== 'CANCELLED' && (
                      <button onClick={() => navigate(`/chat/${isTrip ? item.rideId : item.id}`)} className="btn-ghost">
                        <MessageSquare className="w-4 h-4" /> Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
