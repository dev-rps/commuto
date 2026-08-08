import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wallet, Plus, Banknote, CreditCard, Smartphone, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { getWallet, rechargeWallet, initiatePayment, getMyBookings } from '../../lib/api';
import { StatusBadge, Spinner, FieldError } from '../../components';
import { formatINR, formatDateTime } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const methods = [
  { value: 'CASH', label: 'Cash', icon: Banknote },
  { value: 'CARD', label: 'Card', icon: CreditCard },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'WALLET', label: 'Wallet', icon: Wallet },
];

export default function PaymentWallet() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const pendingBookingId = location.state?.bookingId;
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeError, setRechargeError] = useState('');
  const [recharging, setRecharging] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('WALLET');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [payMessage, setPayMessage] = useState('');
  const [pendingBooking, setPendingBooking] = useState(null);

  useEffect(() => {
    const load = async () => {
      const w = await getWallet();
      setWallet(w);
      if (pendingBookingId) {
        const bookings = await getMyBookings();
        const b = bookings.find((bk) => bk.id === pendingBookingId);
        if (b) setPendingBooking(b);
      }
      setLoading(false);
    };
    load();
  }, [pendingBookingId]);

  const handleRecharge = async (e) => {
    e.preventDefault();
    setRechargeError('');
    if (!rechargeAmount || rechargeAmount <= 0) { setRechargeError('Amount must be a positive value'); return; }
    setRecharging(true);
    try {
      const result = await rechargeWallet(Number(rechargeAmount));
      setWallet({ balance: result.walletBalance, transactions: [result.transaction, ...(wallet?.transactions || [])] });
      setUser({ ...user, walletBalance: result.walletBalance });
      setRechargeAmount('');
    } catch (err) { setRechargeError(err.message || 'Failed to recharge'); }
    finally { setRecharging(false); }
  };

  const handlePay = async () => {
    setPaying(true); setPayError(''); setPayMessage('');
    try {
      const result = await initiatePayment(pendingBookingId, selectedMethod);
      setPayMessage(result.message || 'Payment completed');
      setTimeout(() => navigate('/trips'), 1500);
    } catch (err) { setPayError(err.message || 'Payment failed'); }
    finally { setPaying(false); }
  };

  if (loading) return <Spinner label="Loading wallet..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Payment & Wallet</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your balance and payment methods</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Wallet balance + recharge */}
        <div className="space-y-4">
          <div className="card p-6 bg-gradient-to-br from-primary to-primary-700 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5" />
              <span className="text-sm text-primary-100">Wallet Balance</span>
            </div>
            <p className="text-3xl font-bold">{formatINR(wallet?.balance ?? user?.walletBalance)}</p>
          </div>

          <form onSubmit={handleRecharge} className="card p-6 space-y-4">
            <h3 className="font-semibold text-neutral-900">Recharge Wallet</h3>
            <div>
              <label className="label">Amount (₹)</label>
              <input type="number" min="1" step="0.01" value={rechargeAmount} onChange={(e) => { setRechargeAmount(e.target.value); setRechargeError(''); }} placeholder="500" className={`input ${rechargeError ? 'input-error' : ''}`} />
              <FieldError error={rechargeError} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[100, 200, 500, 1000].map((amt) => (
                <button key={amt} type="button" onClick={() => setRechargeAmount(amt)} className="px-3 py-1.5 rounded-md border border-neutral-300 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
                  ₹{amt}
                </button>
              ))}
            </div>
            <button type="submit" disabled={recharging} className="btn-primary w-full">{recharging ? 'Processing...' : 'Recharge'}</button>
          </form>
        </div>

        {/* Pending payment or method selection */}
        <div className="space-y-4">
          {pendingBooking ? (
            <div className="card p-6 space-y-4">
              <h3 className="font-semibold text-neutral-900">Pay for Booking</h3>
              <div className="rounded-md bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500">{pendingBooking.ride?.pickupLoc} → {pendingBooking.ride?.destination}</p>
                <p className="text-xl font-bold text-neutral-900 mt-1">{formatINR(pendingBooking.totalFare)}</p>
              </div>
              <div>
                <label className="label">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {methods.map((m) => (
                    <button key={m.value} type="button" onClick={() => setSelectedMethod(m.value)}
                      className={`flex items-center gap-2 p-3 rounded-md border text-sm font-medium transition-colors ${selectedMethod === m.value ? 'border-primary bg-primary-50 text-primary-700' : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}>
                      <m.icon className="w-4 h-4" /> {m.label}
                    </button>
                  ))}
                </div>
              </div>
              {payError && <div className="rounded-md bg-error/10 px-4 py-3 text-sm text-error font-medium">{payError}</div>}
              {payMessage && <div className="rounded-md bg-accent-50 px-4 py-3 text-sm text-accent-700 font-medium">{payMessage}</div>}
              <button onClick={handlePay} disabled={paying} className="btn-primary w-full">{paying ? 'Processing...' : `Pay ${formatINR(pendingBooking.totalFare)}`}</button>
            </div>
          ) : (
            <div className="card p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Payment Methods</h3>
              <div className="space-y-2">
                {methods.map((m) => (
                  <div key={m.value} className="flex items-center gap-3 p-3 rounded-md border border-neutral-200">
                    <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center">
                      <m.icon className="w-5 h-5 text-neutral-600" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transaction history */}
      <div className="card p-6">
        <h3 className="font-semibold text-neutral-900 mb-4">Transaction History</h3>
        {wallet?.transactions?.length === 0 ? (
          <p className="text-sm text-neutral-500 py-4 text-center">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {wallet?.transactions?.map((txn) => (
              <div key={txn.id} className="flex items-center gap-4 py-3 border-b border-neutral-100 last:border-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${txn.type === 'RECHARGE' ? 'bg-accent-50' : 'bg-primary-50'}`}>
                  {txn.type === 'RECHARGE' ? <ArrowDownRight className="w-4 h-4 text-accent-600" /> : <ArrowUpRight className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{txn.type === 'RECHARGE' ? 'Wallet Recharge' : txn.type === 'RIDE_PAYMENT' ? 'Ride Payment' : 'Refund'}</p>
                  <p className="text-xs text-neutral-500">{formatDateTime(txn.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${txn.type === 'RECHARGE' ? 'text-accent-600' : 'text-neutral-900'}`}>
                    {txn.type === 'RECHARGE' ? '+' : '-'}{formatINR(txn.amount)}
                  </p>
                  <p className="text-xs text-neutral-400">Bal: {formatINR(txn.balanceAfter)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
