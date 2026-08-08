import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation, Clock, MapPin, ArrowLeft, Share2, CheckCircle } from 'lucide-react';
import { RouteMap, Spinner, StatusBadge } from '../../components';
import { getRide, updateRideStatus, startRide, initiatePayment } from '../../lib/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { haversineKm } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';

// Hook to smoothly interpolate coordinates on position updates
function useSmoothPosition(targetPos) {
  const [animatedPos, setAnimatedPos] = useState(targetPos);
  const animRef = useRef(null);

  useEffect(() => {
    if (!targetPos) return;
    if (!animatedPos) {
      setAnimatedPos(targetPos);
      return;
    }

    const startLat = animatedPos.lat;
    const startLng = animatedPos.lng;
    const endLat = targetPos.lat;
    const endLng = targetPos.lng;
    const startTime = performance.now();
    const duration = 600; // 600ms smooth lerp transition

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic formula
      const ease = 1 - Math.pow(1 - progress, 3);

      setAnimatedPos({
        lat: startLat + (endLat - startLat) * ease,
        lng: startLng + (endLng - startLng) * ease,
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPos?.lat, targetPos?.lng]);

  return animatedPos || targetPos;
}

export default function LiveTracking() {
  const { rideId } = useParams();
  const navigate   = useNavigate();
  const toast      = useToast();
  const { user }   = useAuth();
  const { socket, events, joinRideRoom, leaveRideRoom } = useSocket();
  const [ride, setRide]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [currentPos, setCurrentPos] = useState(null);
  const [eta, setEta]           = useState(null);
  const intervalRef             = useRef(null);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess]     = useState(false);
  const [paymentMethod, setPaymentMethod]       = useState('WALLET');
  const [paying, setPaying]                     = useState(false);

  const animatedPos = useSmoothPosition(currentPos);

  useEffect(() => {
    getRide(rideId).then((r) => {
      setRide(r);
      setCurrentPos({ lat: r.pickupLat, lng: r.pickupLng });
    }).catch(() => toast.error('Failed to load ride')).finally(() => setLoading(false));
  }, [rideId]);

  const handleLocationUpdate = useCallback((data) => {
    if (data?.lat != null && data?.lng != null) setCurrentPos({ lat: data.lat, lng: data.lng });
  }, []);

  const handleStatusUpdate = useCallback((data) => {
    if (data?.status && ride) {
      setRide(prev => ({ ...prev, status: data.status }));
      if (data.status === 'COMPLETED') {
        setShowPaymentModal(true);
      }
    }
  }, [ride]);

  useEffect(() => {
    if (!rideId) return;
    joinRideRoom?.(rideId);
    if (socket) {
      socket.on(events.rideLocation(rideId), handleLocationUpdate);
      socket.on(events.rideStatus(rideId), handleStatusUpdate);
    }
    return () => {
      leaveRideRoom?.(rideId);
      if (socket) {
        socket.off(events.rideLocation(rideId));
        socket.off(events.rideStatus(rideId));
      }
    };
  }, [rideId, socket, events, joinRideRoom, leaveRideRoom, handleLocationUpdate, handleStatusUpdate]);

  useEffect(() => {
    if (ride?.status === 'COMPLETED') setShowPaymentModal(true);
  }, [ride?.status]);

  // Mock movement simulation
  useEffect(() => {
    if (!ride || ride.status !== 'IN_PROGRESS') return;
    let progress = 0;
    const steps = 100;
    const totalMs = 30000;
    intervalRef.current = setInterval(() => {
      progress += 1;
      if (progress >= steps) { clearInterval(intervalRef.current); return; }
      const t = progress / steps;
      const lat = ride.pickupLat + (ride.destLat - ride.pickupLat) * t;
      const lng = ride.pickupLng + (ride.destLng - ride.pickupLng) * t;
      setCurrentPos({ lat, lng });
      const remaining = haversineKm(lat, lng, ride.destLat, ride.destLng);
      setEta(Math.round((remaining / 30) * 60));
    }, totalMs / steps);
    return () => clearInterval(intervalRef.current);
  }, [ride]);

  if (loading) return <Spinner label="Loading trip..." />;
  if (!ride) return <div className="text-center py-8 text-neutral-500">Ride not found</div>;

  const distanceLeft = animatedPos ? haversineKm(animatedPos.lat, animatedPos.lng, ride.destLat, ride.destLng).toFixed(1) : '—';
  const isDriver = user?.id === ride.driverId;
  const myBooking = ride.bookings?.find(b => b.passengerId === user?.id);
  const amountDue = isDriver 
    ? (ride.farePerSeat * (ride.bookings?.filter(b => b.status === 'BOOKED' || b.status === 'PAYMENT_COMPLETED').reduce((acc, curr) => acc + curr.seats, 0) || 0)) 
    : (myBooking?.totalFare || ride.farePerSeat);

  return (
    <div className="max-w-4xl mx-auto space-y-4 relative">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
          className="btn-secondary text-xs"
          aria-label="Share tracking link"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>

      {/* Status banner */}
      <div className={`rounded-2xl p-4 flex items-center justify-between ${
        ride.status === 'IN_PROGRESS'
          ? 'text-white'
          : 'bg-white border border-neutral-200'
      }`}
        style={ride.status === 'IN_PROGRESS' ? { background: 'var(--gradient-hero)', boxShadow: '0 4px 16px rgb(37 99 235 / 0.25)' } : {}}
      >
        <div className="flex items-center gap-3">
          {ride.status === 'IN_PROGRESS' && (
            <span className="w-3 h-3 rounded-full bg-white animate-pulse shrink-0" />
          )}
          <div>
            <p className={`font-bold ${ride.status === 'IN_PROGRESS' ? 'text-white' : 'text-neutral-900'}`}>
              {ride.status === 'IN_PROGRESS' ? 'Trip in progress' : ride.status === 'COMPLETED' ? 'Trip completed' : 'Trip scheduled'}
            </p>
            <p className={`text-sm mt-0.5 ${ride.status === 'IN_PROGRESS' ? 'text-blue-200' : 'text-neutral-500'}`}>
              {ride.pickupLoc} → {ride.destination}
            </p>
          </div>
        </div>
        <StatusBadge status={ride.status} />
      </div>

      {/* Map */}
      <div className="card overflow-hidden">
        <RouteMap
          pickupLat={ride.pickupLat} pickupLng={ride.pickupLng}
          destLat={ride.destLat} destLng={ride.destLng}
          movingLat={animatedPos?.lat} movingLng={animatedPos?.lng}
          height="420px" zoom={12}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: MapPin,    label: 'Distance Left', value: `${distanceLeft} km`, gradient: 'var(--gradient-primary)' },
          { icon: Clock,     label: 'ETA',            value: eta != null ? `${eta} min` : '—', gradient: 'var(--gradient-warm)' },
          { icon: Navigation, label: 'Total Distance', value: `${ride.distanceKm?.toFixed(1) || '—'} km`, gradient: 'var(--gradient-accent)' },
        ].map(({ icon: Icon, label, value, gradient }) => (
          <div key={label} className="card p-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
              style={{ background: gradient }}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-neutral-500 font-medium">{label}</p>
            <p className="text-lg font-bold text-neutral-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Driver Controls */}
      {isDriver && (
        <div className="card p-4 mt-4 bg-neutral-50 border border-neutral-200">
          <h3 className="font-bold text-neutral-900 mb-3">Driver Controls</h3>
          
          {ride.status === 'PUBLISHED' && (
            <button 
              onClick={async () => {
                try {
                  const updated = await updateRideStatus(ride.id, 'AT_PICKUP');
                  setRide({ ...ride, status: updated.status });
                  toast.success('Status updated to At Pickup');
                } catch (e) {
                  toast.error(e.response?.data?.error || e.message || 'Failed to update status');
                }
              }}
              className="btn-primary w-full"
            >
              I have arrived at Pickup
            </button>
          )}

          {ride.status === 'AT_PICKUP' && (
            <div className="space-y-3">
              <input
                type="text"
                maxLength="4"
                placeholder="Enter 4-digit passenger OTP to start"
                className="input w-full text-center tracking-[0.5em] text-lg font-bold"
                id="otpInput"
              />
              <button 
                onClick={async () => {
                  const otp = document.getElementById('otpInput').value;
                  if (!otp || otp.length !== 4) return toast.error('Enter valid 4-digit OTP');
                  try {
                    const updated = await startRide(ride.id, otp);
                    setRide({ ...ride, status: updated.status });
                    toast.success('Ride started!');
                  } catch (e) {
                    toast.error(e.response?.data?.error || e.message || 'Failed to start ride');
                  }
                }}
                className="btn-primary w-full"
                style={{ background: 'var(--gradient-hero)' }}
              >
                Verify OTP & Start Ride
              </button>
            </div>
          )}

          {ride.status === 'IN_PROGRESS' && (
            <button 
              onClick={async () => {
                try {
                  const updated = await updateRideStatus(ride.id, 'COMPLETED');
                  setRide({ ...ride, status: updated.status });
                  toast.success('Ride completed!');
                  setShowPaymentModal(true);
                } catch (e) {
                  toast.error(e.response?.data?.error || e.message || 'Failed to finish ride');
                }
              }}
              className="btn-primary w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Finish Ride
            </button>
          )}
          
          {ride.status === 'COMPLETED' && (
            <div className="flex gap-3 mt-2">
              <p className="flex-1 text-sm text-center text-green-600 font-medium bg-green-50 p-2 rounded-lg">
                Ride finished successfully
              </p>
              <button onClick={() => setShowPaymentModal(true)} className="btn-secondary whitespace-nowrap">
                View Earnings
              </button>
            </div>
          )}
        </div>
      )}

      {/* Payment / Post-Ride Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-up">
            {paymentSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Transaction Successful!</h2>
                <p className="text-neutral-500 mb-6">Your ride has been fully completed.</p>
                <button onClick={() => navigate('/trips')} className="btn-primary w-full">
                  Back to My Trips
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">Ride Completed</h2>
                <p className="text-sm text-neutral-500 mb-6">
                  {isDriver ? 'Summary of your earnings' : 'Please complete your payment'}
                </p>

                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-600">{isDriver ? 'Total Collected' : 'Fare Amount'}</span>
                    <span className="text-2xl font-bold text-neutral-900">₹{amountDue}</span>
                  </div>
                  {!isDriver && myBooking && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500">Seats Booked</span>
                      <span className="font-medium">{myBooking.seats}</span>
                    </div>
                  )}
                </div>

                {!isDriver ? (
                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-semibold text-neutral-900">Select Payment Method</label>
                    {['WALLET', 'UPI', 'CARD'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          paymentMethod === method 
                            ? 'border-primary bg-primary-50/50 shadow-sm' 
                            : 'border-neutral-200 hover:border-primary-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-neutral-900">{method === 'WALLET' ? 'Commuto Wallet' : method}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === method ? 'border-primary' : 'border-neutral-300'
                        }`}>
                          {paymentMethod === method && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-semibold text-neutral-900">Receive Earnings to</label>
                    {['WALLET', 'BANK_ACCOUNT'].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          paymentMethod === method 
                            ? 'border-primary bg-primary-50/50 shadow-sm' 
                            : 'border-neutral-200 hover:border-primary-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-neutral-900">{method === 'WALLET' ? 'Commuto Wallet' : 'Linked Bank Account'}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === method ? 'border-primary' : 'border-neutral-300'
                        }`}>
                          {paymentMethod === method && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  disabled={paying}
                  onClick={async () => {
                    setPaying(true);
                    try {
                      if (!isDriver) {
                        if (!myBooking?.id) throw new Error("Booking not found");
                        await initiatePayment(myBooking.id, paymentMethod);
                      } else {
                        // Mock receiving for driver
                        await new Promise(resolve => setTimeout(resolve, 1000));
                      }
                      setPaymentSuccess(true);
                    } catch (err) {
                      toast.error(err.response?.data?.error || err.message || 'Payment failed');
                    } finally {
                      setPaying(false);
                    }
                  }}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  {paying ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : isDriver ? (
                    `Confirm & Receive ₹${amountDue}`
                  ) : (
                    `Pay ₹${amountDue} Now`
                  )}
                </button>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="btn-ghost w-full mt-3 text-neutral-500"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
