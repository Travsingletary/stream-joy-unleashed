
import { useState, useEffect } from 'react';
import { EPGData } from '../types/epg';
import { 
  fetchEPGData,
  getStoredEPGUrl,
  storeEPGUrl,
  matchChannelsWithEPG
} from '../services/epgService';
import { toast } from '../hooks/use-toast';

interface UseEPGOptions {
  autoLoad?: boolean;
  channels?: any[];
}

export const useEPG = (options: UseEPGOptions = {}) => {
  const [epgData, setEPGData] = useState<EPGData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [epgUrl, setEPGUrl] = useState<string>(getStoredEPGUrl() || '');
  
  const loadEPGData = async (url: string) => {
    if (!url) {
      setError('Please provide a valid XMLTV URL');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Save the URL to localStorage
      storeEPGUrl(url);
      setEPGUrl(url);
      
      // Fetch and parse the EPG data
      const data = await fetchEPGData(url);
      
      // If channels are provided, match them with EPG data
      if (options.channels && options.channels.length > 0) {
        const matchedData = matchChannelsWithEPG(data, options.channels);
        setEPGData(matchedData);
      } else {
        setEPGData(data);
      }
      
      toast({
        title: "EPG data loaded",
        description: `Successfully loaded program data for ${data.channels.length} channels`,
      });
    } catch (err) {
      console.error('Failed to load EPG data:', err);
      setError('Failed to load EPG data. Please check the URL and try again.');
      toast({
        variant: "destructive",
        title: "EPG load failed",
        description: "Could not load program guide data from the provided URL",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Auto-load EPG data if URL is available and autoLoad is true
  useEffect(() => {
    if (options.autoLoad && epgUrl) {
      loadEPGData(epgUrl);
    }
  }, [options.autoLoad, options.channels]);
  
  // Re-match channels when they change
  useEffect(() => {
    if (epgData && options.channels && options.channels.length > 0) {
      const matchedData = matchChannelsWithEPG(epgData, options.channels);
      setEPGData(matchedData);
    }
  }, [options.channels]);
  
  return {
    epgData,
    isLoading,
    error,
    epgUrl,
    setEPGUrl,
    loadEPGData
  };
};
