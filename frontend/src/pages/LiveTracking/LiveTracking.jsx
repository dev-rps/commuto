import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation, Clock, MapPin, ArrowLeft, Share2 } from 'lucide-react';
import { RouteMap, Spinner, StatusBadge } from '../../components';
import { getRide } from '../../lib/api';
import { useSocket } from '../../context/SocketContext';
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
  const { socket, events, joinRideRoom, leaveRideRoom } = useSocket();
  const [ride, setRide]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [currentPos, setCurrentPos] = useState(null);
  const [eta, setEta]           = useState(null);
  const intervalRef             = useRef(null);

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
    if (data?.status && ride) setRide({ ...ride, status: data.status });
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

  return (
    <div className="max-w-4xl mx-auto space-y-4">
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
    </div>
  );
}
