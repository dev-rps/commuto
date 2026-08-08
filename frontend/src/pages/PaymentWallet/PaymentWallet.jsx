import { useEffect, useState } from 'react';
import { Wallet, TrendingUp, Plus, Clock, ArrowDownLeft, ArrowUpRight, CheckCircle } from 'lucide-react';
import { getWalletTransactions, rechargeWallet } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatDateTime } from '../../lib/utils';
import { SkeletonList } from '../../components/Skeleton';

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000];

const TXN_ICONS = {
  CREDIT: { Icon: ArrowDownLeft, color: 'text-accent-600',   bg: 'bg-accent-50'   },
  DEBIT:  { Icon: ArrowUpRight,  color: 'text-error',        bg: 'bg-error-50'    },
  REFUND: { Icon: CheckCircle,   color: 'text-primary',      bg: 'bg-primary-50'  },
};

export default function PaymentWallet() {
  const { user, login }  = useAuth();
  const toast            = useToast();
  const [txns, setTxns]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount]   = useState('');
  const [adding, setAdding]   = useState(false);
  const [balance, setBalance] = useState(user?.walletBalance ?? 0);

  useEffect(() => {
    getWalletTransactions()
      .then((res) => {
        setTxns(Array.isArray(res) ? res : []);
      })
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false));
  }, []);

  const handleRecharge = async () => {
    const val = Number(amount);
    if (!val || val <= 0) { toast.warning('Enter a valid amount'); return; }
    setAdding(true);
    try {
      const result = await rechargeWallet(val);
      const newBalance = Number(result.walletBalance ?? result.newBalance ?? (balance + val));
      setBalance(newBalance);
      login({ ...user, walletBalance: newBalance }, localStorage.getItem('accessToken'));
      if (result.transaction) {
        setTxns((prev) => [result.transaction, ...(Array.isArray(prev) ? prev : [])]);
      }
      setAmount('');
      toast.success(`₹${val} added to your wallet! 💳`);
    } catch (err) {
      toast.error(err.message || 'Recharge failed');
    } finally { setAdding(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Payment & Wallet</h1>
        <p className="section-desc">Manage your balance and transactions</p>
      </div>

      {/* Premium wallet card */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'var(--gradient-hero)', boxShadow: '0 8px 32px rgb(37 99 235 / 0.35)' }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-0 left-1/2 w-48 h-24 rounded-full bg-white/5 blur-xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-medium text-blue-200">Commuto Wallet</span>
          </div>
          <p className="text-4xl font-bold tracking-tight">{formatINR(balance)}</p>
          <p className="text-blue-200 text-sm mt-1.5 font-medium">Available balance</p>
          <div className="mt-4 pt-4 border-t border-white/15 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent-300" />
            <p className="text-sm text-blue-200">{txns.length} transaction{txns.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
      </div>

      {/* Recharge section */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Add Money</h3>
        {/* Quick amount chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              className={`px-3.5 py-1.5 rounded-full border text-sm font-semibold transition-all ${
                amount === String(q)
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-200 hover:text-primary'
              }`}
            >
              ₹{q}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-sm">₹</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRecharge()}
              placeholder="Enter amount"
              className="input pl-8"
            />
          </div>
          <button onClick={handleRecharge} disabled={adding || !amount} className="btn-primary shrink-0">
            {adding
              ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <><Plus className="w-4 h-4" /> Add</>
            }
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="section-title">Transaction History</h3>
          <Clock className="w-4 h-4 text-neutral-400" />
        </div>

        {loading ? (
          <div className="p-5"><SkeletonList count={4} /></div>
        ) : txns.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-neutral-500">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {txns.map((t) => {
              const { Icon, color, bg } = TXN_ICONS[t.type] || TXN_ICONS.CREDIT;
              const isCredit = t.type === 'CREDIT' || t.type === 'REFUND';
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {t.description || (t.type === 'CREDIT' ? 'Wallet Top-up' : t.type === 'DEBIT' ? 'Ride Payment' : 'Refund')}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatDateTime(t.createdAt)}</p>
                  </div>
                  <span className={`text-base font-bold shrink-0 ${isCredit ? 'text-accent-600' : 'text-error'}`}>
                    {isCredit ? '+' : '-'}{formatINR(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
