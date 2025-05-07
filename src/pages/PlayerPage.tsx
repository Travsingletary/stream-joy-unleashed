import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylist } from '../hooks/usePlaylist';
import { useEPG } from '../hooks/useEPG';
import { Program } from '../types/epg';
import { useProfiles } from '../hooks/useProfiles';
import { Channel } from '../types/playlist';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Volume2, VolumeX, Maximize, Pause, Play } from 'lucide-react';

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
  const [watchStartTime, setWatchStartTime] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!playlist || !channelId) return;
    
    const foundChannel = playlist.channels.find(ch => ch.id === channelId);
    if (foundChannel) {
      setChannel(foundChannel);
      
      // Check if channel is in favorites
      if (currentProfile) {
        setIsFavorite(currentProfile.favorites.includes(channelId));
      }
      
      // Update last watched
      if (currentProfile) {
        updateProfile({
          ...currentProfile,
          lastWatched: channelId
        });
      }
      
      // Start tracking watch time
      setWatchStartTime(Date.now());
      
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
      // Record watch time when leaving
      if (channel && currentProfile && watchStartTime > 0) {
        recordWatchHistory();
      }
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
      program => program.start <= now && program.end > now
    );
    
    setCurrentProgram(currentProg || null);
  };
  
  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };
  
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
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
  
  const recordWatchHistory = () => {
    if (!channel || !currentProfile || watchStartTime === 0) return;
    
    const watchDuration = (Date.now() - watchStartTime) / 1000; // in seconds
    if (watchDuration < 5) return; // Don't record very short views
    
    // Determine time of day
    const hour = new Date().getHours();
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
    else if (hour >= 22 || hour < 5) timeOfDay = 'night';
    
    const watchHistoryItem = {
      channelId: channel.id,
      name: channel.name,
      logo: channel.logo,
      timestamp: watchStartTime,
      watchDuration,
      category: channel.group,
      genre: channel.group,
      timeOfDay
    };
    
    const updatedProfile = {
      ...currentProfile,
      watchHistory: [...currentProfile.watchHistory, watchHistoryItem]
    };
    
    // Keep only the last 50 watch history items
    if (updatedProfile.watchHistory.length > 50) {
      updatedProfile.watchHistory = updatedProfile.watchHistory.slice(-50);
    }
    
    updateProfile(updatedProfile);
  };
  
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
        <video
          ref={videoRef}
          src={channel.url}
          className="max-h-full max-w-full"
          controls={false}
          autoPlay
          muted={isMuted}
        />
        
        {/* Control Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col">
          {/* Back button and channel name */}
          <div className="p-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-black/30"
              onClick={() => navigate('/channels')}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Channels
            </Button>
          </div>
          
          {/* Center play/pause button */}
          <div className="flex-1 flex items-center justify-center">
            <Button 
              size="lg" 
              variant="ghost" 
              className="rounded-full bg-black/30 h-20 w-20 hover:bg-black/50"
              onClick={handlePlayPause}
            >
              {isPlaying ? 
                <Pause className="h-10 w-10 text-white" /> : 
                <Play className="h-10 w-10 text-white" />
              }
            </Button>
          </div>
          
          {/* Bottom controls */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-black/30"
                onClick={handleMuteToggle}
              >
                {isMuted ? 
                  <VolumeX className="h-5 w-5" /> : 
                  <Volume2 className="h-5 w-5" />
                }
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-white hover:bg-black/30 ${isFavorite ? 'text-steadystream-gold' : ''}`}
                onClick={handleFavoriteToggle}
              >
                <Heart 
                  className="h-5 w-5" 
                  fill={isFavorite ? 'currentColor' : 'none'} 
                />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-black/30"
              onClick={handleFullscreenToggle}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Program Info */}
      {currentProgram && (
        <Card className="bg-black border-t border-steadystream-gold/20 rounded-none">
          <div className="p-3 flex items-center justify-between">
            <div>
              <h3 className="text-steadystream-gold-light font-medium text-lg">
                {currentProgram.title}
              </h3>
              <p className="text-steadystream-secondary text-sm">
                {new Date(currentProgram.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {' - '}
                {new Date(currentProgram.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {currentProgram.category ? ` • ${currentProgram.category}` : ''}
              </p>
            </div>
            <div className="text-right">
              <h4 className="text-steadystream-gold-light">{channel.name}</h4>
              {channel.group && (
                <p className="text-steadystream-secondary text-sm">{channel.group}</p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PlayerPage;
