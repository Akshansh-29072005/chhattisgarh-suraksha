// Media storage utilities using localStorage
const STORAGE_KEYS = {
  MEDIA: 'citizen_reports_media',
  REPORTS_COUNT: 'citizen_reports_count',
  USER_ACHIEVEMENTS: 'user_achievements'
};

// Convert File/Blob to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Store media files in localStorage
export const storeMedia = async (files, reportId) => {
  try {
    // Get existing media storage
    const existingStorage = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDIA) || '{}');
    
    // Convert all files to base64
    const mediaPromises = files.map(async (file) => {
      const base64 = await fileToBase64(file);
      return {
        id: `${reportId}_${Date.now()}_${file.name}`,
        type: file.type,
        name: file.name,
        size: file.size,
        data: base64,
        timestamp: Date.now()
      };
    });

    const mediaFiles = await Promise.all(mediaPromises);

    // Store under report ID
    existingStorage[reportId] = mediaFiles;
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(existingStorage));
    
    // Return media IDs for reference
    return mediaFiles.map(file => file.id);
  } catch (error) {
    console.error('Error storing media:', error);
    throw error;
  }
};

// Retrieve media files for a report
export const getReportMedia = (reportId) => {
  try {
    const storage = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDIA) || '{}');
    return storage[reportId] || [];
  } catch (error) {
    console.error('Error retrieving media:', error);
    return [];
  }
};

// Delete media files for a report
export const deleteReportMedia = (reportId) => {
  try {
    const storage = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDIA) || '{}');
    delete storage[reportId];
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(storage));
  } catch (error) {
    console.error('Error deleting media:', error);
  }
};

// Track report submissions count
export const incrementReportCount = () => {
  try {
    const currentCount = parseInt(localStorage.getItem(STORAGE_KEYS.REPORTS_COUNT) || '0');
    const newCount = currentCount + 1;
    localStorage.setItem(STORAGE_KEYS.REPORTS_COUNT, newCount.toString());
    checkAndAwardAchievements(newCount);
    return newCount;
  } catch (error) {
    console.error('Error incrementing report count:', error);
    return 0;
  }
};

// Get total reports submitted by user
export const getReportCount = () => {
  return parseInt(localStorage.getItem(STORAGE_KEYS.REPORTS_COUNT) || '0');
};

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_REPORT: {
    id: 'first_report',
    name: 'First Steps',
    description: 'Submit your first environmental report',
    threshold: 1,
    icon: 'Award'
  },
  ACTIVE_CITIZEN: {
    id: 'active_citizen',
    name: 'Active Citizen',
    description: 'Submit 5 environmental reports',
    threshold: 5,
    icon: 'Shield'
  },
  ENVIRONMENTAL_GUARDIAN: {
    id: 'environmental_guardian',
    name: 'Environmental Guardian',
    description: 'Submit 10 environmental reports',
    threshold: 10,
    icon: 'Star'
  },
  MASTER_REPORTER: {
    id: 'master_reporter',
    name: 'Master Reporter',
    description: 'Submit 25 environmental reports',
    threshold: 25,
    icon: 'Crown'
  }
};

// Check and award achievements based on report count
export const checkAndAwardAchievements = (reportCount) => {
  try {
    const currentAchievements = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_ACHIEVEMENTS) || '[]');
    const newAchievements = [];

    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (reportCount >= achievement.threshold && 
          !currentAchievements.includes(achievement.id)) {
        newAchievements.push(achievement.id);
      }
    });

    if (newAchievements.length > 0) {
      const updatedAchievements = [...currentAchievements, ...newAchievements];
      localStorage.setItem(STORAGE_KEYS.USER_ACHIEVEMENTS, JSON.stringify(updatedAchievements));
      return newAchievements;
    }

    return [];
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
};

// Get user achievements
export const getUserAchievements = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_ACHIEVEMENTS) || '[]');
  } catch (error) {
    console.error('Error getting achievements:', error);
    return [];
  }
};

// Get achievement details
export const getAchievementDetails = (achievementId) => {
  return ACHIEVEMENTS[achievementId] || null;
};