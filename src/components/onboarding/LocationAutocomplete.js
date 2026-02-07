'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import InfoTooltip from '../ui/InfoTooltip';

export default function LocationAutocomplete({ label, value, onChange, placeholder, tooltip }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const isSelectionRef = useRef(false);

    // Sync local query state if parent value changes externally
    useEffect(() => {
        if (value !== query) {
            setQuery(value || '');
        }
    }, [value]);

    useEffect(() => {
        // Click outside to close
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        const fetchLocations = async () => {
            if (!query || query.length < 3) {
                setSuggestions([]);
                return;
            }

            // If this update was triggered by a selection, don't search
            if (isSelectionRef.current) {
                isSelectionRef.current = false;
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
                    {
                        headers: {
                            'User-Agent': 'Jetfluenz/1.0',
                            'Accept-Language': 'en-US,en;q=0.9'
                        }
                    }
                );
                const data = await response.json();
                setSuggestions(data);
                setIsOpen(true);
            } catch (error) {
                console.error('Error fetching locations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchLocations, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [query, value]); // Added value to deps to help check for exact match

    const handleSelect = (place) => {
        isSelectionRef.current = true; // Mark as selection to prevent re-fetch
        // Prefer a shorter display name if available, otherwise fallback
        const city = place.address?.city || place.address?.town || place.address?.village || place.address?.hamlet;
        const state = place.address?.state;
        const country = place.address?.country;

        let formattedLocation = place.display_name; // Default to full

        if (city && country) {
            formattedLocation = `${city}${state ? `, ${state}` : ''}, ${country}`;
        }

        setQuery(formattedLocation);
        // Or construct something simpler like:
        // const city = place.address.city || place.address.town || place.address.village;
        // const country = place.address.country;
        // const formattedLocation = `${city}, ${country}`;

        setQuery(formattedLocation);
        onChange({ target: { name: 'location', value: formattedLocation } });
        setSuggestions([]);
        setIsOpen(false);
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        // Also update parent immediately so validaiton works even if they don't select from dropdown
        onChange({ target: { name: 'location', value: e.target.value } });
    };

    return (
        <div className="flex flex-col space-y-2 relative" ref={wrapperRef}>
            <div className="flex items-center">
                <label className="text-sm font-medium text-white/80">{label}</label>
                {tooltip && <InfoTooltip text={tooltip} />}
            </div>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-colors"
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />

                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full z-50 mt-1 bg-[#1a1060] border border-white/10 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                    {suggestions.map((place) => (
                        <button
                            key={place.place_id}
                            onClick={() => handleSelect(place)}
                            className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5 last:border-0"
                        >
                            {place.display_name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
