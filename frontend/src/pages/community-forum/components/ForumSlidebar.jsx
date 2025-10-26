import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ForumSidebar = ({ onCategorySelect, selectedCategory }) => {
  const categories = [
    {
      id: 'air_quality',
      name: 'Air Quality',
      icon: 'Wind',
      count: 234,
      description: 'Discussions about air pollution and quality monitoring'
    },
    {
      id: 'water_quality',
      name: 'Water Quality',
      icon: 'Droplets',
      count: 189,
      description: 'Water contamination and safety topics'
    },
    {
      id: 'sustainability',
      name: 'Sustainability Tips',
      icon: 'Recycle',
      count: 456,
      description: 'Practical advice for sustainable living'
    },
    {
      id: 'policy',
      name: 'Policy Discussions',
      icon: 'FileText',
      count: 123,
      description: 'Environmental policies and regulations'
    },
    {
      id: 'green_spaces',
      name: 'Green Spaces',
      icon: 'Trees',
      count: 298,
      description: 'Urban parks and green infrastructure'
    },
    {
      id: 'waste_management',
      name: 'Waste Management',
      icon: 'Trash2',
      count: 167,
      description: 'Waste reduction and recycling initiatives'
    },
    {
      id: 'climate_change',
      name: 'Climate Change',
      icon: 'Thermometer',
      count: 345,
      description: 'Climate science and adaptation strategies'
    },
    {
      id: 'community_events',
      name: 'Community Events',
      icon: 'Calendar',
      count: 89,
      description: 'Local environmental events and meetups'
    }
  ];

  const topContributors = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      badge: 'Environmental Scientist',
      posts: 156,
      reputation: 2840
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      avatar: null,
      badge: 'Climate Researcher',
      posts: 134,
      reputation: 2156
    },
    {
      id: 3,
      name: 'Emma Thompson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      badge: 'Policy Analyst',
      posts: 98,
      reputation: 1876
    },
    {
      id: 4,
      name: 'James Wilson',
      avatar: null,
      badge: 'Community Leader',
      posts: 87,
      reputation: 1654
    }
  ];

  const getUserInitials = (name) => {
    return name?.split(' ')?.map(word => word?.charAt(0))?.join('')?.toUpperCase()?.slice(0, 2);
  };

  return (
    <div className="w-80 bg-card border-r border-border h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Categories */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Folder" size={18} className="mr-2 text-primary" />
            Categories
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => onCategorySelect('all')}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors duration-200 ${
                selectedCategory === 'all' ?'bg-primary text-primary-foreground' :'hover:bg-muted text-muted-foreground'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon name="Grid3x3" size={16} />
                <span className="font-medium">All Topics</span>
              </div>
              <span className="text-sm">
                {categories?.reduce((sum, cat) => sum + cat?.count, 0)}
              </span>
            </button>
            
            {categories?.map((category) => (
              <button
                key={category?.id}
                onClick={() => onCategorySelect(category?.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors duration-200 ${
                  selectedCategory === category?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon name={category?.icon} size={16} />
                  <div>
                    <div className="font-medium">{category?.name}</div>
                    <div className="text-xs opacity-75 line-clamp-1">
                      {category?.description}
                    </div>
                  </div>
                </div>
                <span className="text-sm">{category?.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Trophy" size={18} className="mr-2 text-primary" />
            Top Contributors
          </h3>
          <div className="space-y-3">
            {topContributors?.map((contributor, index) => (
              <div
                key={contributor?.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground w-4">
                    #{index + 1}
                  </span>
                  {contributor?.avatar ? (
                    <img
                      src={contributor?.avatar}
                      alt={contributor?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                      {getUserInitials(contributor?.name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {contributor?.name}
                  </div>
                  <div className="text-xs text-primary">{contributor?.badge}</div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{contributor?.posts} posts</span>
                    <span>•</span>
                    <span>{contributor?.reputation} rep</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forum Stats */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-3 flex items-center">
            <Icon name="BarChart3" size={16} className="mr-2 text-primary" />
            Forum Statistics
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Topics</span>
              <span className="font-medium">1,901</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Posts</span>
              <span className="font-medium">12,456</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Members</span>
              <span className="font-medium">3,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Online Now</span>
              <span className="font-medium text-success">89</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Search"
              iconPosition="left"
              fullWidth
            >
              Advanced Search
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Bookmark"
              iconPosition="left"
              fullWidth
            >
              My Bookmarks
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Bell"
              iconPosition="left"
              fullWidth
            >
              Notifications
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumSidebar;