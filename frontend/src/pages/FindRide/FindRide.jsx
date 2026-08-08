import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Repeat, ArrowRight, Search } from 'lucide-react';
import { FieldError, LocationAutocomplete } from '../../components';

export default function FindRide() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    pickupLoc: '',
    pickupLat: 12.9352,
    pickupLng: 77.6245,
    destination: '',
    destLat: 12.8399,
    destLng: 77.677,
    date: '',
    time: '',
    seats: 1,
    recurring: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSelectLocation = ({ name, address, lat, lng }) => {
    if (name === 'pickupLoc') {
      setForm((prev) => ({
        ...prev,
        pickupLoc: address,
        pickupLat: lat || prev.pickupLat,
        pickupLng: lng || prev.pickupLng,
      }));
      setErrors((prev) => ({ ...prev, pickupLoc: undefined }));
    } else if (name === 'destination') {
      setForm((prev) => ({
        ...prev,
        destination: address,
        destLat: lat || prev.destLat,
        destLng: lng || prev.destLng,
      }));
      setErrors((prev) => ({ ...prev, destination: undefined }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.pickupLoc.trim()) e.pickupLoc = 'Pickup location is required';
    if (!form.destination.trim()) e.destination = 'Destination is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.time) e.time = 'Time is required';
    if (!form.seats || form.seats < 1) e.seats = 'At least 1 seat required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    navigate('/rides/confirm', {
      state: { ...form, mode: 'search' },
    });
  };

  const adjustSeats = (delta) => {
    const next = Math.min(7, Math.max(1, Number(form.seats) + delta));
    setForm({ ...form, seats: next });
    setErrors({ ...errors, seats: undefined });
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Find a Ride</h1>
        <p className="section-desc">Search available carpools matching your route</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Route inputs with visual connector */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center pt-8 pb-1 shrink-0">
            <div className="route-dot-start" />
            <div className="route-connector" />
            <div className="route-connector" />
            <div className="route-dot-end" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="label">Pickup Location</label>
              <LocationAutocomplete
                name="pickupLoc"
                value={form.pickupLoc}
                onChange={handleChange}
                onSelectLocation={handleSelectLocation}
                placeholder="e.g. Koramangala, Bangalore"
                error={errors.pickupLoc}
              />
              <FieldError error={errors.pickupLoc} />
            </div>
            <div>
              <label className="label">Destination</label>
              <LocationAutocomplete
                name="destination"
                value={form.destination}
                onChange={handleChange}
                onSelectLocation={handleSelectLocation}
                placeholder="e.g. Electronic City, Bangalore"
                error={errors.destination}
              />
              <FieldError error={errors.destination} />
            </div>
          </div>
        </div>

        {/* Date and time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                name="date" type="date" value={form.date} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`input pl-10 ${errors.date ? 'input-error' : ''}`}
              />
            </div>
            <FieldError error={errors.date} />
          </div>
          <div>
            <label className="label">Time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                name="time" type="time" value={form.time} onChange={handleChange}
                className={`input pl-10 ${errors.time ? 'input-error' : ''}`}
              />
            </div>
            <FieldError error={errors.time} />
          </div>
        </div>

        {/* Seats with +/- stepper */}
        <div>
          <label className="label">Seats Needed</label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => adjustSeats(-1)}
              className="w-10 h-10 rounded-xl border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all font-bold text-lg disabled:opacity-40"
              disabled={form.seats <= 1}>
              −
            </button>
            <div className="flex-1 flex items-center justify-center gap-2 h-10 border border-neutral-200 rounded-xl bg-neutral-50">
              <Users className="w-4 h-4 text-neutral-400" />
              <span className="text-base font-bold text-neutral-900">{form.seats}</span>
              <span className="text-sm text-neutral-400">{form.seats === 1 ? 'seat' : 'seats'}</span>
            </div>
            <button type="button" onClick={() => adjustSeats(1)}
              className="w-10 h-10 rounded-xl border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all font-bold text-lg disabled:opacity-40"
              disabled={form.seats >= 7}>
              +
            </button>
          </div>
          <FieldError error={errors.seats} />
        </div>

        {/* Recurring toggle */}
        <label className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 cursor-pointer hover:border-neutral-300 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <Repeat className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-700">Recurring trip</p>
              <p className="text-xs text-neutral-500">Repeat every weekday</p>
            </div>
          </div>
          <div className="relative">
            <input type="checkbox" name="recurring" checked={form.recurring} onChange={handleChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-neutral-200 peer-checked:bg-primary rounded-full transition-colors duration-200" />
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-5" />
          </div>
        </label>

        <button type="submit" className="btn-primary w-full h-11">
          <Search className="w-4 h-4" />
          Search Rides
          <ArrowRight className="w-4 h-4 ml-auto" />
        </button>
      </form>
    </div>
  );
}
