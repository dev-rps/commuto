import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation, Clock, MapPin, ArrowLeft, Share2, CheckCircle, ShieldAlert, Star, PhoneCall } from 'lucide-react';
import { RouteMap, Spinner, StatusBadge, SosModal, ReviewModal } from '../../components';
import { getRide, updateRideStatus, startRide, initiatePayment, postLocation } from '../../lib/api';
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

  // Safety & Review Modal States
  const [showSosModal, setShowSosModal]       = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess]     = useState(false);
  const [paymentMethod, setPaymentMethod]       = useState('WALLET');
  const [paying, setPaying]                     = useState(false);

  const animatedPos = useSmoothPosition(currentPos);
  const isDriver = !!(user?.id && ride?.driverId && user.id === ride.driverId);


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

  // Real GPS Location tracking for Driver
  useEffect(() => {
    if (!ride || ride.status !== 'IN_PROGRESS' || !isDriver) return;
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    let watchId;
    // Set up real GPS tracking for the driver
    watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentPos({ lat, lng });
        
        const remaining = haversineKm(lat, lng, ride.destLat, ride.destLng);
        setEta(Math.round((remaining / 30) * 60));
        
        // Push to server
        try {
          await postLocation(ride.id, lat, lng);
        } catch (e) {
          console.error("Failed to post location update", e);
        }
      },
      (error) => {
        console.error("GPS Error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [ride, isDriver, toast]);

  // ETA calculation for Passenger
  useEffect(() => {
    if (!isDriver && currentPos && ride) {
      const remaining = haversineKm(currentPos.lat, currentPos.lng, ride.destLat, ride.destLng);
      setEta(Math.round((remaining / 30) * 60));
    }
  }, [currentPos, ride, isDriver]);

  if (loading) return <Spinner label="Loading trip..." />;
  if (!ride) return <div className="text-center py-8 text-neutral-500">Ride not found</div>;

  const distanceLeft = animatedPos ? haversineKm(animatedPos.lat, animatedPos.lng, ride.destLat, ride.destLng).toFixed(1) : '—';
  const myBooking = ride.bookings?.find(b => b.passengerId === user?.id);
  const activeBookingsCount = ride.bookings?.filter(b => b.status !== 'CANCELLED').length || 0;
  const amountDue = isDriver 
    ? (ride.farePerSeat * (ride.bookings?.filter(b => b.status === 'BOOKED' || b.status === 'PAYMENT_COMPLETED').reduce((acc, curr) => acc + curr.seatsBooked, 0) || 0)) 
    : (myBooking?.totalFare || ride.farePerSeat);

  return (
    <div className="max-w-4xl mx-auto space-y-4 relative">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-2">
          {!isDriver && ride.driver?.phone && (
            <a href={`tel:${ride.driver.phone}`} className="btn-secondary text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
              <PhoneCall className="w-3.5 h-3.5" /> Call Driver
            </a>
          )}
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
            className="btn-secondary text-xs"
            aria-label="Share tracking link"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
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
              {ride.status === 'IN_PROGRESS' 
                ? 'Trip in progress' 
                : ride.status === 'COMPLETED' 
                  ? 'Trip completed' 
                  : ride.status === 'CANCELLED' 
                    ? 'Trip cancelled' 
                    : 'Trip scheduled'}
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

          {ride.status === 'AT_PICKUP' && activeBookingsCount > 0 && (
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

          {ride.status === 'AT_PICKUP' && activeBookingsCount === 0 && (
            <p className="text-sm text-neutral-500 text-center py-2 bg-neutral-100/60 rounded-xl mb-3 border border-neutral-200/40">
              No active bookings yet. Waiting for passengers...
            </p>
          )}

          {activeBookingsCount === 0 && (ride.status === 'PUBLISHED' || ride.status === 'AT_PICKUP') && (
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to cancel this ride?')) {
                  try {
                    const updated = await updateRideStatus(ride.id, 'CANCELLED');
                    setRide({ ...ride, status: updated.status });
                    toast.success('Ride cancelled successfully');
                  } catch (e) {
                    toast.error(e.response?.data?.error || e.message || 'Failed to cancel ride');
                  }
                }
              }}
              className="btn-secondary text-error border-error/30 hover:bg-error/5 w-full mt-3 font-semibold"
            >
              Cancel Ride
            </button>
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
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                  {isDriver ? 'Earnings Confirmed!' : 'Payment Successful!'}
                </h2>
                <p className="text-neutral-500 mb-6">
                  {isDriver
                    ? 'Your ride is complete. Non-wallet earnings will be settled separately.'
                    : 'Your ride payment has been completed successfully.'}
                </p>
                <button onClick={() => navigate('/trips')} className="btn-primary w-full">
                  Back to My Trips
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-1">Ride Completed</h2>
                <p className="text-sm text-neutral-500 mb-6">
                  {isDriver ? 'How would you like to receive your earnings?' : 'Please complete your payment'}
                </p>

                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-600">{isDriver ? 'Total Earned' : 'Fare Amount'}</span>
                    <span className="text-2xl font-bold text-neutral-900">₹{amountDue}</span>
                  </div>
                  {!isDriver && myBooking && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-500">Seats Booked</span>
                      <span className="font-medium">{myBooking.seatsBooked}</span>
                    </div>
                  )}
                </div>

                {!isDriver ? (
                  <div className="space-y-3 mb-6">
                    <label className="text-sm font-semibold text-neutral-900">Select Payment Method</label>
                    {['WALLET', 'UPI', 'CARD', 'CASH'].map((method) => (
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
                          {method === 'WALLET' && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              Pending rider payment
                            </span>
                          )}
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          paymentMethod === method ? 'border-primary' : 'border-neutral-300'
                        }`}>
                          {paymentMethod === method && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                      </button>
                    ))}
                    {paymentMethod === 'WALLET' && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 flex items-start gap-2">
                        <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Your wallet will be credited once the rider completes payment. The booking status will show as <strong>Payment Pending</strong> until then.</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  disabled={paying}
                  onClick={async () => {
                    setPaying(true);
                    try {
                      if (!isDriver) {
                        if (!myBooking?.id) throw new Error('Booking not found');
                        await initiatePayment(myBooking.id, paymentMethod);
                        setPaymentSuccess(true);
                      } else {
                        // Driver confirming how to receive
                        await new Promise(resolve => setTimeout(resolve, 800));
                        if (paymentMethod === 'WALLET') {
                          // Earnings are pending — rider must pay first
                          toast.success('Preference saved! Earnings will be credited once riders pay.');
                          setShowPaymentModal(false);
                          navigate('/trips');
                        } else {
                          setPaymentSuccess(true);
                        }
                      }
                    } catch (err) {
                      toast.error(err.response?.data?.error || err.message || 'Action failed');
                    } finally {
                      setPaying(false);
                    }
                  }}
                  className="btn-primary w-full py-3.5 text-base"
                >
                  {paying ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : isDriver ? (
                    paymentMethod === 'WALLET'
                      ? `Confirm — Awaiting Rider Payment`
                      : `Confirm & Receive ₹${amountDue}`
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

      {/* Floating Emergency SOS Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40">
        <button
          onClick={() => setShowSosModal(true)}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3 rounded-full shadow-lg shadow-red-600/40 border-2 border-white transition-all transform hover:scale-105"
        >
          <ShieldAlert className="w-5 h-5 text-white" />
          <span>SOS SAFETY</span>
        </button>
      </div>

      {/* Modals */}
      {showSosModal && (
        <SosModal
          rideId={rideId}
          currentLat={currentPos?.lat}
          currentLng={currentPos?.lng}
          onClose={() => setShowSosModal(false)}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          rideId={rideId}
          revieweeName={ride?.driver?.name || 'Driver'}
          revieweeId={ride?.driverId}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => toast.success('Thank you for rating your trip!')}
        />
      )}
    </div>
  );
}

