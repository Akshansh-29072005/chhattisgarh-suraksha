import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ForumFilters = ({ onFilterChange, activeFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'replies', label: 'Most Replies' },
    { value: 'views', label: 'Most Views' },
    { value: 'oldest', label: 'Oldest First' }
  ];

  const timeFilters = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const statusFilters = [
    { value: 'all', label: 'All Topics' },
    { value: 'unanswered', label: 'Unanswered' },
    { value: 'solved', label: 'Solved' },
    { value: 'pinned', label: 'Pinned' },
    { value: 'locked', label: 'Locked' }
  ];

  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...activeFilters,
      [filterType]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      sort: 'recent',
      time: 'all',
      status: 'all',
      category: 'all'
    });
  };

  const hasActiveFilters = Object.values(activeFilters)?.some(
    (value, index) => {
      const defaults = ['recent', 'all', 'all', 'all'];
      return value !== defaults?.[index];
    }
  );

  return (
    <div className="bg-card border-b border-border">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={18} className="text-primary" />
            <span className="font-medium text-foreground">Filters</span>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                iconName="X"
                iconPosition="left"
              >
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            >
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Sort By"
            options={sortOptions}
            value={activeFilters?.sort || 'recent'}
            onChange={(value) => handleFilterChange('sort', value)}
          />

          <Select
            label="Time Period"
            options={timeFilters}
            value={activeFilters?.time || 'all'}
            onChange={(value) => handleFilterChange('time', value)}
          />

          {isExpanded && (
            <>
              <Select
                label="Status"
                options={statusFilters}
                value={activeFilters?.status || 'all'}
                onChange={(value) => handleFilterChange('status', value)}
              />

              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="default"
                  iconName="Search"
                  iconPosition="left"
                  fullWidth
                >
                  Advanced Search
                </Button>
              </div>
            </>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Quick filters:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('status', 'unanswered')}
                className={activeFilters?.status === 'unanswered' ? 'bg-muted' : ''}
              >
                Unanswered Questions
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('time', 'today')}
                className={activeFilters?.time === 'today' ? 'bg-muted' : ''}
              >
                Today's Posts
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange('sort', 'popular')}
                className={activeFilters?.sort === 'popular' ? 'bg-muted' : ''}
              >
                Trending
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumFilters;