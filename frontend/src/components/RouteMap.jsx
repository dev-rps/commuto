import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchOsrmRoute } from '../lib/useRouteDistance';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export function createPulseIcon(color = '#10B981') {
  return L.divIcon({
    className: '',
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 0 8px ${color}80;animation:marker-pulse 2s ease-in-out infinite;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function RouteMap({ pickupLat, pickupLng, destLat, destLng, movingLat, movingLng, height = '280px', zoom = 12 }) {
  const centerLat = (pickupLat + destLat) / 2;
  const centerLng = (pickupLng + destLng) / 2;

  // Fallback straight-line positions
  const fallbackPositions = [[pickupLat, pickupLng], [destLat, destLng]];

  const [roadPositions, setRoadPositions] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null); // { distanceKm, durationMin }

  useEffect(() => {
    const allValid = [pickupLat, pickupLng, destLat, destLng].every(
      (v) => v != null && !isNaN(Number(v))
    );
    if (!allValid) return;

    let cancelled = false;
    const controller = new AbortController();

    fetchOsrmRoute(pickupLat, pickupLng, destLat, destLng, controller.signal)
      .then((result) => {
        if (cancelled) return;
        setRoadPositions(result.routeCoords);
        setRouteInfo({ distanceKm: result.distanceKm, durationMin: result.durationMin });
      })
      .catch(() => {
        // Silently fall back to straight line on OSRM failure
        if (!cancelled) setRoadPositions(null);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [pickupLat, pickupLng, destLat, destLng]);

  const positions = roadPositions || fallbackPositions;
  const isRoadRoute = roadPositions != null;

  return (
    <MapContainer center={[centerLat, centerLng]} zoom={zoom} style={{ height, width: '100%' }} scrollWheelZoom={false}>
      {/* OpenStreetMap tiles — free, no API key */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Road route polyline — solid if OSRM road, dashed fallback if straight line */}
      <Polyline
        positions={positions}
        color="#2563EB"
        weight={isRoadRoute ? 5 : 4}
        opacity={isRoadRoute ? 0.85 : 0.6}
        dashArray={isRoadRoute ? null : '8 8'}
      />

      {/* Pickup marker */}
      <Marker position={[pickupLat, pickupLng]}>
        <Popup>
          <div style={{ fontFamily: 'sans-serif', fontSize: '12px' }}>
            <strong>📍 Pickup</strong>
            {routeInfo && (
              <div style={{ marginTop: 4, color: '#555' }}>
                🛣 {routeInfo.distanceKm} km road distance<br />
                ⏱ ~{routeInfo.durationMin} min drive
              </div>
            )}
          </div>
        </Popup>
      </Marker>

      {/* Destination marker */}
      <Marker position={[destLat, destLng]} icon={greenIcon}>
        <Popup>
          <div style={{ fontFamily: 'sans-serif', fontSize: '12px' }}>
            <strong>🏁 Destination</strong>
            {routeInfo && (
              <div style={{ marginTop: 4, color: '#555' }}>
                🛣 {routeInfo.distanceKm} km from pickup<br />
                ⏱ ~{routeInfo.durationMin} min drive
              </div>
            )}
          </div>
        </Popup>
      </Marker>

      {/* Live moving marker (driver's current location) */}
      {movingLat != null && movingLng != null && (
        <Marker position={[movingLat, movingLng]} icon={createPulseIcon('#10B981')}>
          <Popup>🚗 Current Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
