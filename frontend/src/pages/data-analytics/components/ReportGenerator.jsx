import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ReportGenerator = () => {
  const [reportConfig, setReportConfig] = useState({
    title: 'Environmental Data Analysis Report',
    dateRange: '7d',
    format: 'pdf',
    sections: ['summary', 'charts', 'statistics'],
    includeRawData: false,
    includeCharts: true,
    includeRecommendations: true
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReports, setGeneratedReports] = useState([
    {
      id: 1,
      title: 'Weekly Air Quality Analysis',
      generatedAt: '2025-10-07 10:30:00',
      format: 'PDF',
      size: '2.4 MB',
      status: 'Ready'
    },
    {
      id: 2,
      title: 'Monthly Pollution Trends',
      generatedAt: '2025-10-06 15:45:00',
      format: 'Excel',
      size: '1.8 MB',
      status: 'Ready'
    },
    {
      id: 3,
      title: 'Industrial Zone Assessment',
      generatedAt: '2025-10-05 09:15:00',
      format: 'PDF',
      size: '3.1 MB',
      status: 'Ready'
    }
  ]);

  const dateRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'word', label: 'Word Document' },
    { value: 'html', label: 'HTML Report' }
  ];

  const sectionOptions = [
    { id: 'summary', label: 'Executive Summary' },
    { id: 'charts', label: 'Data Visualizations' },
    { id: 'statistics', label: 'Statistical Analysis' },
    { id: 'ml_insights', label: 'ML Insights' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'appendix', label: 'Data Appendix' }
  ];

  const reportTemplates = [
    {
      id: 'weekly_summary',
      name: 'Weekly Summary',
      description: 'Comprehensive weekly environmental overview',
      sections: ['summary', 'charts', 'statistics']
    },
    {
      id: 'pollution_assessment',
      name: 'Pollution Assessment',
      description: 'Detailed pollution analysis and hotspot identification',
      sections: ['summary', 'charts', 'ml_insights', 'recommendations']
    },
    {
      id: 'compliance_report',
      name: 'Compliance Report',
      description: 'Regulatory compliance and standards comparison',
      sections: ['summary', 'statistics', 'recommendations', 'appendix']
    },
    {
      id: 'research_data',
      name: 'Research Dataset',
      description: 'Scientific research with raw data and methodology',
      sections: ['charts', 'statistics', 'ml_insights', 'appendix']
    }
  ];

  const handleConfigChange = (key, value) => {
    setReportConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSectionToggle = (sectionId, checked) => {
    setReportConfig(prev => ({
      ...prev,
      sections: checked
        ? [...prev?.sections, sectionId]
        : prev?.sections?.filter(id => id !== sectionId)
    }));
  };

  const handleTemplateSelect = (template) => {
    setReportConfig(prev => ({
      ...prev,
      title: `${template?.name} - ${new Date()?.toLocaleDateString()}`,
      sections: template?.sections
    }));
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newReport = {
      id: Date.now(),
      title: reportConfig?.title,
      generatedAt: new Date()?.toLocaleString(),
      format: reportConfig?.format?.toUpperCase(),
      size: `${(Math.random() * 3 + 1)?.toFixed(1)} MB`,
      status: 'Ready'
    };
    
    setGeneratedReports(prev => [newReport, ...prev]);
    setIsGenerating(false);
  };

  const handleDownloadReport = (reportId) => {
    // Simulate download
    console.log('Downloading report:', reportId);
  };

  const handleDeleteReport = (reportId) => {
    setGeneratedReports(prev => prev?.filter(report => report?.id !== reportId));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Report Generator</h3>
          <p className="text-sm text-muted-foreground">Create custom environmental analysis reports</p>
        </div>
        <Button
          variant="default"
          iconName="FileText"
          iconPosition="left"
          onClick={handleGenerateReport}
          loading={isGenerating}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Configuration */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Report Configuration</h4>
          
          <Input
            label="Report Title"
            value={reportConfig?.title}
            onChange={(e) => handleConfigChange('title', e?.target?.value)}
            placeholder="Enter report title"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={reportConfig?.dateRange}
              onChange={(value) => handleConfigChange('dateRange', value)}
            />

            <Select
              label="Format"
              options={formatOptions}
              value={reportConfig?.format}
              onChange={(value) => handleConfigChange('format', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Report Sections
            </label>
            <div className="space-y-2">
              {sectionOptions?.map((section) => (
                <Checkbox
                  key={section?.id}
                  label={section?.label}
                  checked={reportConfig?.sections?.includes(section?.id)}
                  onChange={(e) => handleSectionToggle(section?.id, e?.target?.checked)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Checkbox
              label="Include Raw Data"
              description="Append raw dataset to the report"
              checked={reportConfig?.includeRawData}
              onChange={(e) => handleConfigChange('includeRawData', e?.target?.checked)}
            />

            <Checkbox
              label="Include Charts"
              description="Embed interactive visualizations"
              checked={reportConfig?.includeCharts}
              onChange={(e) => handleConfigChange('includeCharts', e?.target?.checked)}
            />

            <Checkbox
              label="Include Recommendations"
              description="Add AI-generated recommendations"
              checked={reportConfig?.includeRecommendations}
              onChange={(e) => handleConfigChange('includeRecommendations', e?.target?.checked)}
            />
          </div>
        </div>

        {/* Templates & Generated Reports */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Quick Templates</h4>
            <div className="space-y-2">
              {reportTemplates?.map((template) => (
                <button
                  key={template?.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium text-foreground text-sm">{template?.name}</div>
                  <div className="text-xs text-muted-foreground">{template?.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generated Reports */}
          <div>
            <h4 className="font-medium text-foreground mb-3">Generated Reports</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {generatedReports?.map((report) => (
                <div
                  key={report?.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm truncate">
                      {report?.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {report?.generatedAt} • {report?.format} • {report?.size}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadReport(report?.id)}
                      className="h-8 w-8"
                    >
                      <Icon name="Download" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteReport(report?.id)}
                      className="h-8 w-8 text-error hover:text-error"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Report Preview */}
      {isGenerating && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <Icon name="Loader2" size={20} className="animate-spin text-primary" />
            <div>
              <div className="font-medium text-foreground">Generating Report...</div>
              <div className="text-sm text-muted-foreground">
                Processing {reportConfig?.sections?.length} sections • {reportConfig?.format?.toUpperCase()} format
              </div>
            </div>
          </div>
          <div className="mt-3 bg-background rounded-full h-2">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;