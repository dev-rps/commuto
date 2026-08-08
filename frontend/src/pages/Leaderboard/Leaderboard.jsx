import { useState, useEffect } from 'react';
import { Trophy, Award, Leaf, Users, Car, Sparkles } from 'lucide-react';
import { getLeaderboard } from '../../lib/api';
import { SkeletonCard } from '../../components';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setLeaderboard)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Company Carpool Leaderboard</h1>
          <p className="section-desc">Loading top eco commuters...</p>
        </div>
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            <h1 className="text-2xl font-bold text-neutral-900">Company Eco Leaderboard</h1>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Gamified participation & green commute rankings for your enterprise
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
          <span>Employer Incentive: Monthly Top 3 Win ₹2,500 Commute Vouchers</span>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Rank 2 */}
          {top3[1] && (
            <div className="card p-6 bg-gradient-to-b from-slate-50 to-white border-slate-200 flex flex-col items-center text-center space-y-3 relative overflow-hidden order-2 md:order-1">
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-200 text-slate-700">
                #2 SILVER
              </div>
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-xl font-bold text-slate-700 shadow-inner">
                {top3[1].name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900">{top3[1].name}</h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {top3[1].badge}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-neutral-100 text-xs">
                <div className="bg-white p-2 rounded-lg border border-neutral-100">
                  <div className="text-neutral-500 font-medium">CO₂ Saved</div>
                  <div className="font-bold text-emerald-600">{top3[1].co2SavedKg} kg</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-neutral-100">
                  <div className="text-neutral-500 font-medium">Rides</div>
                  <div className="font-bold text-primary">{top3[1].ridesShared}</div>
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 */}
          {top3[0] && (
            <div className="card p-6 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/30 border-amber-300 shadow-lg shadow-amber-500/10 flex flex-col items-center text-center space-y-3 relative overflow-hidden order-1 md:order-2 transform -translate-y-2">
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-amber-950 flex items-center space-x-1 shadow-sm">
                <Trophy className="w-3.5 h-3.5" />
                <span>#1 GOLD</span>
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-amber-200 flex items-center justify-center text-2xl font-black text-amber-950 shadow-md">
                {top3[0].name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900">{top3[0].name}</h3>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-extrabold bg-emerald-600 text-white shadow-sm">
                  {top3[0].badge}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full pt-3 border-t border-amber-100 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-amber-100 shadow-sm">
                  <div className="text-neutral-500 font-medium">CO₂ Offset</div>
                  <div className="font-extrabold text-emerald-600 text-sm">{top3[0].co2SavedKg} kg</div>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-amber-100 shadow-sm">
                  <div className="text-neutral-500 font-medium">Trees Saved</div>
                  <div className="font-extrabold text-emerald-700 text-sm">🌳 {top3[0].treesSaved}</div>
                </div>
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {top3[2] && (
            <div className="card p-6 bg-gradient-to-b from-amber-900/5 to-white border-amber-700/20 flex flex-col items-center text-center space-y-3 relative overflow-hidden order-3">
              <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-800/20 text-amber-900">
                #3 BRONZE
              </div>
              <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-700/30 flex items-center justify-center text-xl font-bold text-amber-900 shadow-inner">
                {top3[2].name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900">{top3[2].name}</h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {top3[2].badge}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-neutral-100 text-xs">
                <div className="bg-white p-2 rounded-lg border border-neutral-100">
                  <div className="text-neutral-500 font-medium">CO₂ Saved</div>
                  <div className="font-bold text-emerald-600">{top3[2].co2SavedKg} kg</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-neutral-100">
                  <div className="text-neutral-500 font-medium">Rides</div>
                  <div className="font-bold text-primary">{top3[2].ridesShared}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-bold text-neutral-900 flex items-center space-x-2">
            <Award className="w-5 h-5 text-primary" />
            <span>Full Company Standings</span>
          </h3>
          <span className="text-xs text-neutral-500">Updated daily based on verified completed commutes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-600 text-xs font-semibold border-b border-neutral-100">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Rides Shared</th>
                <th className="py-3 px-4">Passengers Carried</th>
                <th className="py-3 px-4">CO₂ Offset (kg)</th>
                <th className="py-3 px-4">Trees Equivalent</th>
                <th className="py-3 px-4">Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {leaderboard.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-neutral-700">#{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-neutral-900">{item.name}</div>
                    <div className="text-xs text-neutral-400">{item.email}</div>
                  </td>
                  <td className="py-3 px-4 text-neutral-700 font-medium">{item.ridesShared}</td>
                  <td className="py-3 px-4 text-neutral-700 font-medium">{item.passengersCarried}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">{item.co2SavedKg} kg</td>
                  <td className="py-3 px-4 text-emerald-700 font-medium">🌳 {item.treesSaved}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
