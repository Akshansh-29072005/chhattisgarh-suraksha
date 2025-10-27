import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import AlertNotificationBar from '../../components/ui/AlertNotificationBar';
import ForumHeader from './components/ForumHeader';
import TopicCard from './components/TopicCard';
import CreateTopicModal from './components/CreateTopicModal';
import ForumSidebar from './components/ForumSlidebar';
import ForumFilters from './components/ForumFilters';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { forumAPI } from '../../utils/forum-api';

const CommunityForum = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    sort: 'recent',
    time: 'all',
    status: 'all',
    category: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadTopics();
  }, [selectedCategory, filters]);

  const loadTopics = async () => {
    setIsLoading(true);
    try {
      const response = await forumAPI.getAllTopics({
        category: selectedCategory,
        sort: filters.sort,
        status: filters.status,
        search: searchQuery
      });
      const topicsData = response.data.data.topics || [];
      setTopics(topicsData);
      setFilteredTopics(topicsData);
    } catch (err) {
      console.error('Failed to load topics:', err);
      // Fallback to empty
      setTopics([]);
      setFilteredTopics([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback mock data if API fails
  const mockTopics = [
    {
      id: 1,
      title: "Air Quality Monitoring in Downtown District - Need Community Input",
      preview: "I've been tracking air quality data in the downtown area and noticed concerning patterns during rush hours. Looking for community insights and experiences.",
      category: "air_quality",
      author: {
        name: "Dr. Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        badge: "Environmental Scientist"
      },
      replyCount: 23,
      viewCount: 156,
      upvotes: 18,
      downvotes: 2,
      userVote: null,
      lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
      isPinned: true,
      isLocked: false,
      tags: ["air-quality", "downtown", "monitoring", "health"]
    },
    {
      id: 2,
      title: "Successful Community Garden Project - Lessons Learned",
      preview: "Our neighborhood successfully established a community garden that improved local air quality and brought residents together. Here\'s what we learned.",
      category: "green_spaces",
      author: {
        name: "Michael Rodriguez",
        avatar: null,
        badge: "Community Leader"
      },
      replyCount: 45,
      viewCount: 289,
      upvotes: 34,
      downvotes: 1,
      userVote: "up",
      lastActivity: new Date(Date.now() - 7200000), // 2 hours ago
      isPinned: false,
      isLocked: false,
      tags: ["community-garden", "green-spaces", "success-story"]
    },
    {
      id: 3,
      title: "Water Quality Testing Results - River Park Area",
      preview: "Recent water quality tests in River Park show improvement, but there are still concerns about industrial runoff affecting aquatic life.",
      category: "water_quality",
      author: {
        name: "Emma Thompson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        badge: "Policy Analyst"
      },
      replyCount: 12,
      viewCount: 98,
      upvotes: 15,
      downvotes: 0,
      userVote: null,
      lastActivity: new Date(Date.now() - 10800000), // 3 hours ago
      isPinned: false,
      isLocked: false,
      tags: ["water-quality", "river-park", "testing", "industrial"]
    },
    {
      id: 4,
      title: "New Environmental Policy Proposal - Public Comment Period",
      preview: "The city is proposing new environmental regulations for industrial emissions. The public comment period is open until next month.",
      category: "policy",
      author: {
        name: "James Wilson",
        avatar: null,
        badge: "City Planner"
      },
      replyCount: 67,
      viewCount: 445,
      upvotes: 42,
      downvotes: 8,
      userVote: null,
      lastActivity: new Date(Date.now() - 14400000), // 4 hours ago
      isPinned: true,
      isLocked: false,
      tags: ["policy", "emissions", "public-comment", "regulations"]
    },
    {
      id: 5,
      title: "DIY Home Energy Audit - Save Money and Environment",
      preview: "Learn how to conduct your own home energy audit to reduce consumption and environmental impact. Step-by-step guide included.",
      category: "sustainability",
      author: {
        name: "Lisa Park",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150",
        badge: "Sustainability Expert"
      },
      replyCount: 31,
      viewCount: 234,
      upvotes: 28,
      downvotes: 2,
      userVote: null,
      lastActivity: new Date(Date.now() - 18000000), // 5 hours ago
      isPinned: false,
      isLocked: false,
      tags: ["energy-audit", "diy", "sustainability", "home"]
    },
    {
      id: 6,
      title: "Climate Change Impact on Local Wildlife - Research Findings",
      preview: "New research shows how climate change is affecting local bird migration patterns and what we can do to help.",
      category: "climate_change",
      author: {
        name: "Dr. Robert Kim",
        avatar: null,
        badge: "Climate Researcher"
      },
      replyCount: 19,
      viewCount: 167,
      upvotes: 22,
      downvotes: 1,
      userVote: null,
      lastActivity: new Date(Date.now() - 21600000), // 6 hours ago
      isPinned: false,
      isLocked: false,
      tags: ["climate-change", "wildlife", "research", "migration"]
    }
  ];


  useEffect(() => {
    filterTopics();
  }, [topics, searchQuery, selectedCategory, filters]);

  const filterTopics = () => {
    let filtered = [...topics];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered?.filter(topic =>
        topic?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        topic?.preview?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        topic?.tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered?.filter(topic => topic?.category === selectedCategory);
    }

    // Filter by status
    if (filters?.status !== 'all') {
      switch (filters?.status) {
        case 'pinned':
          filtered = filtered?.filter(topic => topic?.isPinned);
          break;
        case 'locked':
          filtered = filtered?.filter(topic => topic?.isLocked);
          break;
        case 'unanswered':
          filtered = filtered?.filter(topic => topic?.replyCount === 0);
          break;
        case 'solved':
          filtered = filtered?.filter(topic => topic?.replyCount > 0 && topic?.upvotes > topic?.downvotes);
          break;
      }
    }

    // Sort topics
    switch (filters?.sort) {
      case 'popular':
        filtered?.sort((a, b) => (b?.upvotes - b?.downvotes) - (a?.upvotes - a?.downvotes));
        break;
      case 'replies':
        filtered?.sort((a, b) => b?.replyCount - a?.replyCount);
        break;
      case 'views':
        filtered?.sort((a, b) => b?.viewCount - a?.viewCount);
        break;
      case 'oldest':
        filtered?.sort((a, b) => new Date(a.lastActivity) - new Date(b.lastActivity));
        break;
      default: // recent
        filtered?.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    }

    setFilteredTopics(filtered);
  };

  const handleCreateTopic = async (topicData) => {
    try {
      await forumAPI.createTopic({
        title: topicData.title,
        content: topicData.content,
        category: topicData.category,
        tags: topicData.tags
      });
      // Reload topics after creation
      loadTopics();
    } catch (err) {
      console.error('Failed to create topic:', err);
    }
  };

  const handleTopicClick = (topicId) => {
    // In a real app, this would navigate to the topic detail page
    console.log('Navigate to topic:', topicId);
  };

  const handleVote = async (topicId, voteType) => {
    try {
      await forumAPI.voteTopic(topicId, voteType);
      // Optimistically update UI
      setTopics(prev => prev?.map(topic => {
        if (topic?.id === topicId) {
          const currentVote = topic?.userVote;
          let newUpvotes = topic?.upvotes || 0;
          let newDownvotes = topic?.downvotes || 0;
          let newUserVote = voteType;

          if (currentVote === 'up') newUpvotes--;
          if (currentVote === 'down') newDownvotes--;

          if (currentVote === voteType) {
            newUserVote = null;
          } else {
            if (voteType === 'up') newUpvotes++;
            if (voteType === 'down') newDownvotes++;
          }

          return {
            ...topic,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote
          };
        }
        return topic;
      }));
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (newFilters?.category) {
      setSelectedCategory(newFilters?.category);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilters(prev => ({ ...prev, category }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AlertNotificationBar />
      <div className="pt-16 flex h-screen">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
            <div className="fixed left-0 top-16 bottom-0 w-80 z-50">
              <ForumSidebar
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <ForumSidebar
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <ForumHeader
            onCreatePost={() => setIsCreateModalOpen(true)}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />

          <ForumFilters
            onFilterChange={handleFilterChange}
            activeFilters={filters}
          />

          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden p-4 border-b border-border">
            <Button
              variant="outline"
              onClick={() => setIsSidebarOpen(true)}
              iconName="Menu"
              iconPosition="left"
            >
              Categories & Filters
            </Button>
          </div>

          {/* Topics List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(6)]?.map((_, index) => (
                    <div key={index} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-muted rounded-full" />
                        <div className="w-24 h-4 bg-muted rounded" />
                      </div>
                      <div className="w-3/4 h-6 bg-muted rounded mb-2" />
                      <div className="w-full h-4 bg-muted rounded mb-4" />
                      <div className="flex justify-between">
                        <div className="flex space-x-4">
                          <div className="w-16 h-4 bg-muted rounded" />
                          <div className="w-16 h-4 bg-muted rounded" />
                        </div>
                        <div className="w-20 h-4 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredTopics?.length > 0 ? (
                <div className="space-y-4">
                  {filteredTopics?.map((topic) => (
                    <TopicCard
                      key={topic?.id}
                      topic={topic}
                      onTopicClick={handleTopicClick}
                      onVote={handleVote}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon name="MessageCircle" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No topics found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || selectedCategory !== 'all' ?'Try adjusting your search or filters' :'Be the first to start a discussion in this community'}
                  </p>
                  <Button
                    variant="default"
                    onClick={() => setIsCreateModalOpen(true)}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Create New Topic
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <CreateTopicModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTopic}
      />
    </div>
  );
};

export default CommunityForum;