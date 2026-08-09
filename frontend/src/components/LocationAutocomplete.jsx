import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, Clock, Star } from 'lucide-react';
import { getSavedPlaces } from '../lib/api';

// ── Recent Searches (localStorage) ────────────────────────────────
const RECENTS_KEY = 'commuto_recent_locations';
const MAX_RECENTS = 5;

function getRecentSearches() {
  try {
    const stored = localStorage.getItem(RECENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(item) {
  try {
    const existing = getRecentSearches();
    // Remove duplicate by address, prepend new
    const deduped = existing.filter((r) => r.address !== item.address);
    const updated = [item, ...deduped].slice(0, MAX_RECENTS);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors silently
  }
}

// ── Component ──────────────────────────────────────────────────────
export function LocationAutocomplete({
  name,
  value = '',
  onChange,
  onSelectLocation,
  placeholder = 'Enter location...',
  error,
  className = '',
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [recents, setRecents] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);
  const abortControllerRef = useRef(null);

  // This flag is set to true right after the user picks a suggestion.
  // It prevents the subsequent value-change (from parent updating the input)
  // from firing a new Nominatim search — which caused the duplicate dropdown.
  const justSelectedRef = useRef(false);

  // ── Load saved places once on mount ───────────────────────────────
  useEffect(() => {
    getSavedPlaces()
      .then((places) => {
        if (Array.isArray(places)) setSavedPlaces(places);
      })
      .catch(() => {}); // Silently ignore — not critical
  }, []);

  // ── Load recents on mount ──────────────────────────────────────────
  useEffect(() => {
    setRecents(getRecentSearches());
  }, []);

  // ── Close dropdown on outside click ───────────────────────────────
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Show recents + saved places when field is focused and empty ────
  const handleFocus = useCallback(() => {
    const query = (value || '').trim();
    if (query.length < 3) {
      const freshRecents = getRecentSearches();
      setRecents(freshRecents);
      // Only open dropdown if we have something to show
      if (freshRecents.length > 0 || savedPlaces.length > 0) {
        setSuggestions([]);
        setIsOpen(true);
      }
    }
  }, [value, savedPlaces]);

  // ── Debounced Nominatim search ─────────────────────────────────────
  useEffect(() => {
    const query = (value || '').trim();

    // ⚡ KEY FIX: If the user just selected an item, the parent updates `value`
    // to the full address string. Skip the search triggered by that update.
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (query.length < 3) {
      setSuggestions([]);
      // Don't close if we're showing recents/saved places
      if (query.length === 0) {
        const freshRecents = getRecentSearches();
        setRecents(freshRecents);
        const isInputFocused = document.activeElement === dropdownRef.current?.querySelector('input');
        if (isInputFocused && (freshRecents.length > 0 || savedPlaces.length > 0)) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } else {
        setIsOpen(false);
      }
      return;
    }

    const timer = setTimeout(async () => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 3-second timeout for flaky connections
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      setLoading(true);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          {
            signal: controller.signal,
            headers: { 'Accept-Language': 'en' },
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Geocoding response error');
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data);
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ── Handle selection from any source (Nominatim / recent / saved) ─
  const handleSelect = useCallback((item) => {
    const lat = parseFloat(item.lat ?? item.latitude);
    const lng = parseFloat(item.lon ?? item.longitude ?? item.lng);
    const address = item.display_name ?? item.address ?? item.name;

    // Mark that a selection just happened so the next value-change is ignored
    justSelectedRef.current = true;

    setIsOpen(false);
    setSuggestions([]);

    // Persist to recents
    saveRecentSearch({ address, lat, lng });
    setRecents(getRecentSearches());

    if (onSelectLocation) {
      onSelectLocation({ name, address, lat, lng });
    }
  }, [name, onSelectLocation]);

  // Determine what to show in the dropdown
  const showRecentsSection = recents.length > 0 && suggestions.length === 0;
  const showSavedSection = savedPlaces.length > 0 && suggestions.length === 0;
  const showNominatim = suggestions.length > 0;

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <input
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`input pr-8 ${error ? 'input-error' : ''} ${className}`}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* ── Suggestions Dropdown ── */}
      {isOpen && (showRecentsSection || showSavedSection || showNominatim) && (
        <ul className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-xl border border-neutral-200 shadow-xl overflow-hidden divide-y divide-neutral-100 max-h-64 overflow-y-auto animate-scale-in">

          {/* Saved Places section */}
          {showSavedSection && (
            <>
              <li className="px-3 pt-2 pb-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Saved Places</span>
              </li>
              {savedPlaces.map((place) => (
                <li
                  key={place.id}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect({
                    address: place.name,
                    lat: place.latitude,
                    lng: place.longitude,
                    display_name: place.name,
                  }); }}
                  className="p-3 hover:bg-neutral-50 cursor-pointer flex items-center gap-2.5 transition-colors"
                >
                  <Star className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-xs font-semibold text-neutral-900 truncate">{place.name}</p>
                </li>
              ))}
            </>
          )}

          {/* Recent Searches section */}
          {showRecentsSection && (
            <>
              <li className="px-3 pt-2 pb-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Recent</span>
              </li>
              {recents.map((recent, idx) => (
                <li
                  key={idx}
                  onMouseDown={(e) => { e.preventDefault(); handleSelect({ ...recent, display_name: recent.address }); }}
                  className="p-3 hover:bg-neutral-50 cursor-pointer flex items-start gap-2.5 transition-colors"
                >
                  <Clock className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-neutral-900 truncate">
                      {recent.address.split(',')[0]}
                    </p>
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">{recent.address}</p>
                  </div>
                </li>
              ))}
            </>
          )}

          {/* Nominatim results */}
          {showNominatim && suggestions.map((item) => (
            <li
              key={item.place_id ?? item.osm_id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(item); }}
              className="p-3 hover:bg-neutral-50 cursor-pointer flex items-start gap-2.5 transition-colors"
            >
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-900 truncate">
                  {item.display_name.split(',')[0]}
                </p>
                <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                  {item.display_name}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
