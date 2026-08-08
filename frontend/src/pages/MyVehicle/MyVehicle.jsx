import { useEffect, useState } from 'react';
import { Car, Plus, Pencil, Fuel } from 'lucide-react';
import { getMyVehicles, createVehicle, updateVehicle } from '../../lib/api';
import { Spinner, EmptyState, FieldError } from '../../components';

export default function MyVehicle() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ model: '', registrationNo: '', seatingCap: '', fuelEfficiencyKmpl: '' });

  const load = () => { getMyVehicles().then(setVehicles).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({ model: '', registrationNo: '', seatingCap: '', fuelEfficiencyKmpl: '' }); setErrors({}); setShowForm(true); };
  const openEdit = (v) => { setEditing(v); setForm({ model: v.model, registrationNo: v.registrationNo, seatingCap: v.seatingCap, fuelEfficiencyKmpl: v.fuelEfficiencyKmpl || '' }); setErrors({}); setShowForm(true); };

  const validate = () => {
    const e = {};
    if (!form.model.trim()) e.model = 'Model is required';
    if (!form.registrationNo.trim()) e.registrationNo = 'Registration number is required';
    if (!form.seatingCap || form.seatingCap < 1) e.seatingCap = 'Seating capacity must be at least 1';
    if (form.fuelEfficiencyKmpl && form.fuelEfficiencyKmpl <= 0) e.fuelEfficiencyKmpl = 'Must be a positive value';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { model: form.model, registrationNo: form.registrationNo, seatingCap: Number(form.seatingCap), fuelEfficiencyKmpl: form.fuelEfficiencyKmpl ? Number(form.fuelEfficiencyKmpl) : null };
      if (editing) await updateVehicle(editing.id, payload); else await createVehicle(payload);
      setShowForm(false); load();
    } catch (err) { setErrors({ submit: err.message || 'Failed to save vehicle' }); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Spinner label="Loading vehicles..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Vehicle</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your registered vehicles</p>
        </div>
        {!showForm && <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Vehicle</button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-neutral-900">{editing ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Model</label>
              <input name="model" value={form.model} onChange={(e) => { setForm({ ...form, model: e.target.value }); setErrors({ ...errors, model: undefined }); }} placeholder="e.g. Maruti Suzuki Swift" className={`input ${errors.model ? 'input-error' : ''}`} />
              <FieldError error={errors.model} />
            </div>
            <div>
              <label className="label">Registration Number</label>
              <input name="registrationNo" value={form.registrationNo} onChange={(e) => { setForm({ ...form, registrationNo: e.target.value }); setErrors({ ...errors, registrationNo: undefined }); }} placeholder="e.g. KA-01-AB-1234" className={`input ${errors.registrationNo ? 'input-error' : ''}`} />
              <FieldError error={errors.registrationNo} />
            </div>
            <div>
              <label className="label">Seating Capacity</label>
              <input name="seatingCap" type="number" min="1" max="8" value={form.seatingCap} onChange={(e) => { setForm({ ...form, seatingCap: e.target.value }); setErrors({ ...errors, seatingCap: undefined }); }} placeholder="4" className={`input ${errors.seatingCap ? 'input-error' : ''}`} />
              <FieldError error={errors.seatingCap} />
            </div>
            <div>
              <label className="label">Fuel Efficiency (km/L) — optional</label>
              <input name="fuelEfficiencyKmpl" type="number" min="0" step="0.1" value={form.fuelEfficiencyKmpl} onChange={(e) => { setForm({ ...form, fuelEfficiencyKmpl: e.target.value }); setErrors({ ...errors, fuelEfficiencyKmpl: undefined }); }} placeholder="22.0" className={`input ${errors.fuelEfficiencyKmpl ? 'input-error' : ''}`} />
              <FieldError error={errors.fuelEfficiencyKmpl} />
            </div>
          </div>
          {errors.submit && <div className="rounded-md bg-error/10 px-4 py-3 text-sm text-error font-medium">{errors.submit}</div>}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Saving...' : editing ? 'Update Vehicle' : 'Add Vehicle'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      {vehicles.length === 0 && !showForm ? (
        <EmptyState icon={Car} title="No vehicles yet" message="Add your first vehicle to start offering rides to colleagues."
          action={<button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Vehicle</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900">{v.model}</h3>
                  <p className="text-sm text-neutral-500 mt-0.5">{v.registrationNo}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1"><span className="font-medium text-neutral-700">{v.seatingCap}</span> seats</span>
                    {v.fuelEfficiencyKmpl && <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" />{v.fuelEfficiencyKmpl} km/L</span>}
                    <span className={`badge ${v.isActive ? 'bg-accent-50 text-accent-700' : 'bg-neutral-100 text-neutral-500'}`}>{v.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <button onClick={() => openEdit(v)} className="p-2 rounded-md hover:bg-neutral-100 text-neutral-500"><Pencil className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
