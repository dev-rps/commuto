import { useEffect, useState } from 'react';
import { MapPin, Plus, Trash2, Hop as Home, Briefcase, Star } from 'lucide-react';
import { getSavedPlaces, createSavedPlace, deleteSavedPlace } from '../../lib/api';
import { Spinner, EmptyState, FieldError } from '../../components';

const presetIcons = [
  { name: 'Home', icon: Home },
  { name: 'Office', icon: Briefcase },
  { name: 'Other', icon: Star },
];

export default function SavedPlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: 'Home', latitude: '', longitude: '' });

  const load = () => { getSavedPlaces().then(setPlaces).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.latitude || form.latitude < -90 || form.latitude > 90) e.latitude = 'Latitude must be between -90 and 90';
    if (!form.longitude || form.longitude < -180 || form.longitude > 180) e.longitude = 'Longitude must be between -180 and 180';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createSavedPlace({ name: form.name, latitude: Number(form.latitude), longitude: Number(form.longitude) });
      setShowForm(false); setForm({ name: 'Home', latitude: '', longitude: '' }); load();
    } catch (err) { setErrors({ submit: err.message || 'Failed to save place' }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (placeId) => {
    try { await deleteSavedPlace(placeId); load(); }
    catch (err) { alert(err.message || 'Failed to delete place'); }
  };

  if (loading) return <Spinner label="Loading saved places..." />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Saved Places</h1>
          <p className="text-sm text-neutral-500 mt-1">Quick access to your frequent destinations</p>
        </div>
        {!showForm && <button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Place</button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-neutral-900">Add New Place</h3>
          <div>
            <label className="label">Name</label>
            <div className="flex gap-2">
              {presetIcons.map((p) => (
                <button key={p.name} type="button" onClick={() => setForm({ ...form, name: p.name })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-sm font-medium transition-colors ${form.name === p.name ? 'border-primary bg-primary-50 text-primary-700' : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}>
                  <p.icon className="w-4 h-4" /> {p.name}
                </button>
              ))}
            </div>
            <FieldError error={errors.name} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={(e) => { setForm({ ...form, latitude: e.target.value }); setErrors({ ...errors, latitude: undefined }); }} placeholder="12.9352" className={`input ${errors.latitude ? 'input-error' : ''}`} />
              <FieldError error={errors.latitude} />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={(e) => { setForm({ ...form, longitude: e.target.value }); setErrors({ ...errors, longitude: undefined }); }} placeholder="77.6245" className={`input ${errors.longitude ? 'input-error' : ''}`} />
              <FieldError error={errors.longitude} />
            </div>
          </div>
          {errors.submit && <div className="rounded-md bg-error/10 px-4 py-3 text-sm text-error font-medium">{errors.submit}</div>}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Saving...' : 'Save Place'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {places.length === 0 && !showForm ? (
        <EmptyState icon={MapPin} title="No saved places" message="Add your home, office, or other frequent destinations for quick access."
          action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Place</button>} />
      ) : (
        <div className="space-y-3">
          {places.map((place) => {
            const preset = presetIcons.find((p) => p.name === place.name);
            const Icon = preset?.icon || MapPin;
            return (
              <div key={place.id} className="card p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">{place.name}</p>
                  <p className="text-xs text-neutral-500">{place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</p>
                </div>
                <button onClick={() => handleDelete(place.id)} className="p-2 rounded-md hover:bg-error/10 text-neutral-400 hover:text-error transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
