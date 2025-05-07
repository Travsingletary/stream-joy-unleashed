
import { Channel, Group, Playlist, XtreamCredentials } from "../types/playlist";
import { toast } from "../hooks/use-toast";

// Function to load M3U playlists
export async function loadM3UPlaylist(url: string): Promise<Playlist> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch M3U: ${response.status} ${response.statusText}`);
    }

    const m3uContent = await response.text();
    return parseM3UContent(m3uContent);
  } catch (error) {
    console.error("Error loading M3U playlist:", error);
    throw error;
  }
}

// Function to load playlist via Xtream API
export async function loadXtreamPlaylist(credentials: XtreamCredentials): Promise<Playlist> {
  try {
    // Normalize the base URL (remove trailing slashes)
    const baseUrl = credentials.url.replace(/\/+$/, '');
    
    // Fetch categories
    const categoriesUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(credentials.username)}&password=${encodeURIComponent(credentials.password)}&action=get_live_categories`;
    const categoriesResponse = await fetch(categoriesUrl);
    if (!categoriesResponse.ok) {
      throw new Error("Failed to authenticate with Xtream provider");
    }
    
    const categories = await categoriesResponse.json();
    
    // Fetch channels
    const channelsUrl = `${baseUrl}/player_api.php?username=${encodeURIComponent(credentials.username)}&password=${encodeURIComponent(credentials.password)}&action=get_live_streams`;
    const channelsResponse = await fetch(channelsUrl);
    if (!channelsResponse.ok) {
      throw new Error("Failed to fetch channels from Xtream provider");
    }
    
    const channelsData = await channelsResponse.json();
    
    // Parse the Xtream data into our common format
    return parseXtreamData(baseUrl, credentials, categories, channelsData);
  } catch (error) {
    console.error("Error loading Xtream playlist:", error);
    throw error;
  }
}

// Function to parse M3U content into our common playlist format
function parseM3UContent(content: string): Playlist {
  const playlist: Playlist = {
    groups: [],
    channels: []
  };
  
  // Split content into lines
  const lines = content.split('\n');
  
  if (!lines[0].includes('#EXTM3U')) {
    throw new Error('Invalid M3U playlist format');
  }
  
  // Create a map to store groups
  const groupMap = new Map<string, Group>();
  
  let currentChannel: Partial<Channel> = {};
  
  // Parse each line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // If this is an extinf line (channel info)
    if (line.startsWith('#EXTINF:')) {
      currentChannel = {};
      
      // Parse channel info
      const infoMatch = line.match(/#EXTINF:(-?\d+)\s*(.*)$/);
      if (infoMatch) {
        const channelInfo = infoMatch[2];
        
        // Parse channel name
        const nameMatch = channelInfo.match(/,(.*)$/);
        if (nameMatch) {
          currentChannel.name = nameMatch[1].trim();
        }
        
        // Parse tvg-id
        const tvgIdMatch = channelInfo.match(/tvg-id="([^"]*)"/);
        if (tvgIdMatch) {
          currentChannel.epgChannelId = tvgIdMatch[1];
        }
        
        // Parse tvg-logo
        const tvgLogoMatch = channelInfo.match(/tvg-logo="([^"]*)"/);
        if (tvgLogoMatch) {
          currentChannel.logo = tvgLogoMatch[1];
        }
        
        // Parse group-title
        const groupMatch = channelInfo.match(/group-title="([^"]*)"/);
        if (groupMatch) {
          currentChannel.group = groupMatch[1];
        } else {
          currentChannel.group = 'Uncategorized';
        }
      }
    } 
    // If this is a URL line (not starting with #)
    else if (!line.startsWith('#')) {
      if (currentChannel.name) {
        const channelId = crypto.randomUUID();
        const channel: Channel = {
          id: channelId,
          name: currentChannel.name || 'Unknown Channel',
          logo: currentChannel.logo,
          group: currentChannel.group || 'Uncategorized',
          url: line,
          epgChannelId: currentChannel.epgChannelId
        };
        
        playlist.channels.push(channel);
        
        // Add to appropriate group
        const groupId = channel.group || 'Uncategorized';
        if (!groupMap.has(groupId)) {
          groupMap.set(groupId, {
            id: groupId,
            name: groupId,
            channels: []
          });
        }
        
        groupMap.get(groupId)?.channels.push(channel);
        currentChannel = {};
      }
    }
  }
  
  // Convert group map to array
  playlist.groups = Array.from(groupMap.values());
  
  console.log(`Loaded M3U playlist: ${playlist.channels.length} channels in ${playlist.groups.length} groups`);
  return playlist;
}

