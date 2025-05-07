
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylist } from '../hooks/usePlaylist';
import { useEPG } from '../hooks/useEPG';
import { Program } from '../types/epg';
import { useProfiles } from '../hooks/useProfiles';
import { Channel } from '../types/playlist';
import { toast } from '@/hooks/use-toast';
import { useWatchHistory } from '@/hooks/useWatchHistory';
import VideoPlayer from '@/components/player/VideoPlayer';
import PlayerControls from '@/components/player/PlayerControls';
import ProgramInfo from '@/components/player/ProgramInfo';

const PlayerPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { playlist } = usePlaylist();
  const { epgData, isLoading: epgLoading } = useEPG();
  const { currentProfile, updateProfile } = useProfiles();
  const navigate = useNavigate();
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use the watch history hook
  useWatchHistory(channel);
  
  // Load channel data
  useEffect(() => {
    if (!playlist || !channelId) return;
    
    const foundChannel = playlist.channels.find(ch => ch.id === channelId);
    if (foundChannel) {
      setChannel(foundChannel);
      
      // Check if channel is in favorites
      if (currentProfile) {
        setIsFavorite(currentProfile.favorites.includes(channelId));
      }
      
      document.title = `Steadystream - ${foundChannel.name}`;
    } else {
      toast({
        variant: "destructive",
        title: "Channel not found",
        description: "The channel you're looking for doesn't exist.",
      });
      navigate('/channels');
    }
    
    return () => {
      document.title = 'Steadystream';
    };
  }, [playlist, channelId, currentProfile]);
  
  // Update EPG program info
  useEffect(() => {
    if (!epgLoading && epgData && channel) {
      updateCurrentProgram();
      
      // Set interval to update program info every minute
      const intervalId = setInterval(updateCurrentProgram, 60000);
      return () => clearInterval(intervalId);
    }
  }, [epgLoading, epgData, channel]);
  
  const updateCurrentProgram = () => {
    if (!epgData || !channel) return;
    
    const now = Date.now();
    const channelEpg = epgData.channels.find(epgChannel => {
      // Try matching by epgChannelId if available
      if (channel.epgChannelId && epgChannel.id === channel.epgChannelId) {
        return true;
      }
      
      // Try matching by name
      const channelName = channel.name.toLowerCase().replace(/\s+/g, '');
      const epgChannelName = epgChannel.name.toLowerCase().replace(/\s+/g, '');
      return channelName.includes(epgChannelName) || epgChannelName.includes(channelName);
    });
    
    if (!channelEpg) {
      setCurrentProgram(null);
      return;
    }
    
    // Find current program
    const currentProg = channelEpg.programs.find(
      program => program.start <= now && (program.end || program.stop) > now
    );
    
    setCurrentProgram(currentProg || null);
  };
  
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        toast({
          variant: "destructive",
          title: "Fullscreen error",
          description: `Error attempting to enable fullscreen: ${err.message}`,
        });
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  const handleFavoriteToggle = () => {
    if (!channel || !currentProfile) return;
    
    let updatedFavorites = [...currentProfile.favorites];
    
    if (isFavorite) {
      // Remove from favorites
      updatedFavorites = updatedFavorites.filter(id => id !== channelId);
      toast({
        title: "Removed from favorites",
        description: `${channel.name} has been removed from your favorites.`,
      });
    } else {
      // Add to favorites
      updatedFavorites.push(channelId!);
      toast({
        title: "Added to favorites",
        description: `${channel.name} has been added to your favorites.`,
      });
    }
    
    updateProfile({
      ...currentProfile,
      favorites: updatedFavorites
    });
    
    setIsFavorite(!isFavorite);
  };
  
  if (!channel) {
    return (
      <div className="min-h-screen bg-steadystream-black flex items-center justify-center">
        <div className="text-steadystream-gold">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-steadystream-black flex flex-col">
      {/* Video Player */}
      <div 
        ref={containerRef}
        className="relative w-full flex-1 bg-black flex items-center justify-center"
      >
        <VideoPlayer 
          url={channel.url}
          isMuted={isMuted}
          isPlaying={isPlaying}
          onPlayStateChange={setIsPlaying}
        />
        
        {/* Control Overlay */}
        <PlayerControls
          isMuted={isMuted}
          isPlaying={isPlaying}
          isFavorite={isFavorite}
          isFullscreen={isFullscreen}
          onMuteToggle={handleMuteToggle}
          onPlayPause={handlePlayPause}
          onFullscreenToggle={handleFullscreenToggle}
          onFavoriteToggle={handleFavoriteToggle}
          channelName={channel.name}
        />
      </div>
      
      {/* Program Info */}
      <ProgramInfo 
        currentProgram={currentProgram} 
        channel={channel}
      />
    </div>
  );
};

export default PlayerPage;
