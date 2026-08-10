import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Repeat, ArrowRight, Search, History, Sparkles, MapPin } from 'lucide-react';
import { FieldError, LocationAutocomplete } from '../../components';
import { useToast } from '../../context/ToastContext';

const recentCommutes = [
  {
    id: 1,
    title: 'Barasat ➔ Howrah Station',
    pickupLoc: 'Barasat, Kolkata Metropolitan Area, West Bengal',
    pickupLat: 22.7233,
    pickupLng: 88.4803,
    destination: 'Howrah, Kolkata Metropolitan Area, West Bengal',
    destLat: 22.5958,
    destLng: 88.2636,
    time: '09:00',
    tag: 'Frequent',
  },
  {
    id: 2,
    title: 'Koramangala ➔ Electronic City',
    pickupLoc: 'Koramangala 5th Block, Bangalore',
    pickupLat: 12.9352,
    pickupLng: 77.6245,
    destination: 'Electronic City Phase 1, Bangalore',
    destLat: 12.8399,
    destLng: 77.677,
    time: '08:30',
    tag: 'Tech Hub',
  },
  {
    id: 3,
    title: 'Whitefield ➔ Indiranagar',
    pickupLoc: 'Whitefield ITPB Main Gate, Bangalore',
    pickupLat: 12.9847,
    pickupLng: 77.7499,
    destination: '100ft Road, Indiranagar, Bangalore',
    destLat: 12.9784,
    destLng: 77.6408,
    time: '18:00',
    tag: 'Evening',
  },
];

export default function FindRide() {
  const navigate = useNavigate();
  const toast    = useToast();
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    pickupLoc: '',
    pickupLat: 12.9352,
    pickupLng: 77.6245,
    destination: '',
    destLat: 12.8399,
    destLng: 77.677,
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    seats: 1,
    recurring: false,
  });

  const handleSelectRecent = (commute) => {
    const today = new Date().toISOString().split('T')[0];
    setForm((prev) => ({
      ...prev,
      pickupLoc: commute.pickupLoc,
      pickupLat: commute.pickupLat,
      pickupLng: commute.pickupLng,
      destination: commute.destination,
      destLat: commute.destLat,
      destLng: commute.destLng,
      time: commute.time || '09:00',
      date: prev.date || today,
    }));
    setErrors({});
    toast.success(`Loaded route: ${commute.title} 📍`);
  };

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
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-slate-100">Find a Ride</h1>
        <p className="section-desc">Search available carpools matching your route</p>
      </div>

      {/* Recent & Saved Commute Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-primary dark:text-blue-400" />
            <span>Recent & Saved Routes</span>
          </h2>
          <span className="text-[11px] text-neutral-400 dark:text-slate-500">Tap to auto-fill</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {recentCommutes.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelectRecent(c)}
              className="card p-3 text-left hover:border-primary/50 dark:hover:border-blue-500/50 hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary dark:bg-blue-950 dark:text-blue-300">
                  {c.tag}
                </span>
                <Sparkles className="w-3 h-3 text-neutral-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs font-bold text-neutral-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors truncate">
                {c.title}
              </p>
              <p className="text-[10px] text-neutral-400 dark:text-slate-500 mt-1 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {c.destination.split(',')[0]}
              </p>
            </button>
          ))}
        </div>
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
              className="w-10 h-10 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-neutral-600 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-700 transition-all font-bold text-lg disabled:opacity-40"
              disabled={form.seats <= 1}>
              −
            </button>
            <div className="flex-1 flex items-center justify-center gap-2 h-10 border border-neutral-200 dark:border-slate-700 rounded-xl bg-neutral-50 dark:bg-slate-800/60">
              <Users className="w-4 h-4 text-neutral-400" />
              <span className="text-base font-bold text-neutral-900 dark:text-slate-100">{form.seats}</span>
              <span className="text-sm text-neutral-400">{form.seats === 1 ? 'seat' : 'seats'}</span>
            </div>
            <button type="button" onClick={() => adjustSeats(1)}
              className="w-10 h-10 rounded-xl border border-neutral-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-neutral-600 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-700 transition-all font-bold text-lg disabled:opacity-40"
              disabled={form.seats >= 7}>
              +
            </button>
          </div>
          <FieldError error={errors.seats} />
        </div>

        {/* Recurring toggle */}
        <label className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 dark:border-slate-700 bg-neutral-50 dark:bg-slate-800/50 cursor-pointer hover:border-neutral-300 dark:hover:border-slate-600 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-blue-950 flex items-center justify-center">
              <Repeat className="w-4 h-4 text-primary dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-700 dark:text-slate-200">Recurring trip</p>
              <p className="text-xs text-neutral-500 dark:text-slate-400">Repeat every weekday</p>
            </div>
          </div>
          <div className="relative">
            <input type="checkbox" name="recurring" checked={form.recurring} onChange={handleChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-neutral-200 dark:bg-slate-700 peer-checked:bg-primary rounded-full transition-colors duration-200" />
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
