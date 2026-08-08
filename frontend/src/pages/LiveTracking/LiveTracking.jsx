import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { RouteMap, Spinner, StatusBadge } from '../../components';
import { getRide } from '../../lib/api';
import { useSocket } from '../../context/SocketContext';
import { haversineKm } from '../../lib/utils';

export default function LiveTracking() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const { socket, events, joinRideRoom, leaveRideRoom } = useSocket();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPos, setCurrentPos] = useState(null);
  const [eta, setEta] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    getRide(rideId).then((r) => {
      setRide(r);
      // Start marker at pickup point
      setCurrentPos({ lat: r.pickupLat, lng: r.pickupLng });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [rideId]);

  // Socket listener — structured so wiring the real backend later is
  // just filling in this callback body. The mock simulates movement locally.
  const handleLocationUpdate = useCallback((data) => {
    // Real backend: data = { lat, lng, timestamp }
    if (data?.lat != null && data?.lng != null) {
      setCurrentPos({ lat: data.lat, lng: data.lng });
    }
  }, []);

  const handleStatusUpdate = useCallback((data) => {
    // Real backend: data = { status }
    if (data?.status && ride) {
      setRide({ ...ride, status: data.status });
    }
  }, [ride]);

  useEffect(() => {
    if (!rideId) return;
    joinRideRoom?.(rideId);

    // Socket event listeners — these will fire when the real backend emits.
    // Currently no-ops in mock mode, but the structure is ready.
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

  // Mock movement simulation — interpolates marker from pickup to destination.
  // Remove this block when the real socket backend is live.
  useEffect(() => {
    if (!ride || ride.status !== 'IN_PROGRESS') return;
    let progress = 0;
    const steps = 100;
    const totalMs = 30000; // 30s to traverse the route

    intervalRef.current = setInterval(() => {
      progress += 1;
      if (progress >= steps) {
        clearInterval(intervalRef.current);
        return;
      }
      const t = progress / steps;
      const lat = ride.pickupLat + (ride.destLat - ride.pickupLat) * t;
      const lng = ride.pickupLng + (ride.destLng - ride.pickupLng) * t;
      setCurrentPos({ lat, lng });

      const remaining = haversineKm(lat, lng, ride.destLat, ride.destLng);
      const speedKmph = 30; // assumed avg speed
      setEta(Math.round((remaining / speedKmph) * 60)); // minutes
    }, totalMs / steps);

    return () => clearInterval(intervalRef.current);
  }, [ride]);

  if (loading) return <Spinner label="Loading trip..." />;
  if (!ride) return <div className="text-center py-8 text-neutral-500">Ride not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Status banner */}
      <div className={`rounded-lg p-4 mb-4 flex items-center justify-between ${ride.status === 'IN_PROGRESS' ? 'bg-accent-50 border border-accent-200' : 'bg-neutral-100 border border-neutral-200'}`}>
        <div className="flex items-center gap-3">
          {ride.status === 'IN_PROGRESS' && <span className="w-3 h-3 rounded-full bg-accent animate-pulse" />}
          <div>
            <p className="font-semibold text-neutral-900">{ride.status === 'IN_PROGRESS' ? 'Trip in progress' : ride.status === 'COMPLETED' ? 'Trip completed' : 'Trip scheduled'}</p>
            <p className="text-sm text-neutral-500">{ride.pickupLoc} → {ride.destination}</p>
          </div>
        </div>
        <StatusBadge status={ride.status} />
      </div>

      <div className="card overflow-hidden mb-4">
        <RouteMap
          pickupLat={ride.pickupLat} pickupLng={ride.pickupLng}
          destLat={ride.destLat} destLng={ride.destLng}
          movingLat={currentPos?.lat} movingLng={currentPos?.lng}
          height="400px" zoom={12}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-neutral-500 mb-1"><MapPin className="w-4 h-4" /><span className="text-xs">Distance Left</span></div>
          <p className="text-lg font-bold text-neutral-900">
            {currentPos ? haversineKm(currentPos.lat, currentPos.lng, ride.destLat, ride.destLng).toFixed(1) : ride.distanceKm?.toFixed(1) || '—'} km
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-neutral-500 mb-1"><Clock className="w-4 h-4" /><span className="text-xs">ETA</span></div>
          <p className="text-lg font-bold text-neutral-900">{eta != null ? `${eta} min` : '—'}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-neutral-500 mb-1"><Navigation className="w-4 h-4" /><span className="text-xs">Total Distance</span></div>
          <p className="text-lg font-bold text-neutral-900">{ride.distanceKm?.toFixed(1) || '—'} km</p>
        </div>
      </div>
    </div>
  );
}
