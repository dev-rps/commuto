import { useEffect, useState } from 'react';
import { MapPin, Home, Briefcase, Plus, Trash2, Star } from 'lucide-react';
import { getSavedPlaces, addSavedPlace, deleteSavedPlace } from '../../lib/api';
import { EmptyState } from '../../components';
import { SkeletonList } from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import { FieldError } from '../../components';

const TYPE_ICONS = {
  Home:   { Icon: Home,     color: 'text-primary',    bg: 'bg-primary-50' },
  Work:   { Icon: Briefcase, color: 'text-warning-600', bg: 'bg-warning-50' },
  Other:  { Icon: Star,      color: 'text-accent-600',  bg: 'bg-accent-50' },
};

export default function SavedPlaces() {
  const toast = useToast();
  const [places, setPlaces]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [errors, setErrors]     = useState({});
  const [form, setForm] = useState({ name: '', latitude: '', longitude: '', type: 'Home' });

  const load = () => getSavedPlaces().then(setPlaces).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.latitude) e.latitude = 'Latitude is required';
    if (!form.longitude) e.longitude = 'Longitude is required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await addSavedPlace({ name: form.name, latitude: Number(form.latitude), longitude: Number(form.longitude) });
      toast.success('Place saved!');
      setForm({ name: '', latitude: '', longitude: '', type: 'Home' });
      setShowForm(false);
      load();
    } catch (err) { toast.error(err.message || 'Failed to save place'); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteSavedPlace(id);
      setPlaces((prev) => prev.filter((p) => p.id !== id));
      toast.success('Place removed');
    } catch (err) { toast.error(err.message || 'Failed to delete'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Saved Places</h1>
          <p className="section-desc">Quick access to your frequent locations</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Place
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-5 mb-5 space-y-4 animate-scale-in">
          <h3 className="font-bold text-neutral-900">New Saved Place</h3>
          {/* Type selector */}
          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              {Object.keys(TYPE_ICONS).map((t) => {
                const { Icon, color, bg } = TYPE_ICONS[t];
                return (
                  <button
                    key={t} type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.type === t ? `border-primary ${bg} text-primary` : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${form.type === t ? 'text-primary' : 'text-neutral-400'}`} />
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label">Place Name</label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder={`e.g. ${form.type === 'Home' ? 'My Home' : form.type === 'Work' ? 'Office' : 'Gym'}`}
              className={`input ${errors.name ? 'input-error' : ''}`} />
            <FieldError error={errors.name} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Latitude</label>
              <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange}
                placeholder="12.9352" className={`input ${errors.latitude ? 'input-error' : ''}`} />
              <FieldError error={errors.latitude} />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange}
                placeholder="77.6245" className={`input ${errors.longitude ? 'input-error' : ''}`} />
              <FieldError error={errors.longitude} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary">Save Place</button>
            <button type="button" onClick={() => { setShowForm(false); setErrors({}); }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <SkeletonList count={3} />
      ) : places.length === 0 && !showForm ? (
        <EmptyState
          icon={MapPin}
          title="No saved places yet"
          message="Save your home, office, and frequent destinations for quick access."
          action={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Place</button>}
        />
      ) : (
        <div className="space-y-3 stagger-children">
          {places.map((place) => {
            const typeKey = ['Home', 'Work'].find((t) => place.name.toLowerCase().includes(t.toLowerCase())) || 'Other';
            const { Icon, color, bg } = TYPE_ICONS[typeKey];
            return (
              <div key={place.id} className="card p-4 flex items-center gap-4 group hover:shadow-md transition-all">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-neutral-900 truncate">{place.name}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                    {Number(place.latitude).toFixed(4)}, {Number(place.longitude).toFixed(4)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(place.id)}
                  disabled={deleting === place.id}
                  className="p-2 rounded-lg text-neutral-300 hover:text-error hover:bg-error/5 transition-all opacity-0 group-hover:opacity-100"
                  aria-label={`Delete ${place.name}`}
                >
                  {deleting === place.id
                    ? <span className="w-4 h-4 rounded-full border-2 border-error/30 border-t-error animate-spin block" />
                    : <Trash2 className="w-4 h-4" />
                  }
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
