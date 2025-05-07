
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylist } from '../hooks/usePlaylist';
import { Button } from '../components/ui/button';
import { Play, Pause, Maximize, Minimize, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { Channel } from '../types/playlist';

const PlayerPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { getChannel } = usePlaylist();
  const navigate = useNavigate();
  
  // State
  const [channel, setChannel] = useState<Channel | undefined>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  
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
  }, [channelId, getChannel, navigate]);
  
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
