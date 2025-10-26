import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { userAPI } from '../../../utils/api';

const ProfileHeader = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async () => {
    try {
      const response = await userAPI.updateProfile({
        fullName: editedUser.name,
        email: editedUser.email,
        address: editedUser.location,
      });
      onUpdateUser(response.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handlePhotoUpload = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const mockUrl = `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`;
      setEditedUser(prev => ({ ...prev, avatar: mockUrl }));
      setIsUploading(false);
    }, 2000);
  };

  const getInitials = (name) => {
    return name?.split(' ')?.map(word => word?.charAt(0))?.join('')?.toUpperCase()?.slice(0, 2);
  };

  const getUserTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'environmental scientist':
        return 'Microscope';
      case 'city planner':
        return 'Building';
      case 'activist':
        return 'Megaphone';
      case 'citizen':
        return 'User';
      default:
        return 'User';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex flex-col lg:flex-row lg:items-start space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Profile Photo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {editedUser?.avatar ? (
              <Image
                src={editedUser?.avatar}
                alt={editedUser?.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
            ) : (
              <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold border-4 border-primary/20">
                {getInitials(editedUser?.name)}
              </div>
            )}
            
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Icon name="Loader2" size={24} className="text-white animate-spin" />
              </div>
            )}
          </div>

          {isEditing && (
            <div className="text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                disabled={isUploading}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    <Icon name="Camera" size={16} className="mr-2" />
                    {isUploading ? 'Uploading...' : 'Change Photo'}
                  </span>
                </Button>
              </label>
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div className="flex-1 space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={editedUser?.name}
                onChange={(e) => setEditedUser(prev => ({ ...prev, name: e?.target?.value }))}
                required
              />
              
              <Input
                label="Location"
                value={editedUser?.location}
                onChange={(e) => setEditedUser(prev => ({ ...prev, location: e?.target?.value }))}
                placeholder="City, State/Country"
              />
              
              <Input
                label="Bio"
                value={editedUser?.bio}
                onChange={(e) => setEditedUser(prev => ({ ...prev, bio: e?.target?.value }))}
                placeholder="Tell us about yourself and your environmental interests"
              />

              <div className="flex space-x-3">
                <Button onClick={handleSave} iconName="Check" iconPosition="left">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <Icon name={getUserTypeIcon(user?.userType)} size={16} className="text-primary" />
                    <span className="text-muted-foreground">{user?.userType}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  iconName="Edit"
                  iconPosition="left"
                >
                  Edit Profile
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon name="MapPin" size={16} className="text-muted-foreground" />
                  <span className="text-foreground">{user?.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Icon name="Mail" size={16} className="text-muted-foreground" />
                  <span className="text-foreground">{user?.email}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={16} className="text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Joined {new Date(user.joinDate)?.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                </div>
              </div>

              {user?.bio && (
                <div className="mt-4">
                  <p className="text-foreground leading-relaxed">{user?.bio}</p>
                </div>
              )}

              {/* Environmental Interests */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Environmental Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {user?.interests?.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;