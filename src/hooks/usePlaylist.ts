
import { useState, useEffect } from 'react';
import { Channel, Group, Playlist, XtreamCredentials } from '../types/playlist';
import { 
  loadM3UPlaylist, 
  loadXtreamPlaylist, 
  getPlaylistFromStorage,
  savePlaylistToStorage,
  saveXtreamCredentials,
  saveM3UUrl
} from '../services/playlistService';
import { toast } from '../hooks/use-toast';

interface UsePlaylistReturn {
  playlist: Playlist | null;
  isLoading: boolean;
  error: string | null;
  loadM3U: (url: string) => Promise<void>;
  loadXtream: (credentials: XtreamCredentials) => Promise<void>;
  getChannel: (channelId: string) => Channel | undefined;
}

export const usePlaylist = (): UsePlaylistReturn => {
  const [playlist, setPlaylist] = useState<Playlist | null>(getPlaylistFromStorage());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadM3U = async (url: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await loadM3UPlaylist(url);
      setPlaylist(data);
      savePlaylistToStorage(data);
      saveM3UUrl(url);
      
      toast({
        title: "Playlist loaded",
        description: `Successfully loaded ${data.channels.length} channels`,
      });
      
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load M3U playlist';
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Failed to load playlist",
        description: errorMessage,
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadXtream = async (credentials: XtreamCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await loadXtreamPlaylist(credentials);
      setPlaylist(data);
      savePlaylistToStorage(data);
      saveXtreamCredentials(credentials);
      
      toast({
        title: "Xtream playlist loaded",
        description: `Successfully loaded ${data.channels.length} channels`,
      });
      
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load Xtream playlist';
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Failed to load playlist",
        description: errorMessage,
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getChannel = (channelId: string): Channel | undefined => {
    return playlist?.channels.find(ch => ch.id === channelId);
  };

  return {
    playlist,
    isLoading,
    error,
    loadM3U,
    loadXtream,
    getChannel
  };
};
