import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation, Clock, Users, ArrowRight, Search as SearchIcon, Fuel, Star, ShieldCheck, X, Eye, Car, UserCheck } from 'lucide-react';
import { searchRides, bookRide } from '../../lib/api';
import { formatDateTime, formatINR, timeUntil } from '../../lib/utils';
import { StatusBadge, RouteMap, EmptyState } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SkeletonCard } from '../../components/Skeleton';
import { users as mockUsers, bookings as mockBookings } from '../../mocks/mockData';

export default function AvailableRides() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const toast      = useToast();
  const [rides, setRides]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [booking, setBooking]       = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [sortBy, setSortBy]         = useState('time'); // 'time' | 'price' | 'seats'
  const params = location.state || {};

  useEffect(() => {
    searchRides(params)
      .then(setRides)
      .catch(() => toast.error('Failed to load rides'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBook = async (ride) => {
    setBooking(true);
    try {
      await bookRide(ride.id, params.seats || 1);
      toast.success('Ride booked successfully! 🎉');
      setSelectedRide(null);
      setTimeout(() => navigate('/trips'), 1000);
    } catch (err) {
      toast.error(err.message || 'Failed to book ride');
    } finally { setBooking(false); }
  };

  const sorted = [...rides].sort((a, b) => {
    if (sortBy === 'price') return a.farePerSeat - b.farePerSeat;
    if (sortBy === 'seats') return b.availableSeats - a.availableSeats;
    return new Date(a.departureTime) - new Date(b.departureTime);
  });

  // Helper to get co-passengers for selected ride
  const getCoPassengers = (rideId) => {
    if (!rideId) return [];
    const rideBookings = mockBookings.filter((b) => b.rideId === rideId && (b.status === 'BOOKED' || b.status === 'PAYMENT_COMPLETED'));
    return rideBookings.map((b) => {
      const passenger = mockUsers[b.passengerId];
      return {
        id: b.id,
        name: passenger?.name || 'Colleague Passenger',
        seatsBooked: b.seatsBooked,
      };
    });
  };

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
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      {formatDateTime(ride.departureTime)}
                    </span>
                    {ride.distanceKm && (
                      <span className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                        <Navigation className="w-3.5 h-3.5 text-neutral-400" />
                        {ride.distanceKm} km
                      </span>
                    )}
                    {ride.vehicle?.fuelEfficiencyKmpl && (
                      <span className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                        <Fuel className="w-3.5 h-3.5 text-neutral-400" />
                        {ride.vehicle.fuelEfficiencyKmpl} km/L
                      </span>
                    )}
                  </div>
                </div>

                {/* Price + View details */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-4 lg:border-l lg:border-neutral-100 lg:pl-5">
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-neutral-400 font-medium">per seat</p>
                    <p className="text-2xl font-bold text-neutral-900">{formatINR(ride.farePerSeat)}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="font-semibold text-neutral-700">{ride.availableSeats}</span>
                      <span>left</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRide(ride)}
                    className="btn-secondary shrink-0 group-hover:border-primary/40 group-hover:text-primary transition-all"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ride Details Modal */}
      {selectedRide && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto border border-neutral-200 relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedRide.status} />
                <h2 className="text-lg font-bold text-neutral-900">Ride Details</h2>
              </div>
              <button
                onClick={() => setSelectedRide(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Driver & Vehicle Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Driver</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {selectedRide.driver?.name ? selectedRide.driver.name.charAt(0) : 'D'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 leading-tight">
                      {selectedRide.driver?.name || 'Rahul Nair'}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-neutral-700">4.9</span>
                      <span className="text-neutral-400">(24 trips)</span>
                      <ShieldCheck className="w-3 h-3 text-accent ml-1" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-neutral-200 sm:pl-3">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Vehicle</p>
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-neutral-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-neutral-900 leading-tight">
                      {selectedRide.vehicle?.model || 'Maruti Suzuki Swift'}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 font-mono">
                      {selectedRide.vehicle?.registrationNo || 'KA-01-AB-1234'} · {selectedRide.vehicle?.seatingCap || 4} seats
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Route Map Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Route Preview</span>
                <span className="text-xs text-neutral-400 font-medium">
                  {selectedRide.distanceKm ? `${selectedRide.distanceKm} km total` : ''}
                </span>
              </div>
              <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                <RouteMap
                  pickupLat={selectedRide.pickupLat}
                  pickupLng={selectedRide.pickupLng}
                  destLat={selectedRide.destLat}
                  destLng={selectedRide.destLng}
                  height="180px"
                  zoom={11}
                />
              </div>

              <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 mt-2">
                <div className="route-line mt-1 shrink-0">
                  <div className="route-dot-start" />
                  <div className="route-connector" />
                  <div className="route-dot-end" />
                </div>
                <div className="space-y-2 min-w-0 flex-1">
                  <div>
                    <p className="text-[10px] text-neutral-400 font-medium uppercase">Pickup</p>
                    <p className="text-xs font-semibold text-neutral-900 truncate">{selectedRide.pickupLoc}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 font-medium uppercase">Destination</p>
                    <p className="text-xs font-semibold text-neutral-900 truncate">{selectedRide.destination}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booked Co-Passengers List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                Co-Passengers Booked
              </span>
              {getCoPassengers(selectedRide.id).length === 0 ? (
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>No co-passengers yet. Be the first colleague to join this ride!</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {getCoPassengers(selectedRide.id).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center text-[10px]">
                          {p.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-neutral-900">{p.name}</span>
                      </div>
                      <span className="font-medium text-neutral-500 bg-white px-2 py-0.5 rounded-full border border-neutral-200">
                        {p.seatsBooked} seat{p.seatsBooked > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between border-t border-neutral-100 pt-4 gap-4">
              <div>
                <p className="text-xs text-neutral-400 font-medium">Total Fare</p>
                <p className="text-xl font-bold text-neutral-900">{formatINR(selectedRide.farePerSeat)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedRide(null)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBook(selectedRide)}
                  disabled={booking || selectedRide.driverId === user?.id || selectedRide.availableSeats < 1}
                  className="btn-primary text-xs"
                >
                  {booking ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Booking...
                    </span>
                  ) : selectedRide.driverId === user?.id ? (
                    'Your Ride'
                  ) : (
                    <>Book Now <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
