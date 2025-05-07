
// Main export file for EPG service
import { fetchEPGData } from './epg/epgFetcher';
import { matchChannelsWithEPG } from './epg/channelMatching';
import { parseXMLTV } from './epg/xmltvParser';
import { generateTimeSlots, getCurrentTimePosition, calculateProgramWidth } from './epg/timeUtils';
import { storeEPGUrl, getStoredEPGUrl } from './epg/storage';
import { parseXML, parseXMLTVDate } from './epg/xmlParser';

// Re-export all services
export {
  fetchEPGData,
  matchChannelsWithEPG,
  parseXMLTV,
  generateTimeSlots,
  getCurrentTimePosition,
  calculateProgramWidth,
  storeEPGUrl,
  getStoredEPGUrl,
  parseXML,
  parseXMLTVDate
};