// Function to parse Xtream API data into our common playlist format
function parseXtreamData(
  baseUrl: string,
  credentials: XtreamCredentials,
  categories: any[],
  channels: any[]
): Playlist {
  const playlist: Playlist = {
    name: "Xtream Playlist",
    groups: [],
    channels: []
  };
  
  // Create a map to store groups
  const groupMap = new Map<string, Group>();
  
  // Create default 'All' group
  const allGroupId = "all";
  groupMap.set(allGroupId, {
    id: allGroupId,
    name: "All Channels",
    channels: []
  });
  
  // Process categories
  categories.forEach(category => {
    const groupId = category.category_id.toString();
    groupMap.set(groupId, {
      id: groupId,
      name: category.category_name,
      channels: []
    });
  });
  
  // Process channels
  channels.forEach(channel => {
    // Build stream URL
    // Format: http(s)://server:port/live/username/password/streamID.ext
    const streamUrl = `${baseUrl}/live/${credentials.username}/${credentials.password}/${channel.stream_id}.${channel.container_extension || 'ts'}`;
    
    const channelObj: Channel = {
      id: channel.stream_id.toString(),
      name: channel.name,
      logo: channel.stream_icon || undefined,
      group: channel.category_id?.toString() || "1",
      url: streamUrl,
      epgChannelId: channel.epg_channel_id || undefined
    };
    
    playlist.channels.push(channelObj);
    
    // Add to All group
    groupMap.get(allGroupId)?.channels.push(channelObj);
    
    // Add to specific group
    const groupId = channel.category_id?.toString() || "1";
    if (groupMap.has(groupId)) {
      groupMap.get(groupId)?.channels.push(channelObj);
    }
  });
  
  // Convert group map to array
  playlist.groups = Array.from(groupMap.values());
  
  console.log(`Loaded Xtream playlist: ${playlist.channels.length} channels in ${playlist.groups.length} groups`);
  return playlist;
}

// Local storage functions to save/load playlist data
const PLAYLIST_STORAGE_KEY = 'steadystream_playlist';
const XTREAM_CREDS_KEY = 'steadystream_xtream';
const M3U_URL_KEY = 'steadystream_m3u';

export function savePlaylistToStorage(playlist: Playlist) {
  try {
    localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlist));
  } catch (error) {
    console.error("Error saving playlist to localStorage:", error);
  }
}

export function getPlaylistFromStorage(): Playlist | null {
  try {
    const data = localStorage.getItem(PLAYLIST_STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as Playlist;
    }
  } catch (error) {
    console.error("Error reading playlist from localStorage:", error);
  }
  return null;
}

export function saveXtreamCredentials(credentials: XtreamCredentials) {
  try {
    localStorage.setItem(XTREAM_CREDS_KEY, JSON.stringify(credentials));
  } catch (error) {
    console.error("Error saving Xtream credentials to localStorage:", error);
  }
}

export function getXtreamCredentials(): XtreamCredentials | null {
  try {
    const data = localStorage.getItem(XTREAM_CREDS_KEY);
    if (data) {
      return JSON.parse(data) as XtreamCredentials;
    }
  } catch (error) {
    console.error("Error reading Xtream credentials from localStorage:", error);
  }
  return null;
}

export function saveM3UUrl(url: string) {
  try {
    localStorage.setItem(M3U_URL_KEY, url);
  } catch (error) {
    console.error("Error saving M3U URL to localStorage:", error);
  }
}

export function getM3UUrl(): string | null {
  return localStorage.getItem(M3U_URL_KEY);
}
