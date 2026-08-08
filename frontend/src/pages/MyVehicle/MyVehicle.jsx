import { useEffect, useState } from 'react';
import { Car, Plus, Pencil, Fuel, Users, CheckCircle, XCircle } from 'lucide-react';
import { getMyVehicles, createVehicle, updateVehicle } from '../../lib/api';
import { SkeletonList } from '../../components/Skeleton';
import { EmptyState, FieldError } from '../../components';
import { useToast } from '../../context/ToastContext';

export default function MyVehicle() {
  const toast = useToast();
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [errors, setErrors]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ model: '', registrationNo: '', seatingCap: '', fuelEfficiencyKmpl: '' });

  const load = () => getMyVehicles().then(setVehicles).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ model: '', registrationNo: '', seatingCap: '', fuelEfficiencyKmpl: '' }); setErrors({}); setShowForm(true); };
  const openEdit = (v) => { setEditing(v); setForm({ model: v.model, registrationNo: v.registrationNo, seatingCap: v.seatingCap, fuelEfficiencyKmpl: v.fuelEfficiencyKmpl || '' }); setErrors({}); setShowForm(true); };
  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: undefined }); };

  const validate = () => {
    const e = {};
    if (!form.model.trim()) e.model = 'Model is required';
    if (!form.registrationNo.trim()) e.registrationNo = 'Registration number is required';
    if (!form.seatingCap || form.seatingCap < 1) e.seatingCap = 'At least 1 seat';
    if (form.fuelEfficiencyKmpl && form.fuelEfficiencyKmpl <= 0) e.fuelEfficiencyKmpl = 'Must be positive';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        model: form.model, registrationNo: form.registrationNo,
        seatingCap: Number(form.seatingCap),
        fuelEfficiencyKmpl: form.fuelEfficiencyKmpl ? Number(form.fuelEfficiencyKmpl) : null,
      };
      if (editing) await updateVehicle(editing.id, payload); else await createVehicle(payload);
      toast.success(editing ? 'Vehicle updated!' : 'Vehicle added!');
      setShowForm(false); load();
    } catch (err) { toast.error(err.message || 'Failed to save vehicle'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-neutral-900">My Vehicle</h1></div>
      <SkeletonList count={2} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Vehicle</h1>
          <p className="section-desc">Manage your registered vehicles</p>
        </div>
        {!showForm && (
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4 animate-scale-in">
          <h3 className="section-title">{editing ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Vehicle Model</label>
              <input name="model" value={form.model} onChange={handleChange}
                placeholder="e.g. Maruti Suzuki Swift" className={`input ${errors.model ? 'input-error' : ''}`} />
              <FieldError error={errors.model} />
            </div>
            <div>
              <label className="label">Registration Number</label>
              <input name="registrationNo" value={form.registrationNo} onChange={handleChange}
                placeholder="e.g. KA-01-AB-1234" className={`input ${errors.registrationNo ? 'input-error' : ''}`} />
              <FieldError error={errors.registrationNo} />
            </div>
            <div>
              <label className="label">Seating Capacity</label>
              <input name="seatingCap" type="number" min="1" max="8" value={form.seatingCap} onChange={handleChange}
                placeholder="4" className={`input ${errors.seatingCap ? 'input-error' : ''}`} />
              <FieldError error={errors.seatingCap} />
            </div>
            <div>
              <label className="label">Fuel Efficiency (km/L) <span className="text-neutral-400 font-normal">optional</span></label>
              <input name="fuelEfficiencyKmpl" type="number" min="0" step="0.1" value={form.fuelEfficiencyKmpl} onChange={handleChange}
                placeholder="22.0" className={`input ${errors.fuelEfficiencyKmpl ? 'input-error' : ''}`} />
              <FieldError error={errors.fuelEfficiencyKmpl} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Saving...</>
                : (editing ? 'Update Vehicle' : 'Add Vehicle')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {/* Vehicle cards */}
      {vehicles.length === 0 && !showForm ? (
        <EmptyState icon={Car} title="No vehicles yet" message="Add your first vehicle to start offering rides."
          action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Vehicle</button>} />
      ) : (
        <div className="space-y-4 stagger-children">
          {vehicles.map((v) => (
            <div key={v.id} className="card p-5 hover:shadow-md transition-all group">
              <div className="flex items-start gap-4">
                {/* Car icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: v.isActive ? 'var(--gradient-primary)' : '#f1f5f9', boxShadow: v.isActive ? '0 4px 12px rgb(37 99 235 / 0.25)' : 'none' }}
                >
                  <Car className={`w-7 h-7 ${v.isActive ? 'text-white' : 'text-neutral-400'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-neutral-900">{v.model}</h3>
                      <p className="text-sm text-neutral-500 mt-0.5 font-mono">{v.registrationNo}</p>
                    </div>
                    <button
                      onClick={() => openEdit(v)}
                      className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-all opacity-0 group-hover:opacity-100"
                      aria-label={`Edit ${v.model}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="badge bg-neutral-100 text-neutral-600">
                      <Users className="w-3 h-3" />
                      {v.seatingCap} seats
                    </span>
                    {v.fuelEfficiencyKmpl && (
                      <span className="badge bg-accent-50 text-accent-700">
                        <Fuel className="w-3 h-3" />
                        {v.fuelEfficiencyKmpl} km/L
                      </span>
                    )}
                    <span className={`badge ${v.isActive ? 'bg-accent-50 text-accent-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {v.isActive
                        ? <><CheckCircle className="w-3 h-3" /> Active</>
                        : <><XCircle className="w-3 h-3" /> Inactive</>
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
