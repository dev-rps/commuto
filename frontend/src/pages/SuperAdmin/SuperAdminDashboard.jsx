import { useState, useEffect } from 'react';
import { 
  Building2, Users, Car, MapPin, CreditCard, 
  Database, RefreshCw, ShieldCheck, Search, Filter 
} from 'lucide-react';
import { getPlatformOverview } from '../../lib/api';
import { Spinner, StatusBadge, EmptyState } from '../../components';

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await getPlatformOverview();
      setData(overview);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load platform data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return <Spinner label="Loading Platform Database Metrics..." />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-error/10 border border-error/20 p-4 text-error text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchOverview} className="btn-secondary text-xs py-1 px-3">Retry</button>
        </div>
      </div>
    );
  }

  const { orgs = [], usersCount = 0, vehiclesCount = 0, rides = [], bookings = [], payments = [], walletTxns = [], allUsers = [] } = data || {};

  // Calculate totals
  const totalPaymentVolume = payments.reduce((sum, p) => sum + (p.status === 'SUCCESS' ? Number(p.amount) : 0), 0);
  const totalWalletVolume = walletTxns.reduce((sum, w) => sum + Number(w.amount), 0);

  // Filter lists
  const filteredUsers = allUsers.filter(u =>
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.organization?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWalletTxns = walletTxns.filter(t => 
    (t.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRides = rides.filter(r =>
    (r.pickupLoc || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.destination || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.driver?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 to-purple-950 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Super Admin System Control
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Database & Analytics</h1>
          <p className="text-sm text-neutral-300 mt-1">
            Live database management, system-wide transactions, total rides & enterprise organization metrics.
          </p>
        </div>
        <button
          onClick={fetchOverview}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 text-sm font-medium transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Database
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 border border-purple-100 bg-purple-50/30">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-700">Total System Volume</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">₹{(totalPaymentVolume + totalWalletVolume).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-neutral-500 mt-1">Payments (₹{totalPaymentVolume}) + Wallets (₹{totalWalletVolume})</p>
        </div>

        <div className="card p-5 border border-blue-100 bg-blue-50/30">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Total Platform Rides</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{rides.length}</p>
          <p className="text-xs text-neutral-500 mt-1">{bookings.length} passenger bookings processed</p>
        </div>

        <div className="card p-5 border border-emerald-100 bg-emerald-50/30">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Registered Companies</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{orgs.length}</p>
          <p className="text-xs text-neutral-500 mt-1">Infosys, Wipro, TCS & enterprise networks</p>
        </div>

        <div className="card p-5 border border-amber-100 bg-amber-50/30">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Total Users & Fleet</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{usersCount} Users</p>
          <p className="text-xs text-neutral-500 mt-1">{vehiclesCount} registered active vehicles</p>
        </div>
      </div>

      {/* Enterprise Organizations Summary */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Enterprise Organizations Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orgs.map(org => {
            const empCount = (org.users || []).filter(u => u.role === 'EMPLOYEE').length;
            const adminCount = (org.users || []).filter(u => u.role === 'COMPANY_ADMIN').length;
            return (
              <div key={org.id} className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-neutral-900">{org.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary-50 text-primary-700">
                    ID: {org.id.slice(0, 8)}...
                  </span>
                </div>
                <div className="space-y-1 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Employees:</span>
                    <span className="font-semibold text-neutral-900">{empCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admins:</span>
                    <span className="font-semibold text-neutral-900">{adminCount}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-200">
                    <span>Fuel Rate benchmark:</span>
                    <span className="font-semibold text-neutral-900">₹{Number(org.fuelCostPerL).toFixed(2)}/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reimbursement cost:</span>
                    <span className="font-semibold text-neutral-900">₹{Number(org.costPerKm).toFixed(2)}/km</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs & Data Table */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 border-b border-neutral-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-2.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              👥 Registered Users ({allUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`pb-2.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'transactions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              💳 Transactions ({walletTxns.length + payments.length})
            </button>
            <button
              onClick={() => setActiveTab('rides')}
              className={`pb-2.5 px-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'rides'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              🚗 All System Rides ({rides.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search data..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pl-9 text-xs py-2 w-full"
            />
          </div>
        </div>

        {/* Tab 0: Registered Users Table */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Wallet Balance</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-neutral-900">{u.name}</td>
                    <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'COMPANY_ADMIN' ? 'bg-blue-100 text-blue-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-700 font-medium">
                      {u.organization?.name || 'Platform (Super Admin)'}
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      ₹{Number(u.walletBalance || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <EmptyState title="No users found" message="Try searching for a different user name or email." />
            )}
          </div>
        )}

        {/* Tab 1: Transactions Table */}
        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Type / Channel</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Balance After</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredWalletTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-neutral-500">{t.id.slice(0, 12)}...</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{t.user?.name || 'N/A'}</div>
                      <div className="text-[11px] text-neutral-500">{t.user?.email || ''}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.type} />
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      ₹{Number(t.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      ₹{Number(t.balanceAfter).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredWalletTxns.length === 0 && (
              <EmptyState title="No transactions found" message="Try searching for a different user or term." />
            )}
          </div>
        )}

        {/* Tab 2: System Rides Table */}
        {activeTab === 'rides' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 font-semibold">
                  <th className="py-3 px-4">Ride Route</th>
                  <th className="py-3 px-4">Driver & Org</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Fare / Seat</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Departure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredRides.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{r.pickupLoc}</div>
                      <div className="text-[11px] text-neutral-500">➔ {r.destination}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{r.driver?.name}</div>
                      <div className="text-[11px] text-neutral-500">{r.driver?.organization?.name}</div>
                    </td>
                    <td className="py-3 px-4 text-neutral-700">
                      {r.vehicle?.model} ({r.vehicle?.registrationNo})
                    </td>
                    <td className="py-3 px-4 font-semibold text-neutral-800">
                      {r.availableSeats} open
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      ₹{Number(r.farePerSeat).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(r.departureTime).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRides.length === 0 && (
              <EmptyState title="No rides found" message="No ride records match your search filter." />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
