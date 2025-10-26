import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AdditionalData = ({ additionalData, onAdditionalDataChange }) => {
  const weatherOptions = [
    { value: 'sunny', label: 'Sunny' },
    { value: 'cloudy', label: 'Cloudy' },
    { value: 'overcast', label: 'Overcast' },
    { value: 'rainy', label: 'Rainy' },
    { value: 'stormy', label: 'Stormy' },
    { value: 'foggy', label: 'Foggy' },
    { value: 'windy', label: 'Windy' }
  ];

  const windDirectionOptions = [
    { value: 'north', label: 'North' },
    { value: 'northeast', label: 'Northeast' },
    { value: 'east', label: 'East' },
    { value: 'southeast', label: 'Southeast' },
    { value: 'south', label: 'South' },
    { value: 'southwest', label: 'Southwest' },
    { value: 'west', label: 'West' },
    { value: 'northwest', label: 'Northwest' }
  ];

  const updateField = (field, value) => {
    onAdditionalDataChange({
      ...additionalData,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Additional Information</h3>
        <p className="text-sm text-muted-foreground">Optional details that can help with assessment and response</p>
      </div>
      {/* Weather Conditions */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Cloud" size={18} className="text-primary" />
          <h4 className="font-medium text-foreground">Weather Conditions</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Current Weather"
            options={weatherOptions}
            value={additionalData?.weather || ''}
            onChange={(value) => updateField('weather', value)}
            placeholder="Select weather condition"
          />

          <Input
            label="Temperature (°F)"
            type="number"
            placeholder="e.g., 72"
            value={additionalData?.temperature || ''}
            onChange={(e) => updateField('temperature', e?.target?.value)}
            min="-50"
            max="150"
          />

          <Select
            label="Wind Direction"
            options={windDirectionOptions}
            value={additionalData?.windDirection || ''}
            onChange={(value) => updateField('windDirection', value)}
            placeholder="Select wind direction"
          />

          <Input
            label="Wind Speed (mph)"
            type="number"
            placeholder="e.g., 5"
            value={additionalData?.windSpeed || ''}
            onChange={(e) => updateField('windSpeed', e?.target?.value)}
            min="0"
            max="200"
          />
        </div>
      </div>
      {/* Impact Assessment */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Target" size={18} className="text-primary" />
          <h4 className="font-medium text-foreground">Impact Assessment</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Affected Area Size"
            type="text"
            placeholder="e.g., 50 sq ft, 2 city blocks"
            value={additionalData?.affectedArea || ''}
            onChange={(e) => updateField('affectedArea', e?.target?.value)}
            description="Estimate the size of the affected area"
          />

          <Input
            label="Number of People Affected"
            type="number"
            placeholder="e.g., 10"
            value={additionalData?.peopleAffected || ''}
            onChange={(e) => updateField('peopleAffected', e?.target?.value)}
            min="0"
            description="Approximate number of people impacted"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Health & Safety Concerns</label>
          <div className="space-y-2">
            <Checkbox
              label="Immediate health risk"
              checked={additionalData?.healthRisk || false}
              onChange={(e) => updateField('healthRisk', e?.target?.checked)}
            />
            <Checkbox
              label="Children or elderly at risk"
              checked={additionalData?.vulnerablePopulation || false}
              onChange={(e) => updateField('vulnerablePopulation', e?.target?.checked)}
            />
            <Checkbox
              label="Property damage visible"
              checked={additionalData?.propertyDamage || false}
              onChange={(e) => updateField('propertyDamage', e?.target?.checked)}
            />
            <Checkbox
              label="Wildlife affected"
              checked={additionalData?.wildlifeAffected || false}
              onChange={(e) => updateField('wildlifeAffected', e?.target?.checked)}
            />
          </div>
        </div>
      </div>
      {/* Scientific Measurements (for researchers) */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Microscope" size={18} className="text-primary" />
          <h4 className="font-medium text-foreground">Scientific Measurements</h4>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Optional</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Air Quality Index (AQI)"
            type="number"
            placeholder="e.g., 85"
            value={additionalData?.aqi || ''}
            onChange={(e) => updateField('aqi', e?.target?.value)}
            min="0"
            max="500"
            description="If you have an AQI meter reading"
          />

          <Input
            label="Noise Level (dB)"
            type="number"
            placeholder="e.g., 75"
            value={additionalData?.noiseLevel || ''}
            onChange={(e) => updateField('noiseLevel', e?.target?.value)}
            min="0"
            max="200"
            description="If you have a decibel meter reading"
          />

          <Input
            label="pH Level"
            type="number"
            placeholder="e.g., 6.5"
            value={additionalData?.phLevel || ''}
            onChange={(e) => updateField('phLevel', e?.target?.value)}
            min="0"
            max="14"
            step="0.1"
            description="For water quality issues"
          />

          <Input
            label="Other Measurements"
            type="text"
            placeholder="e.g., CO2: 450 ppm"
            value={additionalData?.otherMeasurements || ''}
            onChange={(e) => updateField('otherMeasurements', e?.target?.value)}
            description="Any other scientific readings"
          />
        </div>
      </div>
      {/* Contact Information */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Icon name="Phone" size={18} className="text-primary" />
          <h4 className="font-medium text-foreground">Contact Information</h4>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">Optional</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Contact Phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={additionalData?.contactPhone || ''}
            onChange={(e) => updateField('contactPhone', e?.target?.value)}
            description="For follow-up questions (optional)"
          />

          <Input
            label="Best Time to Contact"
            type="text"
            placeholder="e.g., Weekdays 9 AM - 5 PM"
            value={additionalData?.contactTime || ''}
            onChange={(e) => updateField('contactTime', e?.target?.value)}
            description="When you're available for contact"
          />
        </div>

        <Checkbox
          label="I consent to being contacted about this report for follow-up information"
          checked={additionalData?.contactConsent || false}
          onChange={(e) => updateField('contactConsent', e?.target?.checked)}
        />
      </div>
    </div>
  );
};

export default AdditionalData;