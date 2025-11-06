// Media storage utilities using localStorage
const STORAGE_KEYS = {
  MEDIA: 'citizen_reports_media',
  REPORTS_COUNT: 'citizen_reports_count',
  USER_ACHIEVEMENTS: 'user_achievements'
};

// Convert File/Blob/URL/data-uri to base64
const fileToBase64 = async (input) => {
  // If input is already a data URL string, return it
  if (typeof input === 'string' && input.startsWith('data:')) {
    return input;
  }

  // If input is a URL (blob: or http(s):), fetch it and convert to blob
  if (typeof input === 'string' && (input.startsWith('blob:') || input.startsWith('http://') || input.startsWith('https://'))) {
    const resp = await fetch(input);
    const blob = await resp.blob();
    input = blob;
  }

  return new Promise((resolve, reject) => {
    try {
      if (!(input instanceof Blob)) {
        return reject(new TypeError('fileToBase64: input is not a Blob or data URL'));
      }
      const reader = new FileReader();
      reader.readAsDataURL(input);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    } catch (e) {
      reject(e);
    }
  });
};

  // Store media files in localStorage with cleanup
export const storeMedia = async (files, reportId) => {
  try {
    // Get existing media storage
    let existingStorage = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDIA) || '{}');
    
    // Cleanup old media entries if storage is getting full
    const storageKeys = Object.keys(existingStorage);
    if (storageKeys.length > 10) {  // Keep only last 10 reports' media
      const sortedKeys = storageKeys.sort((a, b) => {
        const aTime = Math.max(...(existingStorage[a]?.map(m => m.timestamp) || [0]));
        const bTime = Math.max(...(existingStorage[b]?.map(m => m.timestamp) || [0]));
        return bTime - aTime;
      });
      
      // Remove older entries
      const keysToRemove = sortedKeys.slice(10);
      keysToRemove.forEach(key => delete existingStorage[key]);
      
      try {
        localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(existingStorage));
      } catch (e) {
        console.warn('Failed to cleanup media storage, clearing all:', e);
        existingStorage = {};
        localStorage.setItem(STORAGE_KEYS.MEDIA, '{}');
      }
    }    // Convert all files to base64
    const mediaPromises = files.map(async (fileWrapper) => {
      try {
        // Support both raw File/Blob objects and wrapper objects { file, url, data, ... }
        let fileCandidate = fileWrapper && fileWrapper.file ? fileWrapper.file : fileWrapper;

        // If wrapper contains a data property, use it directly
        if (!fileCandidate && fileWrapper && fileWrapper.data) {
          return {
            id: `${reportId}_${Date.now()}_${fileWrapper.name || 'file'}`,
            type: fileWrapper.type || 'application/octet-stream',
            name: fileWrapper.name || `file_${Date.now()}`,
            size: fileWrapper.size || 0,
            data: fileWrapper.data,
            timestamp: Date.now()
          };
        }

        // If wrapper contains a blob/object URL (URL.createObjectURL), try to use it
        if (!fileCandidate && fileWrapper && fileWrapper.url) {
          fileCandidate = fileWrapper.url;
        }

        const base64 = await fileToBase64(fileCandidate);

        // Determine metadata, preferring actual File info when available
        const name = fileCandidate?.name || fileWrapper?.name || `file_${Date.now()}`;
        const type = fileCandidate?.type || fileWrapper?.type || 'application/octet-stream';
        const size = fileCandidate?.size || fileWrapper?.size || 0;

        return {
          id: `${reportId}_${Date.now()}_${name}`,
          type,
          name,
          size,
          data: base64,
          timestamp: Date.now()
        };
      } catch (e) {
        console.warn('storeMedia: skipping file because it could not be processed', e?.message || e);
        return null;
      }
    });

  const mediaFilesRaw = await Promise.all(mediaPromises);
  const mediaFiles = mediaFilesRaw.filter(Boolean);

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