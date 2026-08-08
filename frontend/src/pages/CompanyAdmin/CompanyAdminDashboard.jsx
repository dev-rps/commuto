import { useState, useEffect, useCallback } from 'react';
import {
  Building2, Users, Car, BarChart3, Fuel, TrendingUp,
  Settings, CheckCircle2, AlertCircle, RefreshCw, MapPin,
  CreditCard, Activity, ChevronRight,
} from 'lucide-react';
import {
  getReportSummary,
  updateOrganizationPolicy,
  getOrgMembers,
  getOrgRides,
  getOrgBookings,
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Spinner, EmptyState, StatusBadge } from '../../components';
import { formatDateTime, formatINR } from '../../lib/utils';

/* ─── Tab Definitions ─────────────────────────────────────────── */
const TABS = [
  { key: 'overview',   label: 'Overview',   icon: BarChart3 },
  { key: 'employees',  label: 'Employees',  icon: Users },
  { key: 'rides',      label: 'Org Rides',  icon: Car },
  { key: 'bookings',   label: 'Bookings',   icon: CreditCard },
  { key: 'fleet',      label: 'Fleet',      icon: Fuel },
  { key: 'policy',     label: 'Policy',     icon: Settings },
];

/* ─── Role Badge ────────────────────────────────────────────────── */
function RoleBadge({ role }) {
  const map = {
    COMPANY_ADMIN: { label: 'Admin',      cls: 'bg-purple-100 text-purple-700 border-purple-200' },
    EMPLOYEE:      { label: 'Employee',   cls: 'bg-blue-100 text-blue-700 border-blue-200' },
    SUPER_ADMIN:   { label: 'Super Admin',cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  };
  const { label, cls } = map[role] || { label: role, cls: 'bg-neutral-100 text-neutral-600 border-neutral-200' };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
}

/* ─── Booking Status Badge ──────────────────────────────────────── */
function BookingStatusBadge({ status }) {
  const map = {
    BOOKED:            { label: 'Booked',   cls: 'bg-blue-100 text-blue-700' },
    PAYMENT_PENDING:   { label: 'Pending',  cls: 'bg-amber-100 text-amber-700' },
    PAYMENT_COMPLETED: { label: 'Paid',     cls: 'bg-emerald-100 text-emerald-700' },
    CANCELLED:         { label: 'Cancelled',cls: 'bg-red-100 text-red-600' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'bg-neutral-100 text-neutral-600' };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

/* ─── KPI Card ──────────────────────────────────────────────────── */
function KPICard({ label, value, sub, icon: Icon, color }) {
  const colors = {
    blue:   { card: 'border-blue-100 bg-blue-50/30',    icon: 'bg-blue-100 text-blue-700',    label: 'text-blue-700' },
    emerald:{ card: 'border-emerald-100 bg-emerald-50/30', icon: 'bg-emerald-100 text-emerald-700', label: 'text-emerald-700' },
    amber:  { card: 'border-amber-100 bg-amber-50/30',  icon: 'bg-amber-100 text-amber-700',  label: 'text-amber-700' },
    purple: { card: 'border-purple-100 bg-purple-50/30',icon: 'bg-purple-100 text-purple-700',label: 'text-purple-700' },
    indigo: { card: 'border-indigo-100 bg-indigo-50/30',icon: 'bg-indigo-100 text-indigo-700',label: 'text-indigo-700' },
    rose:   { card: 'border-rose-100 bg-rose-50/30',    icon: 'bg-rose-100 text-rose-700',    label: 'text-rose-700' },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className={`card p-5 border ${c.card}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold uppercase tracking-wider ${c.label}`}>{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </div>
  );
}

/* ─── Overview Tab ──────────────────────────────────────────────── */
function OverviewTab({ report, members, rides, bookings }) {
  const { organization, summary, vehicleBreakdown = [] } = report || {};

  const activeRides    = rides.filter(r => r.status === 'PUBLISHED' || r.status === 'IN_PROGRESS').length;
  const completedTrips = rides.filter(r => r.status === 'COMPLETED').length;
  const totalBookings  = bookings.length;
  const activeEmployees = members.filter(m => (m._count?.ridesOffered > 0) || (m._count?.ridesBooked > 0)).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard label="Total Employees"  value={members.length}      sub={`${activeEmployees} active`}        icon={Users}       color="blue" />
        <KPICard label="Active Rides"     value={activeRides}         sub="Published / In Progress"            icon={Car}         color="emerald" />
        <KPICard label="Completed Trips"  value={completedTrips}      sub="All time"                           icon={CheckCircle2} color="purple" />
        <KPICard label="Total Bookings"   value={totalBookings}       sub="All org employees"                  icon={CreditCard}  color="indigo" />
        <KPICard label="Total Distance"   value={`${summary?.totalDistance || 0} km`} sub="Fleet total"       icon={MapPin}      color="amber" />
        <KPICard label="Fleet Vehicles"   value={vehicleBreakdown.length} sub={`${summary?.totalTrips || 0} completed trips`} icon={Fuel} color="rose" />
      </div>

      <div className="card p-6">
        <h2 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Recent Organisation Rides
        </h2>
        {rides.length === 0 ? (
          <EmptyState title="No rides yet" message="Rides offered by employees will appear here." />
        ) : (
          <div className="space-y-3">
            {rides.slice(0, 6).map(ride => (
              <div key={ride.id} className="flex items-center gap-4 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{ride.pickupLoc} → {ride.destination}</p>
                  <p className="text-xs text-neutral-500">{ride.driver?.name} · {formatDateTime(ride.departureTime)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={ride.status} />
                  <span className="text-xs text-neutral-400">{ride.bookings?.length || 0} booked</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Employees Tab ─────────────────────────────────────────────── */
function EmployeesTab({ members }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" /> Organisation Members
        </h2>
        <span className="text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full font-medium">
          {members.length} total
        </span>
      </div>
      {members.length === 0 ? (
        <EmptyState title="No employees found" message="No employees are registered in this organisation yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Rides Offered</th>
                <th className="py-3 px-4 text-center">Rides Booked</th>
                <th className="py-3 px-4 text-right">Wallet Balance</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {m.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="font-semibold text-neutral-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-neutral-600">{m.email}</td>
                  <td className="py-3 px-4"><RoleBadge role={m.role} /></td>
                  <td className="py-3 px-4 text-center font-semibold text-neutral-700">{m._count?.ridesOffered ?? 0}</td>
                  <td className="py-3 px-4 text-center font-semibold text-neutral-700">{m._count?.ridesBooked ?? 0}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">{formatINR(m.walletBalance || 0)}</td>
                  <td className="py-3 px-4 text-neutral-500">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Rides Tab ─────────────────────────────────────────────────── */
function RidesTab({ rides }) {
  const [filter, setFilter] = useState('ALL');
  const statuses = ['ALL', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? rides : rides.filter(r => r.status === filter);

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <Car className="w-4 h-4 text-primary" /> Organisation Rides
        </h2>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                filter === s
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {s === 'ALL' ? `All (${rides.length})` : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No rides found" message="No rides match the selected filter." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Departure</th>
                <th className="py-3 px-4 text-center">Seats</th>
                <th className="py-3 px-4 text-center">Bookings</th>
                <th className="py-3 px-4 text-right">Fare/Seat</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map(ride => (
                <tr key={ride.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-neutral-900 truncate max-w-[160px]">{ride.pickupLoc}</p>
                      <p className="text-neutral-500 truncate max-w-[160px] flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 inline" /> {ride.destination}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-neutral-700">{ride.driver?.name}</td>
                  <td className="py-3 px-4 text-neutral-600">
                    {ride.vehicle?.model} <span className="font-mono text-neutral-400">({ride.vehicle?.registrationNo})</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-600">{formatDateTime(ride.departureTime)}</td>
                  <td className="py-3 px-4 text-center font-semibold text-neutral-800">{ride.availableSeats}</td>
                  <td className="py-3 px-4 text-center font-semibold text-primary">{ride.bookings?.length || 0}</td>
                  <td className="py-3 px-4 text-right font-bold text-neutral-900">{formatINR(ride.farePerSeat || 0)}</td>
                  <td className="py-3 px-4"><StatusBadge status={ride.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Bookings Tab ──────────────────────────────────────────────── */
function BookingsTab({ bookings }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" /> Employee Bookings
        </h2>
        <span className="text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full font-medium">
          {bookings.length} total
        </span>
      </div>
      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" message="Bookings made by employees will appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                <th className="py-3 px-4">Passenger</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Departure</th>
                <th className="py-3 px-4 text-center">Seats</th>
                <th className="py-3 px-4 text-right">Total Fare</th>
                <th className="py-3 px-4">Booking</th>
                <th className="py-3 px-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {b.passenger?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="font-semibold text-neutral-900">{b.passenger?.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-neutral-800 truncate max-w-[140px]">{b.ride?.pickupLoc}</p>
                    <p className="text-neutral-500 truncate max-w-[140px]">→ {b.ride?.destination}</p>
                  </td>
                  <td className="py-3 px-4 text-neutral-600">{b.ride?.driver?.name}</td>
                  <td className="py-3 px-4 text-neutral-500">{b.ride?.departureTime ? formatDateTime(b.ride.departureTime) : '—'}</td>
                  <td className="py-3 px-4 text-center font-semibold text-neutral-800">{b.seatsBooked}</td>
                  <td className="py-3 px-4 text-right font-bold text-neutral-900">{formatINR(b.totalFare || 0)}</td>
                  <td className="py-3 px-4"><BookingStatusBadge status={b.status} /></td>
                  <td className="py-3 px-4">
                    {b.payment ? (
                      <div>
                        <p className="font-semibold text-neutral-700">{b.payment.method}</p>
                        <p className={b.payment.status === 'SUCCESS' ? 'text-emerald-600 font-bold' : 'text-amber-600'}>{b.payment.status}</p>
                      </div>
                    ) : <span className="text-neutral-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Fleet Tab ─────────────────────────────────────────────────── */
function FleetTab({ report }) {
  const { vehicleBreakdown = [], fuelEfficiencyTrends = [] } = report || {};

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <Car className="w-4 h-4 text-primary" /> Vehicle Fleet Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                <th className="py-3 px-4">Vehicle Model</th>
                <th className="py-3 px-4">Registration No</th>
                <th className="py-3 px-4">Fuel Efficiency</th>
                <th className="py-3 px-4 text-center">Trips</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Fuel Consumed</th>
                <th className="py-3 px-4">Fuel Cost</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {vehicleBreakdown.map(v => (
                <tr key={v.vehicleId} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-neutral-900">{v.model}</td>
                  <td className="py-3 px-4 font-mono text-neutral-600">{v.registrationNo}</td>
                  <td className="py-3 px-4 font-medium text-neutral-800">
                    {v.fuelEfficiencyKmpl ? `${v.fuelEfficiencyKmpl} km/L` : <span className="text-emerald-600 font-semibold">EV (Electric)</span>}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-neutral-900">{v.totalTrips}</td>
                  <td className="py-3 px-4 text-neutral-700">{v.totalDistanceKm} km</td>
                  <td className="py-3 px-4 text-neutral-700">{v.fuelConsumedL} L</td>
                  <td className="py-3 px-4 text-neutral-700">₹{v.fuelCost}</td>
                  <td className="py-3 px-4 text-right font-bold text-primary">₹{v.totalCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {vehicleBreakdown.length === 0 && (
            <EmptyState title="No vehicle data available" message="No completed trips recorded for company vehicles yet." />
          )}
        </div>
      </div>

      {fuelEfficiencyTrends.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" /> Monthly Fuel Efficiency Trends
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                  <th className="py-3 px-4">Month</th>
                  <th className="py-3 px-4 text-center">Trips</th>
                  <th className="py-3 px-4">Total Distance</th>
                  <th className="py-3 px-4">Fuel Consumed</th>
                  <th className="py-3 px-4 text-right">Avg Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {fuelEfficiencyTrends.map(t => (
                  <tr key={t.month} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-neutral-900">{t.month}</td>
                    <td className="py-3 px-4 text-center font-semibold text-neutral-800">{t.tripCount}</td>
                    <td className="py-3 px-4 text-neutral-700">{t.totalDistanceKm} km</td>
                    <td className="py-3 px-4 text-neutral-700">{t.totalFuelConsumedL} L</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
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

/* ─── Policy Tab ────────────────────────────────────────────────── */
function PolicyTab({ report, onRefresh }) {
  const { organization, summary } = report || {};
  const [editingPolicy, setEditingPolicy] = useState(false);
  const [policyForm, setPolicyForm] = useState({ fuelCostPerL: '', costPerKm: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (organization) {
      setPolicyForm({ fuelCostPerL: organization.fuelCostPerL || '', costPerKm: organization.costPerKm || '' });
    }
  }, [organization]);

  const handlePolicySave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess('');
    try {
      await updateOrganizationPolicy({ fuelCostPerL: policyForm.fuelCostPerL, costPerKm: policyForm.costPerKm });
      setSaveSuccess('Policy rates updated successfully!');
      setEditingPolicy(false);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update policy rates');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {saveSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" /> Organisation Policy Rates
          </h2>
          <button
            onClick={() => { setEditingPolicy(!editingPolicy); setSaveSuccess(''); }}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            {editingPolicy ? 'Cancel' : 'Edit Policy'}
          </button>
        </div>

        {!editingPolicy ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <Fuel className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Fuel Cost</span>
              </div>
              <p className="text-2xl font-bold text-neutral-900">₹{Number(organization?.fuelCostPerL || 0).toFixed(2)}</p>
              <p className="text-xs text-neutral-500">per Litre</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Reimbursement</span>
              </div>
              <p className="text-2xl font-bold text-neutral-900">₹{Number(organization?.costPerKm || 0).toFixed(2)}</p>
              <p className="text-xs text-neutral-500">per Kilometre</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePolicySave} className="space-y-4">
            <div>
              <label className="label">Fuel Cost (₹ per Litre)</label>
              <input
                type="number" step="0.01" min="0"
                value={policyForm.fuelCostPerL}
                onChange={e => setPolicyForm({ ...policyForm, fuelCostPerL: e.target.value })}
                className="input" placeholder="e.g. 95.50" required
              />
              <p className="text-xs text-neutral-400 mt-1">Used to calculate fleet fuel expenditure</p>
            </div>
            <div>
              <label className="label">Reimbursement Rate (₹ per km)</label>
              <input
                type="number" step="0.01" min="0"
                value={policyForm.costPerKm}
                onChange={e => setPolicyForm({ ...policyForm, costPerKm: e.target.value })}
                className="input" placeholder="e.g. 5.00" required
              />
              <p className="text-xs text-neutral-400 mt-1">Rate used for distance-based reimbursement</p>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saveLoading} className="btn-primary">
                {saveLoading ? 'Saving...' : 'Save Policy'}
              </button>
              <button type="button" onClick={() => setEditingPolicy(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {(summary?.totalDistance || 0) > 0 && (
        <div className="card p-6">
          <h3 className="text-sm font-bold text-neutral-700 mb-3">Fleet Cost Summary (Completed Trips)</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
              <p className="text-xs text-neutral-500">Total Distance Cost</p>
              <p className="font-bold text-neutral-900">₹{((summary?.totalDistance || 0) * (summary?.costPerKm || 0)).toFixed(2)}</p>
              <p className="text-xs text-neutral-400">at ₹{summary?.costPerKm || 0}/km</p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
              <p className="text-xs text-neutral-500">Total Fuel Cost</p>
              <p className="font-bold text-neutral-900">₹{summary?.totalFuelCost || 0}</p>
              <p className="text-xs text-neutral-400">{summary?.totalFuelConsumed || 0} L consumed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Dashboard ────────────────────────────────────────────── */
export default function CompanyAdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const [report, setReport]     = useState(null);
  const [members, setMembers]   = useState([]);
  const [rides, setRides]       = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportData, membersData, ridesData, bookingsData] = await Promise.all([
        getReportSummary(),
        getOrgMembers(),
        getOrgRides(),
        getOrgBookings(),
      ]);
      setReport(reportData);
      setMembers(membersData || []);
      setRides(ridesData || []);
      setBookings(bookingsData || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load organisation data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <Spinner label="Loading Organisation Admin Panel..." />;

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchAll} className="btn-secondary text-xs py-1 px-3 shrink-0">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const { organization } = report || {};

  return (
    <div className="space-y-5 pb-12">
      {/* ── Top Banner ── */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Organisation Admin Panel
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{organization?.name || 'Company'} Administration</h1>
            <p className="text-sm text-neutral-300 mt-1">
              Manage employees · track rides &amp; bookings · fleet analytics · set policy benchmarks
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-neutral-400">Logged in as</p>
              <p className="text-sm font-semibold">{user?.name}</p>
              <RoleBadge role={user?.role} />
            </div>
            <button
              onClick={fetchAll}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                activeTab === tab.key
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'overview'  && <OverviewTab  report={report} members={members} rides={rides} bookings={bookings} />}
      {activeTab === 'employees' && <EmployeesTab members={members} />}
      {activeTab === 'rides'     && <RidesTab     rides={rides} />}
      {activeTab === 'bookings'  && <BookingsTab  bookings={bookings} />}
      {activeTab === 'fleet'     && <FleetTab     report={report} />}
      {activeTab === 'policy'    && <PolicyTab    report={report} onRefresh={fetchAll} />}
    </div>
  );
}
