import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

export function RouteMap({ pickupLat, pickupLng, destLat, destLng, movingLat, movingLng, height = '400px', zoom = 12 }) {
  const centerLat = (pickupLat + destLat) / 2;
  const centerLng = (pickupLng + destLng) / 2;
  const positions = [[pickupLat, pickupLng], [destLat, destLng]];

  return (
    <MapContainer center={[centerLat, centerLng]} zoom={zoom} style={{ height, width: '100%' }} scrollWheelZoom>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={positions} color="#2563EB" weight={4} opacity={0.7} dashArray="8 8" />
      <Marker position={[pickupLat, pickupLng]}><Popup>Pickup</Popup></Marker>
      <Marker position={[destLat, destLng]} icon={greenIcon}><Popup>Destination</Popup></Marker>
      {movingLat != null && movingLng != null && (
        <Marker position={[movingLat, movingLng]} icon={createPulseIcon('#10B981')}><Popup>Current Location</Popup></Marker>
      )}
    </MapContainer>
  );
}
