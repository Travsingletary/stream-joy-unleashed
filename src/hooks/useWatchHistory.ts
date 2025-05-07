import { useProfiles } from './useProfiles';
import { Channel } from '@/types/playlist';
import { useState, useEffect } from 'react';

export const useWatchHistory = (channel: Channel | null) => {
  const { currentProfile, updateProfile } = useProfiles();
  const [watchStartTime, setWatchStartTime] = useState<number>(0);
  
  // Start tracking watch time when channel is loaded
  useEffect(() => {
    if (channel && currentProfile) {
      // Update last watched
      updateProfile({
        ...currentProfile,
        lastWatched: channel.id
      });
      
      // Start tracking watch time
      setWatchStartTime(Date.now());
    }
    
    return () => {
      // Record watch time when leaving
      if (channel && currentProfile && watchStartTime > 0) {
        recordWatchHistory();
      }
    };
  }, [channel, currentProfile]);
  
  const recordWatchHistory = () => {
    if (!channel || !currentProfile || watchStartTime === 0) return;
    
    const watchDuration = (Date.now() - watchStartTime) / 1000; // in seconds
    if (watchDuration < 5) return; // Don't record very short views
    
    // Determine time of day
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
    else if (hour >= 22 || hour < 5) timeOfDay = 'night';
    
    const watchHistoryItem = {
      channelId: channel.id,
      name: channel.name,
      logo: channel.logo,
      timestamp: watchStartTime,
      watchDuration,
      category: channel.group,
      genre: channel.group,
      timeOfDay
    };
    
    const updatedProfile = {
      ...currentProfile,
      watchHistory: [...currentProfile.watchHistory, watchHistoryItem]
    };
    
    // Keep only the last 50 watch history items
    if (updatedProfile.watchHistory.length > 50) {
      updatedProfile.watchHistory = updatedProfile.watchHistory.slice(-50);
    }
    
    updateProfile(updatedProfile);
  };
  
  return { recordWatchHistory };
};
