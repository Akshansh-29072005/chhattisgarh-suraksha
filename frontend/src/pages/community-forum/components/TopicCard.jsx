import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TopicCard = ({ topic, onTopicClick, onVote }) => {
  const getCategoryIcon = (category) => {
    const iconMap = {
      air_quality: 'Wind',
      water_quality: 'Droplets',
      sustainability: 'Recycle',
      policy: 'FileText',
      green_spaces: 'Trees',
      waste_management: 'Trash2',
      climate_change: 'Thermometer',
      community_events: 'Calendar'
    };
    return iconMap?.[category] || 'MessageCircle';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      air_quality: 'text-blue-600 bg-blue-50',
      water_quality: 'text-cyan-600 bg-cyan-50',
      sustainability: 'text-green-600 bg-green-50',
      policy: 'text-purple-600 bg-purple-50',
      green_spaces: 'text-emerald-600 bg-emerald-50',
      waste_management: 'text-orange-600 bg-orange-50',
      climate_change: 'text-red-600 bg-red-50',
      community_events: 'text-indigo-600 bg-indigo-50'
    };
    return colorMap?.[category] || 'text-gray-600 bg-gray-50';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp)?.toLocaleDateString();
  };

  const getUserInitials = (name) => {
    return name?.split(' ')?.map(word => word?.charAt(0))?.join('')?.toUpperCase()?.slice(0, 2);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
         onClick={() => onTopicClick(topic?.id)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getCategoryColor(topic?.category)}`}>
            <Icon name={getCategoryIcon(topic?.category)} size={16} />
          </div>
          <div>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(topic?.category)}`}>
              {topic?.category?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {topic?.isPinned && (
            <Icon name="Pin" size={16} className="text-primary" />
          )}
          {topic?.isLocked && (
            <Icon name="Lock" size={16} className="text-muted-foreground" />
          )}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
        {topic?.title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {topic?.preview}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {topic?.author?.avatar ? (
              <img
                src={topic?.author?.avatar}
                alt={topic?.author?.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                {getUserInitials(topic?.author?.name)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{topic?.author?.name}</span>
              {topic?.author?.badge && (
                <span className="text-xs text-primary">{topic?.author?.badge}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="MessageCircle" size={14} />
            <span>{topic?.replyCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Eye" size={14} />
            <span>{topic?.viewCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Clock" size={14} />
            <span>{formatTimeAgo(topic?.lastActivity)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="ThumbsUp"
            iconPosition="left"
            onClick={(e) => {
              e?.stopPropagation();
              onVote(topic?.id, 'up');
            }}
            className={topic?.userVote === 'up' ? 'text-primary' : ''}
          >
            {topic?.upvotes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="ThumbsDown"
            iconPosition="left"
            onClick={(e) => {
              e?.stopPropagation();
              onVote(topic?.id, 'down');
            }}
            className={topic?.userVote === 'down' ? 'text-error' : ''}
          >
            {topic?.downvotes}
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {topic?.tags?.slice(0, 2)?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md"
            >
              #{tag}
            </span>
          ))}
          {topic?.tags?.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{topic?.tags?.length - 2} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicCard;