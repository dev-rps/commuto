import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navigation, Clock, Users, ArrowRight, Search as SearchIcon } from 'lucide-react';
import { searchRides, bookRide } from '../../lib/api';
import { formatDateTime, formatINR, timeUntil } from '../../lib/utils';
import { StatusBadge, Spinner, EmptyState } from '../../components';
import { useAuth } from '../../context/AuthContext';

export default function AvailableRides() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const params = location.state || {};

  useEffect(() => {
    searchRides(params).then(setRides).catch(() => setError('Failed to load rides')).finally(() => setLoading(false));
  }, []);

  const handleBook = async (ride) => {
    setBooking(ride.id); setError('');
    try {
      await bookRide(ride.id, params.seats || 1);
      navigate('/trips');
    } catch (err) {
      setError(err.message || 'Failed to book ride');
    } finally { setBooking(null); }
  };

  if (loading) return <Spinner label="Searching for rides..." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Available Rides</h1>
        <p className="text-sm text-neutral-500 mt-1">{rides.length} matching ride{rides.length !== 1 ? 's' : ''} found</p>
      </div>
      {error && <div className="rounded-md bg-error/10 px-4 py-3 text-sm text-error font-medium mb-4">{error}</div>}
      {rides.length === 0 ? (
        <EmptyState icon={SearchIcon} title="No rides found" message="Try adjusting your search criteria — change the date, time, or location radius."
          action={<button onClick={() => navigate('/rides/find')} className="btn-primary">Search Again</button>} />
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div key={ride.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <StatusBadge status={ride.status} />
                    <span className="text-xs text-neutral-500">{timeUntil(ride.departureTime)}</span>
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
                  <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{formatDateTime(ride.departureTime)}</span>
                    <span className="flex items-center gap-1.5"><Navigation className="w-4 h-4" />{ride.distanceKm ? `${ride.distanceKm} km` : '—'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4 lg:gap-3 lg:border-l lg:border-neutral-200 lg:pl-6">
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Fare per seat</p>
                    <p className="text-xl font-bold text-neutral-900">{formatINR(ride.farePerSeat)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="w-4 h-4 text-neutral-400" />
                    <span className="font-medium text-neutral-700">{ride.availableSeats}</span>
                    <span className="text-neutral-400">seats left</span>
                  </div>
                  <button onClick={() => handleBook(ride)} disabled={booking === ride.id || ride.driverId === user?.id} className="btn-primary">
                    {booking === ride.id ? 'Booking...' : 'Book Ride'}
                    {booking !== ride.id && <ArrowRight className="w-4 h-4" />}
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
