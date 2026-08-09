import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, Plus, Clock, ArrowDownLeft, ArrowUpRight, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { getWalletTransactions, rechargeWallet, getMyBookings, initiatePayment } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR, formatDateTime } from '../../lib/utils';
import { SkeletonList } from '../../components/Skeleton';

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000];

const TXN_ICONS = {
  RECHARGE:     { Icon: ArrowDownLeft, color: 'text-accent-600',   bg: 'bg-accent-50'   },
  RIDE_PAYMENT: { Icon: ArrowUpRight,  color: 'text-error',        bg: 'bg-error-50'    },
  RIDE_EARNING: { Icon: ArrowDownLeft, color: 'text-accent-600',   bg: 'bg-accent-50'   },
  REFUND:       { Icon: CheckCircle,   color: 'text-primary',      bg: 'bg-primary-50'  },
};

export default function PaymentWallet() {
  const { user, login }  = useAuth();
  const toast            = useToast();
  const location         = useLocation();
  const navigate         = useNavigate();
  const pendingBookingId = location.state?.bookingId || null;

  const [txns, setTxns]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount]   = useState('');
  const [adding, setAdding]   = useState(false);
  const [balance, setBalance] = useState(user?.walletBalance ?? 0);

  // Pending booking payment state
  const [pendingBooking, setPendingBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(!!pendingBookingId);
  const [payingBooking, setPayingBooking]   = useState(false);
  const [paymentMethod, setPaymentMethod]   = useState('WALLET');
  const [bookingPaid, setBookingPaid]       = useState(false);

  // Sync local balance state with the live Auth balance
  useEffect(() => {
    if (user?.walletBalance !== undefined) {
      setBalance(Number(user.walletBalance));
    }
  }, [user?.walletBalance]);

  const loadTransactions = () => {
    getWalletTransactions()
      .then((res) => {
        setTxns(Array.isArray(res) ? res : []);
      })
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false));
  };

  const loadPendingBooking = () => {
    if (!pendingBookingId) return;
    getMyBookings()
      .then((bookings) => {
        const booking = (bookings || []).find(b => b.id === pendingBookingId);
        setPendingBooking(booking || null);
        if (booking && booking.status === 'PAYMENT_COMPLETED') {
          setBookingPaid(true);
        }
      })
      .catch(() => setPendingBooking(null))
      .finally(() => setLoadingBooking(false));
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    loadPendingBooking();
  }, [pendingBookingId]);

  // Live socket updates listener
  useEffect(() => {
    const handleUpdate = () => {
      console.log('[PaymentWallet] Live update triggered from socket event');
      loadTransactions();
      loadPendingBooking();
    };
    window.addEventListener('commuto:update', handleUpdate);
    return () => window.removeEventListener('commuto:update', handleUpdate);
  }, [pendingBookingId]);

  const handlePayBooking = async () => {
    if (!pendingBooking) return;
    setPayingBooking(true);
    try {
      await initiatePayment(pendingBooking.id, paymentMethod);
      setBookingPaid(true);
      toast.success('Payment completed successfully!');
      // Refresh wallet balance if wallet payment
      if (paymentMethod === 'WALLET') {
        const newBalance = balance - (pendingBooking.totalFare || 0);
        setBalance(Math.max(0, newBalance));
        login({ ...user, walletBalance: Math.max(0, newBalance) }, localStorage.getItem('accessToken'));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Payment failed');
    } finally {
      setPayingBooking(false);
    }
  };

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

      {/* Pending Booking Payment Panel */}
      {pendingBookingId && (
        <div className="card p-5 border-2 border-amber-300 bg-amber-50/40">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-neutral-900">Complete Pending Payment</h3>
          </div>
          {loadingBooking ? (
            <div className="flex items-center gap-2 text-sm text-neutral-500 py-2">
              <span className="w-4 h-4 rounded-full border-2 border-neutral-300 border-t-neutral-600 animate-spin" />
              Loading booking details...
            </div>
          ) : bookingPaid ? (
            <div className="flex items-center gap-3 text-green-700 bg-green-50 border border-green-200 rounded-xl p-4">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold">Payment Successful!</p>
                <p className="text-sm text-green-600">Your booking has been paid.</p>
              </div>
              <button onClick={() => navigate('/trips')} className="ml-auto btn-secondary text-xs">
                <ArrowLeft className="w-3 h-3" /> My Trips
              </button>
            </div>
          ) : pendingBooking ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-amber-200">
                <div>
                  <p className="text-sm text-neutral-500">Fare Amount</p>
                  <p className="text-2xl font-bold text-neutral-900">{formatINR(pendingBooking.totalFare)}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {pendingBooking.ride?.pickupLoc} → {pendingBooking.ride?.destination}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Seats</p>
                  <p className="font-bold text-neutral-900">{pendingBooking.seatsBooked}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-neutral-900">Select Payment Method</p>
                {['WALLET', 'UPI', 'CARD', 'CASH'].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                      paymentMethod === method
                        ? 'border-primary bg-primary-50/50 shadow-sm'
                        : 'border-neutral-200 hover:border-primary-200 bg-white'
                    }`}
                  >
                    <span className="font-medium text-neutral-900">{method === 'WALLET' ? `Commuto Wallet (${formatINR(balance)})` : method}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === method ? 'border-primary' : 'border-neutral-300'
                    }`}>
                      {paymentMethod === method && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                  </button>
                ))}
              </div>
              {paymentMethod === 'WALLET' && balance < (pendingBooking.totalFare || 0) && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  ⚠️ Insufficient wallet balance. Please add money below or choose another payment method.
                </p>
              )}
              <button
                onClick={handlePayBooking}
                disabled={payingBooking || (paymentMethod === 'WALLET' && balance < (pendingBooking.totalFare || 0))}
                className="btn-primary w-full py-3 text-base"
              >
                {payingBooking
                  ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  : `Pay ${formatINR(pendingBooking.totalFare)} Now`}
              </button>
              <button onClick={() => navigate('/trips')} className="btn-ghost w-full text-neutral-500 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to My Trips
              </button>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Could not load booking details. <button onClick={() => navigate('/trips')} className="text-primary underline">Go back to trips</button></p>
          )}
        </div>
      )}

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
              const { Icon, color, bg } = TXN_ICONS[t.type] || TXN_ICONS.RECHARGE;
              const isCredit = t.type === 'RECHARGE' || t.type === 'REFUND' || t.type === 'RIDE_EARNING';
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {t.description || (t.type === 'RECHARGE' ? 'Wallet Top-up' : t.type === 'RIDE_PAYMENT' ? 'Ride Payment' : t.type === 'RIDE_EARNING' ? 'Trip Earnings' : 'Refund')}
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
