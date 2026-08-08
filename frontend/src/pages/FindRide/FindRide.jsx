import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Repeat, Navigation } from 'lucide-react';
import { FieldError } from '../../components';

export default function FindRide() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ pickupLoc: '', destination: '', date: '', time: '', seats: 1, recurring: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setErrors({ ...errors, [name]: undefined });
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
    navigate('/rides/confirm', { state: { ...form, pickupLat: 12.9352, pickupLng: 77.6245, destLat: 12.8399, destLng: 77.677, mode: 'search' } });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Find a Ride</h1>
        <p className="text-sm text-neutral-500 mt-1">Search for available carpools matching your route</p>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Pickup Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <input name="pickupLoc" type="text" value={form.pickupLoc} onChange={handleChange} placeholder="e.g. Koramangala, Bangalore" className={`input pl-10 ${errors.pickupLoc ? 'input-error' : ''}`} />
          </div>
          <FieldError error={errors.pickupLoc} />
        </div>
        <div>
          <label className="label">Destination</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-600" />
            <input name="destination" type="text" value={form.destination} onChange={handleChange} placeholder="e.g. Electronic City, Bangalore" className={`input pl-10 ${errors.destination ? 'input-error' : ''}`} />
          </div>
          <FieldError error={errors.destination} />
        </div>
        <div className="grid grid-cols-2 gap-4">
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
        <div>
          <label className="label">Seats Needed</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input name="seats" type="number" min="1" max="7" value={form.seats} onChange={handleChange} className={`input pl-10 ${errors.seats ? 'input-error' : ''}`} />
          </div>
          <FieldError error={errors.seats} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input type="checkbox" name="recurring" checked={form.recurring} onChange={handleChange} className="sr-only peer" />
            <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-primary transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm" />
          </div>
          <div className="flex items-center gap-1.5">
            <Repeat className="w-4 h-4 text-neutral-400" />
            <span className="text-sm text-neutral-700">Recurring trip (weekdays)</span>
          </div>
        </label>
        <button type="submit" className="btn-primary w-full"><Navigation className="w-4 h-4" /> Continue to Route Preview</button>
      </form>
    </div>
  );
}
