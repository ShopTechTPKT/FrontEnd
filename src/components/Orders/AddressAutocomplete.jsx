import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';

/**
 * AddressAutocomplete provides open-source address suggestions using Nominatim.
 */
const AddressAutocomplete = ({ value, onChange, placeholder, error, className }) => {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 4) {
      setSuggestions([]);
      return;
    }
    
    setIsLoading(true);
    try {
      // Limit search to Vietnam for better accuracy in this localized app
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=vn&addressdetails=1&limit=5`
      );
      const data = await response.json();
      setSuggestions(data || []);
      setShowDropdown(true);
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newVal = e.target.value;
    setQuery(newVal);
    onChange(newVal); 
    
    // Debounce the API call to respect Nominatim usage policy (1 request/sec max)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(newVal);
    }, 1000);
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.display_name);
    onChange(suggestion.display_name);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        placeholder={placeholder || 'Nhập địa chỉ của bạn...'}
        className={className}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <FaSpinner className="animate-spin" />
        </div>
      )}

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-100">
          {suggestions.map((item, index) => (
            <li 
              key={item.place_id || index}
              onClick={() => handleSelectSuggestion(item)}
              className="px-4 py-3 hover:bg-violet-50 cursor-pointer flex gap-3 items-start transition-colors"
            >
              <FaMapMarkerAlt className="text-violet-500 mt-1 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                {item.display_name}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
