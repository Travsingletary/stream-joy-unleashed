
import { EPGData } from "../../types/epg";
import { parseXMLTV } from "./xmltvParser";

/**
 * Function to fetch and parse EPG from URL
 */
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
