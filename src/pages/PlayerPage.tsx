import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylist } from '../hooks/usePlaylist';
import { Button } from '../components/ui/button';
import { Play, Pause, Maximize, Minimize, ChevronLeft, Volume2, VolumeX, Heart } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { Channel } from '../types/playlist';
import { useEPG } from '../hooks/useEPG';
import { Program } from '../types/epg';

const PlayerPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { getChannel, playlist } = usePlaylist();
  const navigate = useNavigate();
  
  // State
  const [channel, setChannel] = useState<Channel | undefined>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  
  // Get EPG data for current program information
  const { epgData } = useEPG({
    autoLoad: true,
    channels: playlist?.channels || []
  });
  
  // Effects
  useEffect(() => {
    if (!channelId) {
      navigate('/channels');
      return;
    }
    
    const channelData = getChannel(channelId);
    if (!channelData) {
      toast({
        variant: "destructive",
        title: "Channel not found",
        description: "The requested channel could not be found.",
      });
      navigate('/channels');
      return;
    }
    
    setChannel(channelData);
    
    // Check if this channel is in favorites
    const storedFavorites = localStorage.getItem('steadystream_favorite_channels');
    const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    setIsFavorite(favorites.includes(channelId));
    
    // Find current program from EPG data
    updateCurrentProgram(channelData);
  }, [channelId, getChannel, navigate, epgData]);
  
  // Update current program periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (channel) {
        updateCurrentProgram(channel);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [channel, epgData]);
  
  // Function to find the current program for this channel
  const updateCurrentProgram = (channel: Channel) => {
    if (!epgData) return;
    
    const now = Date.now();
    const channelEpg = epgData.channels.find(epgChannel => {
      // Try matching by epgChannelId if available
      if (channel.epgChannelId && epgChannel.id === channel.epgChannelId) {
        return true;
      }
      
      // Try matching by name (case-insensitive)
      const normalizedChannelName = channel.name.toLowerCase().replace(/\s+/g, '');
      const normalizedEpgName = epgChannel.name.toLowerCase().replace(/\s+/g, '');
      
      return normalizedChannelName === normalizedEpgName;
    });
    
    if (channelEpg) {
      const program = channelEpg.programs.find(p => p.start <= now && p.stop > now);
      setCurrentProgram(program || null);
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = () => {
    if (!channelId) return;
    
    const storedFavorites = localStorage.getItem('steadystream_favorite_channels');
    const favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
    
    let newFavorites: string[];
    if (isFavorite) {
      // Remove from favorites
      newFavorites = favorites.filter((id: string) => id !== channelId);
      toast({
        title: "Removed from favorites",
        description: `${channel?.name || 'Channel'} removed from your favorites`,
      });
    } else {
      // Add to favorites
      newFavorites = [...favorites, channelId];
      toast({
        title: "Added to favorites",
        description: `${channel?.name || 'Channel'} added to your favorites`,
      });
    }
    
    localStorage.setItem('steadystream_favorite_channels', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };
  
  // Auto-hide controls after inactivity
  useEffect(() => {
    const showControlsTemporarily = () => {
      setControlsVisible(true);
      
      // Clear any existing timeout
      if (controlsTimeoutRef.current !== null) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
      
      // Set a new timeout to hide controls
      controlsTimeoutRef.current = window.setTimeout(() => {
        if (isPlaying) {
          setControlsVisible(false);
        }
      }, 3000);
    };
    
    const handleMouseMove = () => showControlsTemporarily();
    const handleTouchStart = () => showControlsTemporarily();
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchstart', handleTouchStart);
    
    // Initial show
    showControlsTemporarily();
    
    return () => {
      // Clean up
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleTouchStart);
      
      if (controlsTimeoutRef.current !== null) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play().catch(e => {
        console.error("Error playing video:", e);
        setError("Could not play video. Please try again.");
      });
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
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
  
  // Track fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };
  
  // Handle video error
  const handleError = () => {
    setError("Failed to load video stream. Please check your connection or try another channel.");
    setIsPlaying(false);
  };
  
  // Return to channels list
  const goBack = () => {
    navigate('/channels');
  };
  
  // Store last watched channel
  useEffect(() => {
    if (channel) {
      localStorage.setItem('steadystream_last_watched', channelId || '');
    }
  }, [channel, channelId]);
  
  if (!channel) {
    return (
      <div className="min-h-screen bg-steadystream-black flex items-center justify-center">
        <div className="text-steadystream-gold">Loading channel...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-steadystream-black flex flex-col">
      {/* Video Player */}
      <div 
        ref={playerContainerRef} 
        className="relative flex-1 bg-black"
        onClick={togglePlayPause}
      >
        <video
          ref={videoRef}
          src={channel.url}
          className="w-full h-full object-contain"
          autoPlay
          playsInline
          onError={handleError}
        />
        
        {/* Error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
            <div className="text-center p-4">
              <p className="text-steadystream-gold-light mb-4">{error}</p>
              <Button 
                onClick={goBack}
                className="bg-gold-gradient hover:bg-gold-gradient-hover text-black"
              >
                Return to Channels
              </Button>
            </div>
          </div>
        )}
        
        {/* Program info overlay */}
        {currentProgram && controlsVisible && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="text-steadystream-gold opacity-90 text-sm">
              Now Playing:
              <span className="font-medium text-white ml-2">{currentProgram.title}</span>
            </div>
            <div className="text-xs text-steadystream-secondary mt-1">
              {new Date(currentProgram.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {new Date(currentProgram.stop).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {currentProgram.category && <span className="ml-2">• {currentProgram.category}</span>}
            </div>
          </div>
        )}
        
        {/* Video Controls */}
        <div 
          className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/50 via-transparent to-black/50 transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Top Bar */}
          <div className="p-4 flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={goBack}
              className="text-white hover:bg-black/30"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="ml-2">
              <h1 className="text-white text-lg font-medium">{channel.name}</h1>
            </div>
            
            <div className="flex-1"></div>
            
            {/* Favorite button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className={`text-white hover:bg-black/30 transition-colors duration-300 ${
                isFavorite ? 'text-steadystream-gold' : ''
              }`}
            >
              <Heart className={`h-6 w-6 ${isFavorite ? 'fill-steadystream-gold' : ''}`} />
            </Button>
          </div>
          
          {/* Bottom Controls */}
          <div className="p-4 flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={togglePlayPause}
              className="text-white hover:bg-black/30"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMute}
              className="text-white hover:bg-black/30"
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
            
            <div className="flex-1" />
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-black/30"
            >
              {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
