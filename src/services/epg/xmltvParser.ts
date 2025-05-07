
import { EPGData, EPGChannel, Program } from "../../types/epg";
import { parseXML, parseXMLTVDate } from "./xmlParser";

/**
 * Function to parse XMLTV data
 */
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
      end: stop, // Ensure end is also set for backward compatibility
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
