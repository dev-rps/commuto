import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation, Clock, Users, ArrowRight, Search as SearchIcon, MapPin, Fuel } from 'lucide-react';
import { searchRides, bookRide } from '../../lib/api';
import { formatDateTime, formatINR, timeUntil } from '../../lib/utils';
import { StatusBadge, Spinner, EmptyState } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SkeletonCard } from '../../components/Skeleton';

export default function AvailableRides() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const toast      = useToast();
  const [rides, setRides]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [sortBy, setSortBy]   = useState('time'); // 'time' | 'price' | 'seats'
  const params = location.state || {};

  useEffect(() => {
    searchRides(params)
      .then(setRides)
      .catch(() => toast.error('Failed to load rides'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBook = async (ride) => {
    setBooking(ride.id);
    try {
      await bookRide(ride.id, params.seats || 1);
      toast.success('Ride booked successfully! 🎉');
      setTimeout(() => navigate('/trips'), 1000);
    } catch (err) {
      toast.error(err.message || 'Failed to book ride');
    } finally { setBooking(null); }
  };

  const sorted = [...rides].sort((a, b) => {
    if (sortBy === 'price') return a.farePerSeat - b.farePerSeat;
    if (sortBy === 'seats') return b.availableSeats - a.availableSeats;
    return new Date(a.departureTime) - new Date(b.departureTime);
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Available Rides</h1>
          <p className="section-desc">Searching for matching carpools...</p>
        </div>
        {[1,2,3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Available Rides</h1>
          <p className="section-desc">{rides.length} matching ride{rides.length !== 1 ? 's' : ''} found</p>
        </div>
        <button onClick={() => navigate('/rides/find')} className="btn-secondary shrink-0">
          <SearchIcon className="w-4 h-4" /> Refine
        </button>
      </div>

      {/* Sort chips */}
      {rides.length > 0 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { key: 'time',  label: '🕐 Earliest' },
            { key: 'price', label: '💰 Cheapest' },
            { key: 'seats', label: '💺 Most seats' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                sortBy === s.key
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="No rides found"
          message="Try adjusting your search — change the date, time, or location."
          action={<button onClick={() => navigate('/rides/find')} className="btn-primary">Search Again</button>}
        />
      ) : (
        <div className="space-y-4 stagger-children">
          {sorted.map((ride) => (
            <div key={ride.id} className="card-hover p-5 group">
              <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                {/* Route info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <StatusBadge status={ride.status} />
                    <span className="text-xs font-medium text-neutral-500">{timeUntil(ride.departureTime)}</span>
                  </div>

                  {/* Route timeline */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="route-line mt-1">
                      <div className="route-dot-start" />
                      <div className="route-connector" />
                      <div className="route-dot-end" />
                    </div>
                    <div className="space-y-2.5">
                      <p className="text-sm font-semibold text-neutral-900">{ride.pickupLoc}</p>
                      <p className="text-sm font-semibold text-neutral-900">{ride.destination}</p>
                    </div>
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(ride.departureTime)}
                    </span>
                    {ride.distanceKm && (
                      <span className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                        <Navigation className="w-3 h-3" />
                        {ride.distanceKm} km
                      </span>
                    )}
                    {ride.vehicle?.fuelEfficiencyKmpl && (
                      <span className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                        <Fuel className="w-3 h-3" />
                        {ride.vehicle.fuelEfficiencyKmpl} km/L
                      </span>
                    )}
                  </div>
                </div>

                {/* Price + book */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-4 lg:border-l lg:border-neutral-100 lg:pl-5">
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-neutral-400 font-medium">per seat</p>
                    <p className="text-2xl font-bold text-neutral-900">{formatINR(ride.farePerSeat)}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                      <Users className="w-3 h-3" />
                      <span className="font-semibold text-neutral-700">{ride.availableSeats}</span>
                      <span>left</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBook(ride)}
                    disabled={booking === ride.id || ride.driverId === user?.id}
                    className="btn-primary shrink-0"
                  >
                    {booking === ride.id ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Booking...
                      </span>
                    ) : ride.driverId === user?.id ? (
                      'Your ride'
                    ) : (
                      <>Book <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
