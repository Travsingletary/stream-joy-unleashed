
import { EPGData, EPGChannel, Program } from "../types/epg";

// Helper function to parse XML
const parseXML = (xmlString: string): Document => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, "text/xml");
};

// Parse date format from XMLTV (YYYYMMDDHHMMSS)
const parseXMLTVDate = (dateString: string): number => {
  // XMLTV date format can be YYYYMMDDHHMMSS or with timezone
  const basicFormat = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s?/;
  const match = dateString.match(basicFormat);
  
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // Month is 0-based in JS
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    ).getTime();
  }
  
  // Fallback: try to parse as ISO string or return current time on failure
  try {
    return new Date(dateString).getTime();
  } catch (e) {
    console.error("Failed to parse date:", dateString);
    return Date.now();
  }
};

// Function to parse XMLTV data
export const parseXMLTV = (xmlContent: string): EPGData => {
  const xmlDoc = parseXML(xmlContent);
  const channels: EPGChannel[] = [];
  const programs: Program[] = [];
  
  // Parse channels
  const channelElements = xmlDoc.getElementsByTagName("channel");
  for (let i = 0; i < channelElements.length; i++) {
    const channelEl = channelElements[i];
    const id = channelEl.getAttribute("id") || "";
    
    // Get display-name element
    const displayNameEl = channelEl.getElementsByTagName("display-name")[0];
    const name = displayNameEl ? displayNameEl.textContent || id : id;
    
    // Get icon if available
    const iconEl = channelEl.getElementsByTagName("icon")[0];
    const icon = iconEl ? iconEl.getAttribute("src") || undefined : undefined;
    
    channels.push({
      id,
      name,
      icon,
      programs: []
    });
  }
  
  // Parse programs
  const programElements = xmlDoc.getElementsByTagName("programme");
  let minStart = Infinity;
  let maxEnd = 0;
  
  for (let i = 0; i < programElements.length; i++) {
    const programEl = programElements[i];
    
    const channelId = programEl.getAttribute("channel") || "";
    const start = parseXMLTVDate(programEl.getAttribute("start") || "");
    const stop = parseXMLTVDate(programEl.getAttribute("stop") || "");
    
    // Update min/max times
    minStart = Math.min(minStart, start);
    maxEnd = Math.max(maxEnd, stop);
    
    // Get title
    const titleEl = programEl.getElementsByTagName("title")[0];
    const title = titleEl ? titleEl.textContent || "Unknown Program" : "Unknown Program";
    
    // Get description
    const descEl = programEl.getElementsByTagName("desc")[0];
    const description = descEl ? descEl.textContent || undefined : undefined;
    
    // Get category
    const categoryEl = programEl.getElementsByTagName("category")[0];
    const category = categoryEl ? categoryEl.textContent || undefined : undefined;
    
    // Get rating
    const ratingEl = programEl.getElementsByTagName("rating")[0];
    const rating = ratingEl ? 
      (ratingEl.getElementsByTagName("value")[0]?.textContent || undefined) : undefined;
    
    // Get icon
    const iconEl = programEl.getElementsByTagName("icon")[0];
    const icon = iconEl ? iconEl.getAttribute("src") || undefined : undefined;
    
    programs.push({
      id: `${channelId}-${start}-${stop}`,
      title,
      description,
      start,
      stop,
      channelId,
      category,
      rating,
      icon
    });
  }
  
  // Set default times if no programs were found
  if (minStart === Infinity) {
    minStart = Date.now();
    maxEnd = minStart + 24 * 60 * 60 * 1000; // 24 hours from now
  }
  
  // Assign programs to their respective channels
  for (const program of programs) {
    const channelIndex = channels.findIndex(ch => ch.id === program.channelId);
    if (channelIndex !== -1) {
      channels[channelIndex].programs.push(program);
    }
  }
  
  // Sort programs by start time for each channel
  for (const channel of channels) {
    channel.programs.sort((a, b) => a.start - b.start);
  }
  
  return {
    channels,
    startTime: minStart,
    endTime: maxEnd
  };
};

// Function to fetch and parse EPG from URL
export const fetchEPGData = async (xmltvUrl: string): Promise<EPGData> => {
  try {
    const response = await fetch(xmltvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch EPG data: ${response.status}`);
    }
    
    const xmlContent = await response.text();
    return parseXMLTV(xmlContent);
  } catch (error) {
    console.error("Error fetching EPG data:", error);
    throw error;
  }
};

// Function to match EPG channels with our playlist channels
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

// Generate time slots for the EPG grid
export const generateTimeSlots = (
  startTime: number,
  endTime: number,
  intervalMinutes: number = 30
): { slots: TimeSlot[], pixelsPerMinute: number } => {
  const slots = [];
  const intervalMs = intervalMinutes * 60 * 1000;
  const totalMinutes = (endTime - startTime) / (60 * 1000);
  const pixelsPerMinute = 5; // 5px per minute
  
  // Round start time down to nearest intervalMinutes
  const roundedStart = Math.floor(startTime / intervalMs) * intervalMs;
  
  // Create slots
  for (let time = roundedStart; time < endTime; time += intervalMs) {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    slots.push({
      start: time,
      end: time + intervalMs,
      label: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    });
  }
  
  return { slots, pixelsPerMinute };
};

// Get current time position for progress bars
export const getCurrentTimePosition = (
  startTime: number,
  pixelsPerMinute: number
): number => {
  const now = Date.now();
  const minutesSinceStart = (now - startTime) / (60 * 1000);
  return minutesSinceStart * pixelsPerMinute;
};

// Calculate program width based on duration
export const calculateProgramWidth = (
  start: number,
  end: number,
  pixelsPerMinute: number
): number => {
  const durationMinutes = (end - start) / (60 * 1000);
  return Math.max(durationMinutes * pixelsPerMinute, 50); // Minimum width of 50px
};

// Store and retrieve XMLTV URL from local storage
export const storeEPGUrl = (url: string): void => {
  localStorage.setItem('steadystream_epg_url', url);
};

export const getStoredEPGUrl = (): string | null => {
  return localStorage.getItem('steadystream_epg_url');
};
