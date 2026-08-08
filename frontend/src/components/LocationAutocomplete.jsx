import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search against Nominatim with 3s timeout and rate-limit guard
  useEffect(() => {
    const query = (value || '').trim();

    // Rate-limit awareness: minimum 3 characters required
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 3-second timeout signal for flaky / venue wifi
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      setLoading(true);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          {
            signal: controller.signal,
            headers: {
              'Accept-Language': 'en',
            },
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
        // Fallback: If network fails, times out, or errors, catch silently without blocking
        // User retains full control to type plain text address & drag route map pin
        setSuggestions([]);
        setIsOpen(false);
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
  }, [value]);

  const handleSelect = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const address = item.display_name;

    setIsOpen(false);
    setSuggestions([]);

    if (onSelectLocation) {
      onSelectLocation({ name, address, lat, lng });
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <input
          name={name}
          type="text"
          value={value}
          onChange={onChange}
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

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-xl border border-neutral-200 shadow-xl overflow-hidden divide-y divide-neutral-100 max-h-56 overflow-y-auto animate-scale-in">
          {suggestions.map((item) => (
            <li
              key={item.place_id || item.osm_id}
              onClick={() => handleSelect(item)}
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
