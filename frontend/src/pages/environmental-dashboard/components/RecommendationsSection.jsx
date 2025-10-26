import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecommendationsSection = () => {
  const [activeCategory, setActiveCategory] = useState('personal');

  const recommendations = {
    personal: [
      {
        id: 1,
        title: 'Reduce Vehicle Usage',
        description: 'Consider walking or cycling for trips under 2 miles. Current air quality in your area would benefit from reduced emissions.',
        impact: 'High',
        difficulty: 'Easy',
        icon: 'Bike',
        estimatedSaving: '15 kg CO₂/month',
        timeframe: 'Immediate'
      },
      {
        id: 2,
        title: 'Energy Conservation',
        description: 'Switch to LED bulbs and unplug devices when not in use. Your energy usage is 23% above neighborhood average.',
        impact: 'Medium',
        difficulty: 'Easy',
        icon: 'Lightbulb',
        estimatedSaving: '8 kg CO₂/month',
        timeframe: '1 week'
      },
      {
        id: 3,
        title: 'Water Conservation',
        description: 'Install low-flow showerheads and fix leaky faucets. Water quality monitoring shows increased demand in your area.',
        impact: 'Medium',
        difficulty: 'Medium',
        icon: 'Droplets',
        estimatedSaving: '200L water/month',
        timeframe: '2 weeks'
      }
    ],
    community: [
      {
        id: 4,
        title: 'Organize Tree Planting',
        description: 'Your neighborhood has 15% less green coverage than city average. Organize a community tree planting event.',
        impact: 'High',
        difficulty: 'Hard',
        icon: 'Trees',
        estimatedSaving: '50 kg CO₂/year per tree',
        timeframe: '1 month'
      },
      {
        id: 5,
        title: 'Community Garden',
        description: 'Start a community garden to reduce food transportation emissions and improve local air quality.',
        impact: 'Medium',
        difficulty: 'Hard',
        icon: 'Sprout',
        estimatedSaving: '25 kg CO₂/month',
        timeframe: '3 months'
      }
    ],
    policy: [
      {
        id: 6,
        title: 'Support Clean Energy Initiative',
        description: 'Contact local representatives about the proposed solar panel installation program for public buildings.',
        impact: 'High',
        difficulty: 'Easy',
        icon: 'Sun',
        estimatedSaving: '1000 kg CO₂/year',
        timeframe: 'Ongoing'
      },
      {
        id: 7,
        title: 'Advocate for Bike Lanes',
        description: 'Support the city council proposal for protected bike lanes on Main Street to reduce traffic emissions.',
        impact: 'Medium',
        difficulty: 'Medium',
        icon: 'Road',
        estimatedSaving: '500 kg CO₂/year',
        timeframe: '6 months'
      }
    ]
  };

  const categories = [
    { id: 'personal', name: 'Personal Actions', icon: 'User', count: recommendations?.personal?.length },
    { id: 'community', name: 'Community', icon: 'Users', count: recommendations?.community?.length },
    { id: 'policy', name: 'Policy & Advocacy', icon: 'Megaphone', count: recommendations?.policy?.length }
  ];

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'High':
        return 'text-success bg-success/10 border-success/20';
      case 'Medium':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'Low':
        return 'text-muted-foreground bg-muted/10 border-border';
      default:
        return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-success';
      case 'Medium':
        return 'text-warning';
      case 'Hard':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
          <Button variant="ghost" size="sm">
            <Icon name="RefreshCw" size={16} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories?.map((category) => (
            <button
              key={category?.id}
              onClick={() => setActiveCategory(category?.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeCategory === category?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name={category?.icon} size={14} />
              <span>{category?.name}</span>
              <span className="bg-background/20 px-2 py-0.5 rounded-full text-xs">
                {category?.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 space-y-4">
        {recommendations?.[activeCategory]?.map((recommendation) => (
          <div
            key={recommendation?.id}
            className="p-4 rounded-lg border border-border hover:shadow-sm transition-shadow duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Icon name={recommendation?.icon} size={24} className="text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-foreground">{recommendation?.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(recommendation?.impact)}`}>
                    {recommendation?.impact} Impact
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {recommendation?.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Difficulty</div>
                    <div className={`text-sm font-medium ${getDifficultyColor(recommendation?.difficulty)}`}>
                      {recommendation?.difficulty}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Estimated Saving</div>
                    <div className="text-sm font-medium text-foreground">
                      {recommendation?.estimatedSaving}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Timeframe</div>
                    <div className="text-sm font-medium text-foreground">
                      {recommendation?.timeframe}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Action</div>
                    <Button variant="outline" size="sm" className="h-8">
                      Start Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Recommendations updated based on your location and preferences
          </span>
          <Button variant="ghost" size="sm">
            View All →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsSection;