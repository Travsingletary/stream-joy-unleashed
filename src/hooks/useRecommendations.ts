
import { useEffect, useState } from 'react';
import { useProfiles } from './useProfiles';
import { Channel } from '../types/playlist';
import { WatchHistoryItem } from '../types/profile';

interface Recommendation {
  channelId: string;
  name: string;
  logo?: string;
  reason: string;
  score: number;
  category?: string;
  genre?: string;
}

export const useRecommendations = (channels: Channel[]) => {
  const { currentProfile } = useProfiles();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentProfile || !channels.length) {
      setLoading(false);
      return;
    }

    // Generate recommendations based on watch history
    const generateRecommendations = () => {
      setLoading(true);
      
      const { watchHistory } = currentProfile;
      
      if (!watchHistory.length) {
        // No watch history, suggest popular channels or categories
        const popularRecommendations = channels
          .slice(0, Math.min(5, channels.length))
          .map(channel => ({
            channelId: channel.id,
            name: channel.name,
            logo: channel.logo,
            reason: 'Popular channel',
            score: 1,
            category: channel.group,
            genre: channel.group
          }));
        
        setRecommendations(popularRecommendations);
        setLoading(false);
        return;
      }
      
      // Analyze watch history
      const categoryScores: Record<string, number> = {};
      const timeOfDayScores: Record<string, number> = {};
      const channelScores: Record<string, number> = {};
      
      // Calculate time of day
      const getTimeOfDay = (): string => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 22) return 'evening';
        return 'night';
      };
      
      const currentTimeOfDay = getTimeOfDay();
      
      // Score based on watch history
      watchHistory.forEach(item => {
        // Score by category
        if (item.category) {
          categoryScores[item.category] = (categoryScores[item.category] || 0) + 1;
        }
        
        // Score by time of day
        if (item.timeOfDay) {
          timeOfDayScores[item.timeOfDay] = (timeOfDayScores[item.timeOfDay] || 0) + 1;
        }
        
        // Score by specific channel
        channelScores[item.channelId] = (channelScores[item.channelId] || 0) + 1;
      });
      
      // Score all available channels
      const scoredChannels: Recommendation[] = channels.map(channel => {
        let score = 0;
        let reason = '';
        
        // Match by category
        if (channel.group && categoryScores[channel.group]) {
          score += categoryScores[channel.group] * 2;
          reason = `Based on your interest in ${channel.group}`;
        }
        
        // Boost score for channels watched at similar time of day
        if (timeOfDayScores[currentTimeOfDay] > 0) {
          score += 1;
          reason = reason || `Popular during ${currentTimeOfDay}`;
        }
        
        // Direct channel match (highest priority)
        if (channelScores[channel.id]) {
          score += channelScores[channel.id] * 5;
          reason = 'Based on your watch history';
        }
        
        // Don't recommend recently watched unless nothing else is available
        const recentlyWatched = watchHistory
          .slice(-3)
          .some(item => item.channelId === channel.id);
          
        if (recentlyWatched) {
          score -= 2;
        }
        
        return {
          channelId: channel.id,
          name: channel.name,
          logo: channel.logo,
          reason,
          score,
          category: channel.group,
          genre: channel.group
        };
      });
      
      // Sort by score and take top recommendations
      const topRecommendations = scoredChannels
        .filter(rec => rec.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
        
      // If we don't have enough recommendations, add some popular channels
      if (topRecommendations.length < 3) {
        const popularChannels = channels
          .slice(0, 5)
          .map(channel => ({
            channelId: channel.id,
            name: channel.name,
            logo: channel.logo,
            reason: 'Popular channel',
            score: 0,
            category: channel.group,
            genre: channel.group
          }))
          .filter(rec => !topRecommendations.some(r => r.channelId === rec.channelId));
          
        topRecommendations.push(...popularChannels.slice(0, 5 - topRecommendations.length));
      }
      
      setRecommendations(topRecommendations);
      setLoading(false);
    };
    
    generateRecommendations();
  }, [currentProfile, channels]);
  
  return { recommendations, loading };
};
