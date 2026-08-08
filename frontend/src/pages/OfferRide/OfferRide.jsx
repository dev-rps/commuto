import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Wallet, Car, Navigation, ChevronRight } from 'lucide-react';
import { getMyVehicles, publishRide } from '../../lib/api';
import { FieldError, Spinner } from '../../components';

export default function OfferRide() {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmedData = location.state;
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    vehicleId: '', pickupLoc: confirmedData?.pickupLoc || '', destination: confirmedData?.destination || '',
    date: confirmedData?.date || '', time: confirmedData?.time || '',
    availableSeats: confirmedData?.availableSeats || '', farePerSeat: '', distanceKm: confirmedData?.confirmedDistance || '',
  });

  useEffect(() => { getMyVehicles().then(setVehicles).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: undefined }); };

  const validate = () => {
    const e = {};
    if (!form.vehicleId) e.vehicleId = 'Please select a vehicle';
    if (!form.pickupLoc.trim()) e.pickupLoc = 'Pickup location is required';
    if (!form.destination.trim()) e.destination = 'Destination is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.time) e.time = 'Time is required';
    if (!form.availableSeats || form.availableSeats < 1) e.availableSeats = 'At least 1 seat required';
    if (!form.farePerSeat || form.farePerSeat <= 0) e.farePerSeat = 'Fare must be a positive amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const departureTime = new Date(`${form.date}T${form.time}`).toISOString();
      await publishRide({
        vehicleId: form.vehicleId, pickupLoc: form.pickupLoc, pickupLat: 12.9352, pickupLng: 77.6245,
        destination: form.destination, destLat: 12.8399, destLng: 77.677, departureTime,
        availableSeats: Number(form.availableSeats), farePerSeat: Number(form.farePerSeat),
        distanceKm: Number(form.distanceKm) || null,
      });
      navigate('/trips');
    } catch (err) { setErrors({ submit: err.message || 'Failed to publish ride' }); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Spinner label="Loading your vehicles..." />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Offer a Ride</h1>
        <p className="text-sm text-neutral-500 mt-1">Publish a new carpool for colleagues to join</p>
      </div>
      {vehicles.length === 0 ? (
        <div className="card p-6 text-center">
          <Car className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="font-semibold text-neutral-900 mb-1">No vehicles registered</h3>
          <p className="text-sm text-neutral-500 mb-4">You need to add a vehicle before offering rides.</p>
          <button onClick={() => navigate('/vehicles')} className="btn-primary">Add a Vehicle</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div>
            <label className="label">Select Vehicle</label>
            <div className="space-y-2">
              {vehicles.map((v) => (
                <button key={v.id} type="button" onClick={() => setForm({ ...form, vehicleId: v.id })}
                  className={`w-full flex items-center gap-3 p-3 rounded-md border text-left transition-colors ${form.vehicleId === v.id ? 'border-primary bg-primary-50' : 'border-neutral-300 hover:bg-neutral-50'}`}>
                  <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                    <Car className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">{v.model}</p>
                    <p className="text-xs text-neutral-500">{v.registrationNo} · {v.seatingCap} seats</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400" />
                </button>
              ))}
            </div>
            <FieldError error={errors.vehicleId} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Pickup Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input name="pickupLoc" value={form.pickupLoc} onChange={handleChange} placeholder="e.g. Koramangala" className={`input pl-10 ${errors.pickupLoc ? 'input-error' : ''}`} />
              </div>
              <FieldError error={errors.pickupLoc} />
            </div>
            <div>
              <label className="label">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-600" />
                <input name="destination" value={form.destination} onChange={handleChange} placeholder="e.g. Electronic City" className={`input pl-10 ${errors.destination ? 'input-error' : ''}`} />
              </div>
              <FieldError error={errors.destination} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input name="date" type="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} className={`input pl-10 ${errors.date ? 'input-error' : ''}`} />
              </div>
              <FieldError error={errors.date} />
            </div>
            <div>
              <label className="label">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input name="time" type="time" value={form.time} onChange={handleChange} className={`input pl-10 ${errors.time ? 'input-error' : ''}`} />
              </div>
              <FieldError error={errors.time} />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Available Seats</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input name="availableSeats" type="number" min="1" max="7" value={form.availableSeats} onChange={handleChange} placeholder="3" className={`input pl-10 ${errors.availableSeats ? 'input-error' : ''}`} />
              </div>
              <FieldError error={errors.availableSeats} />
            </div>
            <div>
              <label className="label">Fare per Seat (₹)</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input name="farePerSeat" type="number" min="1" step="0.01" value={form.farePerSeat} onChange={handleChange} placeholder="80" className={`input pl-10 ${errors.farePerSeat ? 'input-error' : ''}`} />
              </div>
              <FieldError error={errors.farePerSeat} />
            </div>
            <div>
              <label className="label">Distance (km)</label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input name="distanceKm" type="number" min="0" step="0.1" value={form.distanceKm} onChange={handleChange} placeholder="16.5" className="input pl-10" />
              </div>
            </div>
          </div>
          {!confirmedData && (
            <button type="button" onClick={() => {
              if (form.pickupLoc && form.destination) navigate('/rides/confirm', { state: { ...form, mode: 'offer', pickupLat: 12.9352, pickupLng: 77.6245, destLat: 12.8399, destLng: 77.677 } });
            }} className="btn-secondary w-full">Preview Route on Map</button>
          )}
          {errors.submit && <div className="rounded-md bg-error/10 px-4 py-3 text-sm text-error font-medium">{errors.submit}</div>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Publishing...' : 'Publish Ride'}</button>
        </form>
      )}
    </div>
  );
}
