import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Calendar, Clock, Users, Check, ArrowLeft, Car } from 'lucide-react';
import { RouteMap } from '../../components';
import { haversineKm, formatINR } from '../../lib/utils';

export default function RouteConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) { navigate('/rides/find'); return null; }

  const { pickupLoc, destination, pickupLat, pickupLng, destLat, destLng, date, time, seats, mode, vehicleId, farePerSeat, availableSeats } = data;
  const distance = haversineKm(pickupLat, pickupLng, destLat, destLng);

  const handleConfirm = () => {
    if (mode === 'search') navigate('/rides/available', { state: { pickupLat, pickupLng, destLat, destLng, date, seats } });
    else navigate('/rides/offer', { state: { ...data, confirmedDistance: distance } });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Route Confirmation</h1>
        <p className="text-sm text-neutral-500 mt-1">{mode === 'search' ? 'Review your route before searching' : 'Review your route before publishing'}</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <RouteMap pickupLat={pickupLat} pickupLng={pickupLng} destLat={destLat} destLng={destLng} height="450px" zoom={11} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-neutral-900 mb-4">Trip Details</h3>
            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary-100" />
                <div className="w-0.5 h-8 bg-neutral-200" />
                <div className="w-3 h-3 rounded-full bg-accent border-2 border-accent-100" />
              </div>
              <div className="flex-1 -mt-0.5">
                <p className="text-xs text-neutral-500">Pickup</p>
                <p className="text-sm font-medium text-neutral-900">{pickupLoc}</p>
                <p className="text-xs text-neutral-500 mt-3">Destination</p>
                <p className="text-sm font-medium text-neutral-900">{destination}</p>
              </div>
            </div>
          </div>
          <div className="card p-5 space-y-3">
            <DetailRow icon={Navigation} label="Distance" value={`${distance.toFixed(1)} km`} />
            <DetailRow icon={Calendar} label="Date" value={date || '—'} />
            <DetailRow icon={Clock} label="Time" value={time || '—'} />
            <DetailRow icon={Users} label="Seats" value={mode === 'search' ? `${seats} needed` : `${availableSeats} offered`} />
            {mode === 'offer' && <DetailRow icon={Car} label="Fare per seat" value={formatINR(farePerSeat)} />}
          </div>
          <button onClick={handleConfirm} className="btn-primary w-full">
            <Check className="w-4 h-4" /> {mode === 'search' ? 'Confirm & Search Rides' : 'Confirm & Publish Ride'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-neutral-500"><Icon className="w-4 h-4" />{label}</div>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  );
}
