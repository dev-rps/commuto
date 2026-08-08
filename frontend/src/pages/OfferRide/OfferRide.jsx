import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Wallet, Car, Navigation, ChevronRight, MapPin, ArrowRight } from 'lucide-react';
import { getMyVehicles, publishRide } from '../../lib/api';
import { FieldError } from '../../components';
import { SkeletonCard } from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';

const STEPS = ['Vehicle', 'Route', 'Details'];

export default function OfferRide() {
  const navigate  = useNavigate();
  const toast     = useToast();
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep]           = useState(0);
  const [errors, setErrors]       = useState({});
  const [form, setForm] = useState({
    vehicleId: '', pickupLoc: '', destination: '',
    date: '', time: '', availableSeats: '', farePerSeat: '', distanceKm: '',
  });

  useEffect(() => {
    getMyVehicles().then(setVehicles).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 0 && !form.vehicleId) e.vehicleId = 'Select a vehicle';
    if (s === 1) {
      if (!form.pickupLoc.trim()) e.pickupLoc = 'Pickup location is required';
      if (!form.destination.trim()) e.destination = 'Destination is required';
      if (!form.date) e.date = 'Date is required';
      if (!form.time) e.time = 'Time is required';
    }
    if (s === 2) {
      if (!form.availableSeats || form.availableSeats < 1) e.availableSeats = 'At least 1 seat required';
      if (!form.farePerSeat || form.farePerSeat <= 0)  e.farePerSeat = 'Fare must be a positive amount';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep((s) => s + 1); };
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setSubmitting(true);
    try {
      const departureTime = new Date(`${form.date}T${form.time}`).toISOString();
      await publishRide({
        vehicleId: form.vehicleId,
        pickupLoc: form.pickupLoc, pickupLat: 12.9352, pickupLng: 77.6245,
        destination: form.destination, destLat: 12.8399, destLng: 77.677,
        departureTime,
        availableSeats: Number(form.availableSeats),
        farePerSeat: Number(form.farePerSeat),
        distanceKm: Number(form.distanceKm) || null,
      });
      toast.success('Ride published! Colleagues can now book it 🚗');
      setTimeout(() => navigate('/trips'), 1200);
    } catch (err) {
      toast.error(err.message || 'Failed to publish ride');
    } finally { setSubmitting(false); }
  };

  const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);

  if (loading) {
    return <div className="max-w-2xl mx-auto space-y-4">
      <div className="mb-6"><h1 className="text-2xl font-bold text-neutral-900">Offer a Ride</h1></div>
      {[1,2].map((i) => <SkeletonCard key={i} />)}
    </div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Offer a Ride</h1>
        <p className="section-desc">Publish a carpool for colleagues to join</p>
      </div>

      {vehicles.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="font-bold text-neutral-900 mb-2">No vehicles registered</h3>
          <p className="text-sm text-neutral-500 mb-5">Add a vehicle before offering rides.</p>
          <button onClick={() => navigate('/vehicles')} className="btn-primary">
            <Car className="w-4 h-4" /> Add a Vehicle
          </button>
        </div>
      ) : (
        <>
          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i < step ? 'bg-accent text-white' :
                      i === step ? 'bg-primary text-white shadow-glow' :
                      'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 font-semibold ${i === step ? 'text-primary' : 'text-neutral-400'}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 mb-4 transition-colors ${i < step ? 'bg-accent' : 'bg-neutral-200'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="card p-6">
            {/* Step 0: Select vehicle */}
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="section-title">Select Your Vehicle</h3>
                <div className="space-y-2.5">
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => { setForm({ ...form, vehicleId: v.id }); setErrors({}); }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        form.vehicleId === v.id
                          ? 'border-primary bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: form.vehicleId === v.id ? 'var(--gradient-primary)' : '#F1F5F9' }}
                      >
                        <Car className={`w-6 h-6 ${form.vehicleId === v.id ? 'text-white' : 'text-neutral-500'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-neutral-900">{v.model}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{v.registrationNo} · {v.seatingCap} seats</p>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-colors ${form.vehicleId === v.id ? 'text-primary' : 'text-neutral-300'}`} />
                    </button>
                  ))}
                </div>
                <FieldError error={errors.vehicleId} />
              </div>
            )}

            {/* Step 1: Route */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="section-title">Set Your Route</h3>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center pt-8 pb-1 shrink-0">
                    <div className="route-dot-start" />
                    <div className="route-connector" /><div className="route-connector" />
                    <div className="route-dot-end" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="label">Pickup Location</label>
                      <input name="pickupLoc" value={form.pickupLoc} onChange={handleChange}
                        placeholder="e.g. Koramangala" className={`input ${errors.pickupLoc ? 'input-error' : ''}`} />
                      <FieldError error={errors.pickupLoc} />
                    </div>
                    <div>
                      <label className="label">Destination</label>
                      <input name="destination" value={form.destination} onChange={handleChange}
                        placeholder="e.g. Electronic City" className={`input ${errors.destination ? 'input-error' : ''}`} />
                      <FieldError error={errors.destination} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                      <input name="date" type="date" value={form.date} onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`input pl-10 ${errors.date ? 'input-error' : ''}`} />
                    </div>
                    <FieldError error={errors.date} />
                  </div>
                  <div>
                    <label className="label">Departure Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                      <input name="time" type="time" value={form.time} onChange={handleChange}
                        className={`input pl-10 ${errors.time ? 'input-error' : ''}`} />
                    </div>
                    <FieldError error={errors.time} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="section-title">Trip Details</h3>
                {selectedVehicle && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                    <Car className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-700">{selectedVehicle.model}</span>
                    <span className="text-xs text-neutral-400">· max {selectedVehicle.seatingCap} seats</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Seats Available</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                      <input name="availableSeats" type="number" min="1" max={selectedVehicle?.seatingCap || 7}
                        value={form.availableSeats} onChange={handleChange} placeholder="3"
                        className={`input pl-10 ${errors.availableSeats ? 'input-error' : ''}`} />
                    </div>
                    <FieldError error={errors.availableSeats} />
                  </div>
                  <div>
                    <label className="label">Fare / Seat (₹)</label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                      <input name="farePerSeat" type="number" min="1" step="0.01"
                        value={form.farePerSeat} onChange={handleChange} placeholder="80"
                        className={`input pl-10 ${errors.farePerSeat ? 'input-error' : ''}`} />
                    </div>
                    <FieldError error={errors.farePerSeat} />
                  </div>
                  <div>
                    <label className="label">Distance (km)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                      <input name="distanceKm" type="number" min="0" step="0.1"
                        value={form.distanceKm} onChange={handleChange} placeholder="16.5"
                        className="input pl-10" />
                    </div>
                  </div>
                </div>
                {form.farePerSeat && form.availableSeats && (
                  <div className="rounded-xl p-4 border border-accent-100 bg-accent-50">
                    <p className="text-xs font-semibold text-accent-700 mb-1">Revenue estimate</p>
                    <p className="text-xl font-bold text-accent-700">
                      ₹{(Number(form.farePerSeat) * Number(form.availableSeats)).toFixed(0)}
                      <span className="text-sm font-normal text-accent-600 ml-1">if all seats fill</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className={`flex gap-3 mt-6 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
              {step > 0 && (
                <button type="button" onClick={prevStep} className="btn-secondary">
                  ← Back
                </button>
              )}
              {step < 2 ? (
                <button type="button" onClick={nextStep} className="btn-primary">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={submitting} className="btn-primary">
                  {submitting ? (
                    <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Publishing...</>
                  ) : (
                    <><Navigation className="w-4 h-4" /> Publish Ride</>
                  )}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
