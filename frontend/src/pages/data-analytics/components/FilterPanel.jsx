import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ isOpen, onToggle, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    location: '',
    dateFrom: '',
    dateTo: '',
    pollutionTypes: [],
    severityLevel: 'all',
    dataSource: 'all',
    minValue: '',
    maxValue: ''
  });

  const [savedFilters, setSavedFilters] = useState([
    { id: 1, name: 'High Pollution Areas', description: 'Air quality > 150 AQI' },
    { id: 2, name: 'Water Quality Issues', description: 'Contamination levels > 50%' },
    { id: 3, name: 'Noise Hotspots', description: 'Sound levels > 70 dB' }
  ]);

  const locationOptions = [
    { value: 'downtown', label: 'Downtown District' },
    { value: 'river_park', label: 'River Park' },
    { value: 'industrial', label: 'Industrial Zone' },
    { value: 'residential_north', label: 'Residential North' },
    { value: 'harbor', label: 'Harbor District' },
    { value: 'university', label: 'University Campus' }
  ];

  const severityOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'low', label: 'Low (0-33%)' },
    { value: 'moderate', label: 'Moderate (34-66%)' },
    { value: 'high', label: 'High (67-100%)' }
  ];

  const dataSourceOptions = [
    { value: 'all', label: 'All Sources' },
    { value: 'sensors', label: 'IoT Sensors' },
    { value: 'satellites', label: 'Satellite Data' },
    { value: 'citizen_reports', label: 'Citizen Reports' },
    { value: 'government', label: 'Government Stations' }
  ];

  const pollutionTypes = [
    { id: 'pm25', label: 'PM2.5' },
    { id: 'pm10', label: 'PM10' },
    { id: 'no2', label: 'NO2' },
    { id: 'so2', label: 'SO2' },
    { id: 'co', label: 'CO' },
    { id: 'o3', label: 'O3' }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePollutionTypeChange = (typeId, checked) => {
    setFilters(prev => ({
      ...prev,
      pollutionTypes: checked
        ? [...prev?.pollutionTypes, typeId]
        : prev?.pollutionTypes?.filter(id => id !== typeId)
    }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters({
      location: '',
      dateFrom: '',
      dateTo: '',
      pollutionTypes: [],
      severityLevel: 'all',
      dataSource: 'all',
      minValue: '',
      maxValue: ''
    });
  };

  const handleSaveFilter = () => {
    const filterName = prompt('Enter filter name:');
    if (filterName) {
      const newFilter = {
        id: Date.now(),
        name: filterName,
        description: `Custom filter - ${new Date()?.toLocaleDateString()}`
      };
      setSavedFilters(prev => [...prev, newFilter]);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        iconName="Filter"
        iconPosition="left"
        onClick={onToggle}
        className="fixed top-20 left-4 z-10"
      >
        Filters
      </Button>
    );
  }

  return (
    <div className="fixed top-16 left-0 w-80 h-full bg-card border-r border-border z-20 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Advanced Filters</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Location Filter */}
          <div>
            <Select
              label="Location"
              options={locationOptions}
              value={filters?.location}
              onChange={(value) => handleFilterChange('location', value)}
              placeholder="Select location"
              searchable
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="From Date"
              type="date"
              value={filters?.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
            />
            <Input
              label="To Date"
              type="date"
              value={filters?.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
            />
          </div>

          {/* Pollution Types */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Pollution Types
            </label>
            <div className="space-y-2">
              {pollutionTypes?.map((type) => (
                <Checkbox
                  key={type?.id}
                  label={type?.label}
                  checked={filters?.pollutionTypes?.includes(type?.id)}
                  onChange={(e) => handlePollutionTypeChange(type?.id, e?.target?.checked)}
                />
              ))}
            </div>
          </div>

          {/* Severity Level */}
          <div>
            <Select
              label="Severity Level"
              options={severityOptions}
              value={filters?.severityLevel}
              onChange={(value) => handleFilterChange('severityLevel', value)}
            />
          </div>

          {/* Data Source */}
          <div>
            <Select
              label="Data Source"
              options={dataSourceOptions}
              value={filters?.dataSource}
              onChange={(value) => handleFilterChange('dataSource', value)}
            />
          </div>

          {/* Value Range */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Min Value"
              type="number"
              placeholder="0"
              value={filters?.minValue}
              onChange={(e) => handleFilterChange('minValue', e?.target?.value)}
            />
            <Input
              label="Max Value"
              type="number"
              placeholder="1000"
              value={filters?.maxValue}
              onChange={(e) => handleFilterChange('maxValue', e?.target?.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="default"
              onClick={handleApplyFilters}
              className="flex-1"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </div>

          <Button
            variant="ghost"
            iconName="Save"
            iconPosition="left"
            onClick={handleSaveFilter}
            className="w-full"
          >
            Save Filter
          </Button>
        </div>

        {/* Saved Filters */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-foreground mb-3">Saved Filters</h4>
          <div className="space-y-2">
            {savedFilters?.map((filter) => (
              <div
                key={filter?.id}
                className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
              >
                <div className="font-medium text-sm text-foreground">{filter?.name}</div>
                <div className="text-xs text-muted-foreground">{filter?.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;