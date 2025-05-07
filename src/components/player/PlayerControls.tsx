
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Volume2, VolumeX, Maximize, Pause, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlayerControlsProps {
  isMuted: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  isFullscreen: boolean;
  onMuteToggle: () => void;
  onPlayPause: () => void;
  onFullscreenToggle: () => void;
  onFavoriteToggle: () => void;
  channelName: string;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isMuted,
  isPlaying,
  isFavorite,
  isFullscreen,
  onMuteToggle,
  onPlayPause,
  onFullscreenToggle,
  onFavoriteToggle,
  channelName
}) => {
  const navigate = useNavigate();

  return (
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
          onClick={onPlayPause}
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
            onClick={onMuteToggle}
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
            onClick={onFavoriteToggle}
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
          onClick={onFullscreenToggle}
        >
          <Maximize className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default PlayerControls;
