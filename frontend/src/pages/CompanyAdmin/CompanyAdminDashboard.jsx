import { useState, useEffect } from 'react';
import { 
  Building2, Fuel, MapPin, TrendingUp, Users, 
  BarChart3, Settings, CheckCircle2, AlertCircle, RefreshCw, Car 
} from 'lucide-react';
import { getReportSummary, updateOrganizationPolicy } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Spinner, EmptyState } from '../../components';

export default function CompanyAdminDashboard() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPolicy, setEditingPolicy] = useState(false);
  const [policyForm, setPolicyForm] = useState({ fuelCostPerL: '', costPerKm: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getReportSummary();
      setReport(summary);
      if (summary?.organization) {
        setPolicyForm({
          fuelCostPerL: summary.organization.fuelCostPerL || '',
          costPerKm: summary.organization.costPerKm || '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load company report summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handlePolicySave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess('');
    try {
      await updateOrganizationPolicy({
        fuelCostPerL: policyForm.fuelCostPerL,
        costPerKm: policyForm.costPerKm,
      });
      setSaveSuccess('Company fuel policy rates updated successfully!');
      setEditingPolicy(false);
      fetchSummary();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update policy rates');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <Spinner label="Loading Corporate Admin Fleet & Fuel Summary..." />;

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-error/10 border border-error/20 p-4 text-error text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchSummary} className="btn-secondary text-xs py-1 px-3">Retry</button>
        </div>
      </div>
    );
  }

  const { organization, summary, vehicleBreakdown = [], fuelEfficiencyTrends = [] } = report || {};

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Corporate Admin Control Panel
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{organization?.name || 'Company'} Administration</h1>
          <p className="text-sm text-neutral-300 mt-1">
            Company fleet management, corporate commute analytics, fuel cost benchmarks, and reimbursement settings.
          </p>
        </div>

        {/* Policy Box / Quick Editor */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-xl text-xs space-y-2 min-w-[260px]">
          <div className="flex items-center justify-between font-semibold border-b border-white/10 pb-2">
            <span>Org Policy Benchmarks</span>
            <button
              onClick={() => setEditingPolicy(!editingPolicy)}
              className="text-blue-300 hover:text-white flex items-center gap-1 underline"
            >
              <Settings className="w-3.5 h-3.5" />
              {editingPolicy ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {!editingPolicy ? (
            <div className="space-y-1 text-neutral-200">
              <div className="flex justify-between">
                <span>Fuel Cost / Litre:</span>
                <span className="font-bold text-white">₹{Number(organization?.fuelCostPerL || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cost / Kilometre:</span>
                <span className="font-bold text-white">₹{Number(organization?.costPerKm || 0).toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePolicySave} className="space-y-2 pt-1">
              <div>
                <label className="text-[10px] text-neutral-300 block">Fuel Cost (₹/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={policyForm.fuelCostPerL}
                  onChange={(e) => setPolicyForm({ ...policyForm, fuelCostPerL: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-white text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-300 block">Reimbursement (₹/km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={policyForm.costPerKm}
                  onChange={(e) => setPolicyForm({ ...policyForm, costPerKm: e.target.value })}
                  className="w-full bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-white text-xs"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={saveLoading}
                className="w-full py-1 bg-blue-600 hover:bg-blue-500 font-semibold rounded text-white text-xs transition-colors"
              >
                {saveLoading ? 'Saving...' : 'Save Policy'}
              </button>
            </form>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Corporate Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border border-blue-100 bg-blue-50/20">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Total Company Trips</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{summary?.totalTrips || 0}</p>
          <p className="text-xs text-neutral-500 mt-1">{summary?.totalPassengers || 0} passengers shared rides</p>
        </div>

        <div className="card p-5 border border-emerald-100 bg-emerald-50/20">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Total Distance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{summary?.totalDistance || 0} km</p>
          <p className="text-xs text-neutral-500 mt-1">Total commute distance covered</p>
        </div>

        <div className="card p-5 border border-amber-100 bg-amber-50/20">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Fuel Consumed</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{summary?.totalFuelConsumed || 0} L</p>
          <p className="text-xs text-neutral-500 mt-1">Est. fuel cost: ₹{summary?.totalFuelCost || 0}</p>
        </div>

        <div className="card p-5 border border-purple-100 bg-purple-50/20">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">Distance Cost</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">₹{((summary?.totalDistance || 0) * (summary?.costPerKm || 0)).toFixed(2)}</p>
          <p className="text-xs text-neutral-500 mt-1">At ₹{summary?.costPerKm || 0}/km reimbursement rate</p>
        </div>
      </div>

      {/* Vehicle Fleet Breakdown */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          Company Vehicle Fleet Performance
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                <th className="py-3 px-4">Vehicle Model</th>
                <th className="py-3 px-4">Registration No</th>
                <th className="py-3 px-4">Fuel Efficiency</th>
                <th className="py-3 px-4">Trips</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Fuel Consumed</th>
                <th className="py-3 px-4">Fuel Cost</th>
                <th className="py-3 px-4">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {vehicleBreakdown.map((v) => (
                <tr key={v.vehicleId} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-neutral-900">{v.model}</td>
                  <td className="py-3 px-4 font-mono text-neutral-600">{v.registrationNo}</td>
                  <td className="py-3 px-4 font-medium text-neutral-800">
                    {v.fuelEfficiencyKmpl ? `${v.fuelEfficiencyKmpl} km/L` : <span className="text-emerald-600 font-semibold">EV (Electric)</span>}
                  </td>
                  <td className="py-3 px-4 font-semibold text-neutral-900">{v.totalTrips}</td>
                  <td className="py-3 px-4 text-neutral-700">{v.totalDistanceKm} km</td>
                  <td className="py-3 px-4 text-neutral-700">{v.fuelConsumedL} L</td>
                  <td className="py-3 px-4 text-neutral-700">₹{v.fuelCost}</td>
                  <td className="py-3 px-4 font-bold text-primary-700">₹{v.totalCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {vehicleBreakdown.length === 0 && (
            <EmptyState title="No vehicle data available" message="No completed trips recorded for company vehicles yet." />
          )}
        </div>
      </div>

      {/* Fuel Efficiency Monthly Trends */}
      {fuelEfficiencyTrends.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Monthly Fuel Efficiency & Mileage Trends
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4">Trips Count</th>
                  <th className="py-3 px-4">Total Distance</th>
                  <th className="py-3 px-4">Fuel Consumed</th>
                  <th className="py-3 px-4">Avg Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {fuelEfficiencyTrends.map((t) => (
                  <tr key={t.month} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-neutral-900">{t.month}</td>
                    <td className="py-3 px-4 font-semibold text-neutral-800">{t.tripCount}</td>
                    <td className="py-3 px-4 text-neutral-700">{t.totalDistanceKm} km</td>
                    <td className="py-3 px-4 text-neutral-700">{t.totalFuelConsumedL} L</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {t.avgEfficiencyKmpl ? `${t.avgEfficiencyKmpl} km/L` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
