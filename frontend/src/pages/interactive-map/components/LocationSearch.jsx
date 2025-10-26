import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LocationSearch = ({ onLocationSelect, onCurrentLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Mock location suggestions
  const mockSuggestions = [
    {
      id: 1,
      name: 'Central Park',
      address: 'New York, NY 10024, USA',
      type: 'park',
      lat: 40.7829,
      lng: -73.9654,
      category: 'Recreation'
    },
    {
      id: 2,
      name: 'Times Square',
      address: 'Manhattan, NY 10036, USA',
      type: 'landmark',
      lat: 40.7580,
      lng: -73.9855,
      category: 'Tourist Attraction'
    },
    {
      id: 3,
      name: 'Brooklyn Bridge',
      address: 'New York, NY, USA',
      type: 'bridge',
      lat: 40.7061,
      lng: -73.9969,
      category: 'Infrastructure'
    },
    {
      id: 4,
      name: 'Hudson River Park',
      address: 'New York, NY, USA',
      type: 'park',
      lat: 40.7359,
      lng: -74.0087,
      category: 'Recreation'
    },
    {
      id: 5,
      name: 'Wall Street',
      address: 'Financial District, New York, NY, USA',
      type: 'street',
      lat: 40.7074,
      lng: -74.0113,
      category: 'Business District'
    }
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('ecowatch_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query) => {
    if (query?.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const filtered = mockSuggestions?.filter(location =>
      location?.name?.toLowerCase()?.includes(query?.toLowerCase()) ||
      location?.address?.toLowerCase()?.includes(query?.toLowerCase()) ||
      location?.category?.toLowerCase()?.includes(query?.toLowerCase())
    );
    
    setSuggestions(filtered);
    setIsSearching(false);
  };

  const handleInputChange = (e) => {
    const value = e?.target?.value;
    setSearchQuery(value);
    setIsDropdownOpen(true);
    handleSearch(value);
  };

  const handleLocationSelect = (location) => {
    setSearchQuery(location?.name);
    setIsDropdownOpen(false);
    
    // Add to recent searches
    const newRecent = [location, ...recentSearches?.filter(r => r?.id !== location?.id)]?.slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('ecowatch_recent_searches', JSON.stringify(newRecent));
    
    onLocationSelect(location);
  };

  const handleCurrentLocation = async () => {
    setIsSearching(true);
    try {
      await onCurrentLocation();
      setSearchQuery('Current Location');
    } catch (error) {
      console.error('Failed to get current location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setIsDropdownOpen(false);
  };

  const getLocationIcon = (type) => {
    const icons = {
      park: 'Trees',
      landmark: 'MapPin',
      bridge: 'Bridge',
      street: 'Road',
      building: 'Building'
    };
    return icons?.[type] || 'MapPin';
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <Icon name="Loader2" size={16} className="text-muted-foreground animate-spin" />
          ) : (
            <Icon name="Search" size={16} className="text-muted-foreground" />
          )}
        </div>
        
        <input
          ref={searchRef}
          type="text"
          placeholder="Search locations, landmarks, addresses..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownOpen(true)}
          className="w-full pl-10 pr-20 py-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSearch}
              className="h-6 w-6"
            >
              <Icon name="X" size={14} />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCurrentLocation}
            disabled={isSearching}
            className="h-6 w-6"
            title="Use current location"
          >
            <Icon name="Navigation" size={14} />
          </Button>
        </div>
      </div>
      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-elevated z-50 max-h-80 overflow-y-auto">
          {/* Recent Searches */}
          {searchQuery?.length === 0 && recentSearches?.length > 0 && (
            <div className="p-3 border-b border-border">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Recent Searches
              </div>
              {recentSearches?.map(location => (
                <button
                  key={`recent-${location?.id}`}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full flex items-center space-x-3 p-2 text-left hover:bg-muted rounded-md transition-colors duration-200"
                >
                  <Icon name="Clock" size={14} className="text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{location?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{location?.address}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {searchQuery?.length > 0 && (
            <div className="p-2">
              {isSearching ? (
                <div className="flex items-center justify-center p-4">
                  <Icon name="Loader2" size={20} className="animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                </div>
              ) : suggestions?.length > 0 ? (
                suggestions?.map(location => (
                  <button
                    key={location?.id}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-muted rounded-md transition-colors duration-200"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                      <Icon name={getLocationIcon(location?.type)} size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{location?.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{location?.address}</div>
                      <div className="text-xs text-primary">{location?.category}</div>
                    </div>
                    <Icon name="ArrowUpRight" size={14} className="text-muted-foreground" />
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No locations found for "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          {searchQuery?.length === 0 && (
            <div className="p-3 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Quick Actions
              </div>
              <div className="space-y-1">
                <button
                  onClick={handleCurrentLocation}
                  className="w-full flex items-center space-x-3 p-2 text-left hover:bg-muted rounded-md transition-colors duration-200"
                >
                  <Icon name="Navigation" size={16} className="text-primary" />
                  <span className="text-sm">Use Current Location</span>
                </button>
                <button
                  onClick={() => handleLocationSelect({ 
                    id: 'downtown', 
                    name: 'Downtown District', 
                    lat: 40.7128, 
                    lng: -74.0060,
                    address: 'Downtown Manhattan, NY, USA'
                  })}
                  className="w-full flex items-center space-x-3 p-2 text-left hover:bg-muted rounded-md transition-colors duration-200"
                >
                  <Icon name="Building" size={16} className="text-muted-foreground" />
                  <span className="text-sm">Downtown District</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;