'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

export default function LocationAutocompleteAdmin({ value, onChange, placeholder, className }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const isSelectionRef = useRef(false);
    const hasTypedRef = useRef(false);

    useEffect(() => {
        if (value !== query) {
            hasTypedRef.current = false;
            setQuery(value || '');
        }
    }, [value]);

    useEffect(() => {
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

            if (isSelectionRef.current) {
                isSelectionRef.current = false;
                return;
            }

            if (!hasTypedRef.current) {
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
                if (data.length > 0) setIsOpen(true);
            } catch (error) {
                console.error('Error fetching locations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchLocations, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (place) => {
        isSelectionRef.current = true;
        hasTypedRef.current = false;
        const display_name = place.display_name;
        // Optionally format:
        // const city = place.address?.city || place.address?.town || place.address?.village;
        // const country = place.address?.country;
        setQuery(display_name);
        onChange({ target: { name: 'location', value: display_name } });
        setSuggestions([]);
        setIsOpen(false);
    };

    const handleInputChange = (e) => {
        hasTypedRef.current = true;
        setQuery(e.target.value);
        onChange({ target: { name: 'location', value: e.target.value } });
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder || "Search location..."}
                    className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2008b9] transition-colors ${className || ''}`}
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full z-50 mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((place) => (
                        <button
                            key={place.place_id}
                            type="button"
                            onClick={() => handleSelect(place)}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                            {place.display_name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
