import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const LocationCapture = ({ location, onLocationChange }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [manualAddress, setManualAddress] = useState(location?.address || '');
  const [useManualAddress, setUseManualAddress] = useState(false);

  useEffect(() => {
    if (location?.address) {
      setManualAddress(location?.address);
    }
  }, [location]);

  const detectLocation = async () => {
    setIsDetecting(true);
    
    try {
      // Simulate GPS detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockLocation = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.01,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.01,
        address: '123 Environmental Way, Downtown District, NY 10001',
        accuracy: 15
      };
      
      onLocationChange(mockLocation);
      setManualAddress(mockLocation?.address);
      setUseManualAddress(false);
    } catch (error) {
      console.error('Failed to detect location:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleManualAddressChange = (e) => {
    const address = e?.target?.value;
    setManualAddress(address);
    
    if (address?.trim()) {
      // Simulate geocoding
      const mockCoords = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.02,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.02,
        address: address,
        accuracy: null
      };
      onLocationChange(mockCoords);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Location</h3>
        <p className="text-sm text-muted-foreground">Specify where the environmental issue is located</p>
      </div>
      {/* GPS Detection */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon name="Navigation" size={18} className="text-primary" />
            <span className="font-medium text-sm">GPS Location</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={detectLocation}
            disabled={isDetecting}
            loading={isDetecting}
            iconName={isDetecting ? "Loader2" : "MapPin"}
            iconPosition="left"
          >
            {isDetecting ? 'Detecting...' : 'Use Current Location'}
          </Button>
        </div>

        {location && !useManualAddress && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Icon name="MapPin" size={14} className="text-success" />
              <span className="text-foreground">Location detected</span>
              {location?.accuracy && (
                <span className="text-muted-foreground">
                  (±{location?.accuracy}m accuracy)
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground pl-6">{location?.address}</p>
            <div className="text-xs text-muted-foreground pl-6">
              Coordinates: {location?.latitude?.toFixed(6)}, {location?.longitude?.toFixed(6)}
            </div>
          </div>
        )}
      </div>
      {/* Manual Address Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Manual Address Entry</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUseManualAddress(!useManualAddress)}
            iconName={useManualAddress ? "Navigation" : "Edit3"}
            iconPosition="left"
          >
            {useManualAddress ? 'Use GPS' : 'Edit Address'}
          </Button>
        </div>

        <Input
          type="text"
          placeholder="Enter street address, landmark, or description"
          value={manualAddress}
          onChange={handleManualAddressChange}
          disabled={!useManualAddress && location?.address}
          description={useManualAddress ? "Type the exact location or nearest landmark" : "GPS location will be used unless manually overridden"}
        />
      </div>
      {/* Map Preview */}
      {location && (
        <div className="bg-muted rounded-lg overflow-hidden">
          <div className="h-48 relative">
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              title="Report Location"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${location?.latitude},${location?.longitude}&z=16&output=embed`}
              className="border-0"
            />
            <div className="absolute top-2 left-2 bg-card/90 backdrop-blur-sm rounded-md px-2 py-1">
              <div className="flex items-center space-x-1 text-xs">
                <Icon name="MapPin" size={12} className="text-primary" />
                <span className="font-medium">Report Location</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationCapture;