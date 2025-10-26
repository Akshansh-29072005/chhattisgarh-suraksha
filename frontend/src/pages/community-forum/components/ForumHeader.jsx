import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ForumHeader = ({ onCreatePost, onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'air_quality', label: 'Air Quality' },
    { value: 'water_quality', label: 'Water Quality' },
    { value: 'sustainability', label: 'Sustainability Tips' },
    { value: 'policy', label: 'Policy Discussions' },
    { value: 'green_spaces', label: 'Green Spaces' },
    { value: 'waste_management', label: 'Waste Management' },
    { value: 'climate_change', label: 'Climate Change' },
    { value: 'community_events', label: 'Community Events' }
  ];

  const handleSearch = (e) => {
    const query = e?.target?.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onFilterChange({ category });
  };

  return (
    <div className="bg-card border-b border-border sticky top-0 z-10">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Community Forum</h1>
            <p className="text-muted-foreground">
              Connect with fellow environmental advocates and share knowledge
            </p>
          </div>
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={onCreatePost}
            className="lg:w-auto w-full"
          >
            Create New Topic
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search discussions, topics, or users..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
          <div className="md:w-64">
            <Select
              options={categories}
              value={selectedCategory}
              onChange={handleCategoryChange}
              placeholder="Filter by category"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumHeader;