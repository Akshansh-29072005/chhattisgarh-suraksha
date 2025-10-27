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
import { forumAPI } from '../../utils/api';

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
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1
  });

  // Fetch topics from backend
  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sort,
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await forumAPI.getTopics(params);
      const data = response.data;

      // Transform backend data to match frontend format
      const transformedTopics = data.topics.map(topic => ({
        id: topic.id,
        title: topic.title,
        preview: topic.content.substring(0, 150) + (topic.content.length > 150 ? '...' : ''),
        category: topic.category,
        author: {
          name: topic.author.full_name || 'Anonymous',
          avatar: null,
          badge: 'Community Member'
        },
        replyCount: topic.replies_count || 0,
        viewCount: topic.views_count || 0,
        upvotes: topic.vote_count >= 0 ? topic.vote_count : 0,
        downvotes: topic.vote_count < 0 ? Math.abs(topic.vote_count) : 0,
        userVote: null,
        lastActivity: new Date(topic.last_activity_at),
        isPinned: false,
        isLocked: false,
        tags: []
      }));

      setTopics(transformedTopics);
      setFilteredTopics(transformedTopics);

      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          totalPages: data.pagination.totalPages
        }));
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Failed to load forum topics. Please try again later.');
      setTopics([]);
      setFilteredTopics([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTopics();
  }, [pagination.page, selectedCategory, filters.sort]);

  // OLD MOCK DATA REMOVED - Now using real backend data

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
      const response = await forumAPI.createTopic({
        title: topicData.title,
        category: topicData.category,
        content: topicData.content
      });

      // Refresh topics list to show new topic
      fetchTopics();
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating topic:', err);
      alert('Failed to create topic. Please try again.');
    }
  };

  const handleTopicClick = (topicId) => {
    // Navigate to topic detail page (can be implemented later)
    navigate(`/forum/topic/${topicId}`);
  };

  const handleVote = async (topicId, voteType) => {
    try {
      const targetType = 'topic';
      const mappedVoteType = voteType === 'up' ? 'upvote' : 'downvote';

      await forumAPI.vote(targetType, topicId, mappedVoteType);

      // Update local state optimistically
      setTopics(prev => prev?.map(topic => {
        if (topic?.id === topicId) {
          const currentVote = topic?.userVote;
          let newUpvotes = topic?.upvotes;
          let newDownvotes = topic?.downvotes;
          let newUserVote = voteType;

          // Remove previous vote
          if (currentVote === 'up') newUpvotes--;
          if (currentVote === 'down') newDownvotes--;

          // Add new vote if different from current
          if (currentVote === voteType) {
            newUserVote = null; // Remove vote if clicking same button
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
      console.error('Error voting:', err);
      // Optionally show error message to user
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