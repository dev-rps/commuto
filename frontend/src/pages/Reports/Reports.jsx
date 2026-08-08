import { useEffect, useState } from 'react';
import { ChartBar as BarChart3, TrendingUp, Fuel, DollarSign, Car } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getReportSummary } from '../../lib/api';
import { Spinner } from '../../components';
import { formatINR } from '../../lib/utils';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getReportSummary().then(setReport).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <Spinner label="Loading reports..." />;
  if (!report) return <div className="text-center py-8 text-neutral-500">Failed to load report data</div>;

  const { summary, vehicleBreakdown, fuelEfficiencyTrends } = report;

  const vehicleChartData = vehicleBreakdown.map((v) => ({
    name: v.model.split(' ').slice(-1)[0],
    'Fuel Cost': v.fuelCost,
    'Distance Cost': v.distanceCost,
    'Total Cost': v.totalCost,
  }));

  const trendChartData = fuelEfficiencyTrends.map((t) => ({
    month: t.month,
    'Avg Efficiency (km/L)': t.avgEfficiencyKmpl,
    'Trips': t.tripCount,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Reports & Analytics</h1>
        <p className="text-sm text-neutral-500 mt-1">{report.organization?.name} — fleet performance overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3} label="Total Trips" value={summary.totalTrips} color="text-primary" />
        <StatCard icon={TrendingUp} label="Total Distance" value={`${summary.totalDistance} km`} color="text-accent-600" />
        <StatCard icon={Fuel} label="Fuel Consumed" value={`${summary.totalFuelConsumed.toFixed(2)} L`} color="text-warning" />
        <StatCard icon={DollarSign} label="Cost per Km" value={formatINR(summary.costPerKm)} color="text-neutral-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard icon={DollarSign} label="Total Fuel Cost" value={formatINR(summary.totalFuelCost)} color="text-warning" />
        <StatCard icon={Car} label="Total Passengers" value={summary.totalPassengers} color="text-primary" />
        <StatCard icon={TrendingUp} label="Avg Trip Distance" value={`${(summary.totalDistance / summary.totalTrips).toFixed(1)} km`} color="text-accent-600" />
      </div>

      {/* Vehicle-wise cost breakdown */}
      <div className="card p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Vehicle-wise Cost Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vehicleChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <Legend />
            <Bar dataKey="Fuel Cost" fill="#2563EB" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Distance Cost" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Total Cost" fill="#D97706" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Vehicle breakdown table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="font-semibold text-neutral-900">Vehicle Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left font-semibold text-neutral-700 px-4 py-3">Vehicle</th>
                <th className="text-right font-semibold text-neutral-700 px-4 py-3">Trips</th>
                <th className="text-right font-semibold text-neutral-700 px-4 py-3">Distance</th>
                <th className="text-right font-semibold text-neutral-700 px-4 py-3">Fuel (L)</th>
                <th className="text-right font-semibold text-neutral-700 px-4 py-3">Fuel Cost</th>
                <th className="text-right font-semibold text-neutral-700 px-4 py-3">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {vehicleBreakdown.map((v) => (
                <tr key={v.vehicleId} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{v.model}</p>
                    <p className="text-xs text-neutral-500">{v.registrationNo}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-600">{v.totalTrips}</td>
                  <td className="px-4 py-3 text-right text-neutral-600">{v.totalDistanceKm} km</td>
                  <td className="px-4 py-3 text-right text-neutral-600">{v.fuelConsumedL.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-neutral-600">{formatINR(v.fuelCost)}</td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">{formatINR(v.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fuel efficiency trends */}
      <div className="card p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Fuel Efficiency Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="Avg Efficiency (km/L)" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="Trips" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5">
      <Icon className={`w-5 h-5 ${color} mb-2`} />
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500 mt-1">{label}</p>
    </div>
  );
}
