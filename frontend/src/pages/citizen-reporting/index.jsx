import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import AlertNotificationBar from '../../components/ui/AlertNotificationBar';
import { reportService } from '../../utils/report';
import { storeMedia, incrementReportCount, checkAndAwardAchievements, ACHIEVEMENTS } from '../../utils/mediaStorage';

// Import components
import IssueTypeSelector from './components/IssueTypeSelector';
import LocationCapture from './components/LocationCapture';
import PhotoUpload from './components/PhotoUpload';
import IssueDescription from './components/IssueDiscription';
import AdditionalData from './components/AdditionalData';
import ReportPreview from './components/ReportPreview';
import NearbyReports from './components/NearByReports';

const CitizenReporting = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Form data state
  const [reportData, setReportData] = useState({
    issueType: '',
    location: null,
    photos: [],
    description: '',
    severity: '',
    additionalData: {}
  });

  const steps = [
    { id: 1, name: 'Issue Type', icon: 'Tag' },
    { id: 2, name: 'Location', icon: 'MapPin' },
    { id: 3, name: 'Photos', icon: 'Camera' },
    { id: 4, name: 'Description', icon: 'FileText' },
    { id: 5, name: 'Additional Info', icon: 'Info' }
  ];

  const updateReportData = (field, value) => {
    setReportData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return reportData?.issueType !== '';
      case 2:
        return reportData?.location !== null;
      case 3:
        return true; // Photos are optional
      case 4:
        return reportData?.description?.trim() !== '' && reportData?.severity !== '';
      case 5:
        return true; // Additional data is optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps?.length) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowPreview(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Store media files first
      const reportId = `report_${Date.now()}`;
      let mediaIds = [];
      
      if (reportData.photos.length > 0) {
        mediaIds = await storeMedia(reportData.photos, reportId);
      }
      
      // Prepare report data
      const formattedReport = {
        issueType: reportData.issueType,
        description: reportData.description,
        severity: reportData.severity,
        keywords: reportData.additionalData.keywords || '',
        location: reportData.location ? `${reportData.location.lat},${reportData.location.lng}` : '',
        photoHash: JSON.stringify(mediaIds), // Store media IDs
        additionalData: JSON.stringify({
          ...reportData.additionalData,
          reportId,
          mediaIds
        })
      };
      
      // Submit to blockchain via API
      const response = await reportService.submitReport(formattedReport);
      
      // Increment report count and check for achievements
      const newCount = incrementReportCount();
      const newAchievements = checkAndAwardAchievements(newCount);
      
      console.log('Report submitted with transaction:', response.txHash);
      
      // Show achievement notification if any new ones were earned
      if (newAchievements.length > 0) {
        const achievementNames = newAchievements
          .map(id => ACHIEVEMENTS[id].name)
          .join(', ');
        alert(`🏆 Achievement Unlocked: ${achievementNames}!`);
      }
      
      alert('Report submitted successfully and stored securely on blockchain! You will receive updates on the investigation progress.');
      
      // Reset form
      setReportData({
        issueType: '',
        location: null,
        photos: [],
        description: '',
        severity: '',
        additionalData: {}
      });
      setCurrentStep(1);
      setShowPreview(false);
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (showPreview) {
      return (
        <ReportPreview
          reportData={reportData}
          onEdit={() => setShowPreview(false)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <IssueTypeSelector
            selectedType={reportData?.issueType}
            onTypeSelect={(type) => updateReportData('issueType', type)}
          />
        );
      case 2:
        return (
          <LocationCapture
            location={reportData?.location}
            onLocationChange={(location) => updateReportData('location', location)}
          />
        );
      case 3:
        return (
          <PhotoUpload
            photos={reportData?.photos}
            onPhotosChange={(photos) => updateReportData('photos', photos)}
          />
        );
      case 4:
        return (
          <IssueDescription
            description={reportData?.description}
            onDescriptionChange={(description) => updateReportData('description', description)}
            severity={reportData?.severity}
            onSeverityChange={(severity) => updateReportData('severity', severity)}
          />
        );
      case 5:
        return (
          <AdditionalData
            additionalData={reportData?.additionalData}
            onAdditionalDataChange={(data) => updateReportData('additionalData', data)}
          />
        );
      default:
        return null;
    }
  };

  const getStepProgress = () => {
    return ((currentStep - 1) / steps?.length) * 100;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AlertNotificationBar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
              <Link to="/environmental-dashboard" className="hover:text-foreground transition-colors duration-200">
                Dashboard
              </Link>
              <Icon name="ChevronRight" size={14} />
              <span>Citizen Reporting</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Report Environmental Issue</h1>
            <p className="text-muted-foreground">
              Help improve your community by reporting environmental concerns. Your reports help authorities take action and keep everyone informed.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                {/* Progress Header */}
                {!showPreview && (
                  <div className="bg-muted/30 px-6 py-4 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-foreground">
                        Step {currentStep} of {steps?.length}: {steps?.[currentStep - 1]?.name}
                      </h2>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(getStepProgress())}% Complete
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getStepProgress()}%` }}
                      />
                    </div>
                    
                    {/* Step Indicators */}
                    <div className="flex items-center justify-between mt-4">
                      {steps?.map((step) => (
                        <div
                          key={step?.id}
                          className={`flex items-center space-x-2 ${
                            step?.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            step?.id < currentStep 
                              ? 'bg-primary text-primary-foreground' 
                              : step?.id === currentStep
                              ? 'bg-primary/20 text-primary border-2 border-primary' :'bg-muted text-muted-foreground'
                          }`}>
                            {step?.id < currentStep ? (
                              <Icon name="Check" size={14} />
                            ) : (
                              <Icon name={step?.icon} size={14} />
                            )}
                          </div>
                          <span className="hidden sm:block text-sm font-medium">{step?.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step Content */}
                <div className="p-6">
                  {renderStepContent()}
                </div>

                {/* Navigation Footer */}
                {!showPreview && (
                  <div className="bg-muted/30 px-6 py-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        iconName="ChevronLeft"
                        iconPosition="left"
                      >
                        Previous
                      </Button>
                      
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          onClick={() => setShowPreview(true)}
                          disabled={!validateCurrentStep()}
                        >
                          Preview Report
                        </Button>
                        
                        {currentStep < steps?.length ? (
                          <Button
                            onClick={handleNext}
                            disabled={!validateCurrentStep()}
                            iconName="ChevronRight"
                            iconPosition="right"
                          >
                            Next
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setShowPreview(true)}
                            disabled={!validateCurrentStep()}
                            iconName="Eye"
                            iconPosition="right"
                          >
                            Review & Submit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Tips */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="Lightbulb" size={18} className="text-primary" />
                  <h3 className="font-semibold text-foreground">Reporting Tips</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <span>Be specific about location and timing</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <span>Include clear photos when possible</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <span>Describe immediate health risks</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Icon name="Check" size={14} className="text-success mt-0.5" />
                    <span>Provide objective observations</span>
                  </li>
                </ul>
              </div>

              {/* Emergency Contact */}
              <div className="bg-error/5 border border-error/20 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Icon name="AlertTriangle" size={18} className="text-error" />
                  <h3 className="font-semibold text-error">Emergency Situations</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  For immediate health or safety threats, contact emergency services first.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-error text-error hover:bg-error hover:text-error-foreground"
                  iconName="Phone"
                  iconPosition="left"
                >
                  Call 911
                </Button>
              </div>

              {/* Nearby Reports */}
              <div className="bg-card border border-border rounded-lg p-6">
                <NearbyReports />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenReporting;