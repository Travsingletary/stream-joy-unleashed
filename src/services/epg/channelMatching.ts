
import { EPGData } from "../../types/epg";

/**
 * Function to match EPG channels with our playlist channels
 */
export const matchChannelsWithEPG = (
  epgData: EPGData, 
  playlistChannels: any[]
): EPGData => {
  // Create a map of playlist channels by various potential matching IDs
  const channelMap = new Map();
  
  playlistChannels.forEach(channel => {
    // Map by epg_channel_id if available
    if (channel.epg_channel_id) {
      channelMap.set(channel.epg_channel_id, channel);
    }
    
    // Map by name (lowercase, no spaces)
    const normalizedName = channel.name.toLowerCase().replace(/\s+/g, '');
    channelMap.set(normalizedName, channel);
    
    // Map by ID
    channelMap.set(channel.id, channel);
  });
  
  // Filter EPG channels to only include those that match our playlist
  const matchedChannels = epgData.channels.filter(epgChannel => {
    // Try to match by ID first
    if (channelMap.has(epgChannel.id)) {
      return true;
    }
    
    // Try to match by normalized name
    const normalizedName = epgChannel.name.toLowerCase().replace(/\s+/g, '');
    if (channelMap.has(normalizedName)) {
      return true;
    }
    
    return false;
  });
  
  return {
    ...epgData,
    channels: matchedChannels
  };
};
