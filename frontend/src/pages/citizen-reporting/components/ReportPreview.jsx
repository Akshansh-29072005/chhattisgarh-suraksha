import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ReportPreview = ({ reportData, onEdit, onSubmit, isSubmitting }) => {
  const getIssueTypeInfo = (typeId) => {
    const types = {
      air_pollution: { name: 'Air Pollution', icon: 'Wind', color: '#DC2626' },
      water_pollution: { name: 'Water Pollution', icon: 'Droplets', color: '#4A90A4' },
      noise_pollution: { name: 'Noise Pollution', icon: 'Volume2', color: '#D97706' },
      litter_waste: { name: 'Litter & Waste', icon: 'Trash2', color: '#6B7280' },
      green_space_damage: { name: 'Green Space Damage', icon: 'Trees', color: '#2D5A27' },
      wildlife_concern: { name: 'Wildlife Concern', icon: 'Bird', color: '#059669' },
      infrastructure: { name: 'Infrastructure Issues', icon: 'Construction', color: '#7C3AED' },
      other: { name: 'Other Environmental Issue', icon: 'AlertTriangle', color: '#F4A261' }
    };
    return types?.[typeId] || types?.other;
  };

  const getSeverityInfo = (severity) => {
    const severities = {
      low: { label: 'Low Impact', color: '#059669' },
      moderate: { label: 'Moderate Impact', color: '#D97706' },
      high: { label: 'High Impact', color: '#DC2626' },
      critical: { label: 'Critical Impact', color: '#7C2D12' }
    };
    return severities?.[severity] || severities?.low;
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })?.format(date);
  };

  const issueType = getIssueTypeInfo(reportData?.issueType);
  const severityInfo = getSeverityInfo(reportData?.severity);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Report Preview</h3>
          <p className="text-sm text-muted-foreground">Review your report before submitting</p>
        </div>
        <Button
          variant="outline"
          onClick={onEdit}
          iconName="Edit3"
          iconPosition="left"
        >
          Edit Report
        </Button>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted/30 px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="flex items-center justify-center w-10 h-10 rounded-lg"
                style={{ backgroundColor: `${issueType?.color}15`, color: issueType?.color }}
              >
                <Icon name={issueType?.icon} size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">{issueType?.name}</h4>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: severityInfo?.color }}
                  />
                  <span className="text-sm text-muted-foreground">{severityInfo?.label}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">Report ID</div>
              <div className="text-xs text-muted-foreground">#{Date.now()?.toString()?.slice(-6)}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Location */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="MapPin" size={16} className="text-primary" />
              <h5 className="font-medium text-foreground">Location</h5>
            </div>
            <div className="pl-6">
              <p className="text-sm text-foreground mb-1">{reportData?.location?.address}</p>
              {reportData?.location?.latitude && (
                <p className="text-xs text-muted-foreground">
                  Coordinates: {reportData?.location?.latitude?.toFixed(6)}, {reportData?.location?.longitude?.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="FileText" size={16} className="text-primary" />
              <h5 className="font-medium text-foreground">Description</h5>
            </div>
            <div className="pl-6">
              <p className="text-sm text-foreground whitespace-pre-wrap">{reportData?.description}</p>
            </div>
          </div>

          {/* Photos */}
          {reportData?.photos && reportData?.photos?.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Icon name="Camera" size={16} className="text-primary" />
                <h5 className="font-medium text-foreground">Photos ({reportData?.photos?.length})</h5>
              </div>
              <div className="pl-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {reportData?.photos?.map((photo) => (
                    <div key={photo?.id} className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <Image
                        src={photo?.url}
                        alt={`Evidence photo ${photo?.name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Additional Data */}
          {reportData?.additionalData && Object.keys(reportData?.additionalData)?.some(key => reportData?.additionalData?.[key]) && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Icon name="Info" size={16} className="text-primary" />
                <h5 className="font-medium text-foreground">Additional Information</h5>
              </div>
              <div className="pl-6 space-y-2">
                {reportData?.additionalData?.weather && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Icon name="Cloud" size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">Weather:</span>
                    <span className="text-foreground capitalize">{reportData?.additionalData?.weather}</span>
                  </div>
                )}
                {reportData?.additionalData?.temperature && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Icon name="Thermometer" size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">Temperature:</span>
                    <span className="text-foreground">{reportData?.additionalData?.temperature}°F</span>
                  </div>
                )}
                {reportData?.additionalData?.affectedArea && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Icon name="Target" size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">Affected Area:</span>
                    <span className="text-foreground">{reportData?.additionalData?.affectedArea}</span>
                  </div>
                )}
                {reportData?.additionalData?.aqi && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Icon name="Wind" size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">Air Quality Index:</span>
                    <span className="text-foreground">{reportData?.additionalData?.aqi}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-primary" />
              <h5 className="font-medium text-foreground">Report Details</h5>
            </div>
            <div className="pl-6 space-y-1">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="text-foreground">{formatDateTime(new Date())}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Reporter:</span>
                <span className="text-foreground">Dr. Sarah Chen</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              This report will be reviewed by environmental authorities and community moderators
            </div>
            <Button
              onClick={onSubmit}
              loading={isSubmitting}
              iconName="Send"
              iconPosition="right"
              className="min-w-32"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;