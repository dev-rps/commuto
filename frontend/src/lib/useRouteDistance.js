import { useState, useEffect, useRef } from 'react';

/**
 * Fetches real road-based route from OSRM (free, no API key).
 * Returns road geometry for drawing, road distance in km, and duration in minutes.
 *
 * @param {number|null} pickupLat
 * @param {number|null} pickupLng
 * @param {number|null} destLat
 * @param {number|null} destLng
 * @returns {{ distanceKm: number|null, durationMin: number|null, routeCoords: [lat,lng][], loading: boolean, error: string|null }}
 */

// Module-level cache: key = "lat1,lng1,lat2,lng2" → { distanceKm, durationMin, routeCoords }
const routeCache = new Map();

function buildCacheKey(pLat, pLng, dLat, dLng) {
  return `${pLat?.toFixed(5)},${pLng?.toFixed(5)},${dLat?.toFixed(5)},${dLng?.toFixed(5)}`;
}

/**
 * Standalone async function to fetch OSRM route — usable outside of React hooks.
 * Returns { distanceKm, durationMin, routeCoords } or throws.
 */
export async function fetchOsrmRoute(pickupLat, pickupLng, destLat, destLng, signal) {
  const key = buildCacheKey(pickupLat, pickupLng, destLat, destLng);
  if (routeCache.has(key)) return routeCache.get(key);

  const url = `https://router.project-osrm.org/route/v1/driving/${pickupLng},${pickupLat};${destLng},${destLat}?overview=full&geometries=geojson`;

  const res = await fetch(url, { signal, headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`OSRM error: ${res.status}`);

  const data = await res.json();
  if (!data.routes || data.routes.length === 0) throw new Error('No route found');

  const route = data.routes[0];
  const distanceKm = Math.round((route.distance / 1000) * 10) / 10; // metres → km, 1dp
  const durationMin = Math.round(route.duration / 60);             // seconds → minutes

  // GeoJSON coordinates are [lng, lat], Leaflet needs [lat, lng]
  const routeCoords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  const result = { distanceKm, durationMin, routeCoords };
  routeCache.set(key, result);
  return result;
}

/**
 * React hook wrapper around fetchOsrmRoute.
 * Auto-fetches whenever coordinates change (debounced 300ms).
 */
export function useRouteDistance(pickupLat, pickupLng, destLat, destLng) {
  const [state, setState] = useState({
    distanceKm: null,
    durationMin: null,
    routeCoords: null,
    loading: false,
    error: null,
  });

  const abortRef = useRef(null);

  useEffect(() => {
    const allValid = [pickupLat, pickupLng, destLat, destLng].every(
      (v) => v != null && !isNaN(v)
    );

    if (!allValid) {
      setState((s) => ({ ...s, routeCoords: null, distanceKm: null, durationMin: null }));
      return;
    }

    // Cancel previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = await fetchOsrmRoute(pickupLat, pickupLng, destLat, destLng, controller.signal);
        setState({ ...result, loading: false, error: null });
      } catch (err) {
        if (err.name === 'AbortError') return;
        setState((s) => ({ ...s, loading: false, error: err.message }));
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [pickupLat, pickupLng, destLat, destLng]);

  return state;
}
