import React from 'react';
import Icon from '../../../components/AppIcon';

const IssueTypeSelector = ({ selectedType, onTypeSelect }) => {
  const issueTypes = [
    {
      id: 'air_pollution',
      name: 'Air Pollution',
      icon: 'Wind',
      description: 'Smoke, smog, industrial emissions, vehicle exhaust',
      color: '#DC2626'
    },
    {
      id: 'water_pollution',
      name: 'Water Pollution',
      icon: 'Droplets',
      description: 'Contaminated water, oil spills, chemical discharge',
      color: '#4A90A4'
    },
    {
      id: 'noise_pollution',
      name: 'Noise Pollution',
      icon: 'Volume2',
      description: 'Excessive noise, construction, traffic, industrial sounds',
      color: '#D97706'
    },
    {
      id: 'litter_waste',
      name: 'Litter & Waste',
      icon: 'Trash2',
      description: 'Illegal dumping, overflowing bins, street litter',
      color: '#6B7280'
    },
    {
      id: 'green_space_damage',
      name: 'Green Space Damage',
      icon: 'Trees',
      description: 'Tree damage, park vandalism, vegetation destruction',
      color: '#2D5A27'
    },
    {
      id: 'wildlife_concern',
      name: 'Wildlife Concern',
      icon: 'Bird',
      description: 'Injured animals, habitat destruction, wildlife disturbance',
      color: '#059669'
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure Issues',
      icon: 'Construction',
      description: 'Damaged roads, broken streetlights, facility problems',
      color: '#7C3AED'
    },
    {
      id: 'other',
      name: 'Other Environmental Issue',
      icon: 'AlertTriangle',
      description: 'Any other environmental concern not listed above',
      color: '#F4A261'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Issue Type</h3>
        <p className="text-sm text-muted-foreground">Select the type of environmental issue you want to report</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {issueTypes?.map((type) => (
          <button
            key={type?.id}
            onClick={() => onTypeSelect(type?.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md ${
              selectedType === type?.id
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ backgroundColor: `${type?.color}15`, color: type?.color }}
              >
                <Icon name={type?.icon} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm mb-1">{type?.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{type?.description}</p>
              </div>
            </div>
            {selectedType === type?.id && (
              <div className="mt-3 flex justify-end">
                <Icon name="Check" size={16} className="text-primary" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IssueTypeSelector;