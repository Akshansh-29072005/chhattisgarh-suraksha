import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const CreateTopicModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    tags: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'air_quality', label: 'Air Quality' },
    { value: 'water_quality', label: 'Water Quality' },
    { value: 'sustainability', label: 'Sustainability Tips' },
    { value: 'policy', label: 'Policy Discussions' },
    { value: 'green_spaces', label: 'Green Spaces' },
    { value: 'waste_management', label: 'Waste Management' },
    { value: 'climate_change', label: 'Climate Change' },
    { value: 'community_events', label: 'Community Events' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    
    try {
      const topicData = {
        ...formData,
        tags: formData?.tags?.split(',')?.map(tag => tag?.trim())?.filter(tag => tag),
        timestamp: new Date()?.toISOString()
      };
      
      await onSubmit(topicData);
      setFormData({ title: '', category: '', content: '', tags: '' });
      onClose();
    } catch (error) {
      console.error('Failed to create topic:', error);
      // Show validation error to user
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create topic';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-lg shadow-elevated w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Create New Topic</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <Input
            label="Topic Title"
            type="text"
            placeholder="Enter a descriptive title for your topic"
            value={formData?.title}
            onChange={(e) => handleInputChange('title', e?.target?.value)}
            required
          />

          <Select
            label="Category"
            options={categories}
            value={formData?.category}
            onChange={(value) => handleInputChange('category', value)}
            placeholder="Select a category"
            required
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Content
            </label>
            <textarea
              placeholder="Share your thoughts, questions, or insights about environmental topics..."
              value={formData?.content}
              onChange={(e) => handleInputChange('content', e?.target?.value)}
              required
              rows={8}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <Input
            label="Tags"
            type="text"
            placeholder="Enter tags separated by commas (e.g., pollution, health, research)"
            value={formData?.tags}
            onChange={(e) => handleInputChange('tags', e?.target?.value)}
            description="Tags help others find your topic more easily"
          />

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2 flex items-center">
              <Icon name="Info" size={16} className="mr-2 text-primary" />
              Community Guidelines
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be respectful and constructive in discussions</li>
              <li>• Share accurate information and cite sources when possible</li>
              <li>• Stay on topic and relevant to environmental issues</li>
              <li>• Use appropriate tags to help categorize your content</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              iconName="Send"
              iconPosition="left"
            >
              Create Topic
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTopicModal;