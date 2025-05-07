
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEPG } from '../hooks/useEPG';
import EPGGrid from '../components/epg/EPGGrid';
import EPGSetup from '../components/epg/EPGSetup';
import { Button } from '../components/ui/button';
import { Program } from '../types/epg';
import { getStoredEPGUrl } from '../services/epgService';
import { Progress } from '../components/ui/progress';
import { FilterIcon, ListVideo, Clock } from 'lucide-react';
import { usePlaylist } from '../hooks/usePlaylist';

// Mock data for testing - in real implementation, this would come from your channel context
const MOCK_CHANNELS = [
  {
    id: '1',
    name: 'Sample Channel 1',
    epg_channel_id: 'sample.1'
  },
  {
    id: '2',
    name: 'Sample Channel 2',
    epg_channel_id: 'sample.2'
  }
];

const EPGPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'now' | 'favorites'>('all');
  const { playlist } = usePlaylist();

  // Get the actual channels from the playlist if available
  const channels = playlist?.channels || MOCK_CHANNELS;
  
  // Retrieve favorite channels from localStorage
  const [favoriteChannels, setFavoriteChannels] = useState<string[]>(() => {
    const storedFavorites = localStorage.getItem('steadystream_favorite_channels');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
  });
  
  const {
    epgData,
    isLoading,
    error,
    epgUrl,
    loadEPGData
  } = useEPG({
    autoLoad: true,
    channels: channels
  });
  
  // Filter EPG data based on the selected filter
  const filteredEpgData = React.useMemo(() => {
    if (!epgData) return null;
    
    if (filterType === 'all') {
      return epgData;
    }
    
    if (filterType === 'now') {
      const now = Date.now();
      const channelsWithCurrentPrograms = epgData.channels.filter(channel => 
        channel.programs.some(program => program.start <= now && program.stop > now)
      );
      
      return {
        ...epgData,
        channels: channelsWithCurrentPrograms
      };
    }
    
    if (filterType === 'favorites') {
      const favoriteEpgChannels = epgData.channels.filter(channel => 
        favoriteChannels.includes(channel.id)
      );
      
      return {
        ...epgData,
        channels: favoriteEpgChannels
      };
    }
    
    return epgData;
  }, [epgData, filterType, favoriteChannels]);
  
  const handleChannelSelect = (channelId: string) => {
    // In a real implementation, navigate to the channel player or show details
    console.log(`Channel selected: ${channelId}`);
    navigate(`/player/${channelId}`);
  };
  
  const handleProgramSelect = (program: Program) => {
    setSelectedProgram(program);
    // Here you could show program details or set up recording
  };
  
  return (
    <div className="min-h-screen bg-steadystream-black p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-steadystream-gold">
            Program Guide
          </h1>
          <Button 
            onClick={() => navigate('/channels')}
            variant="outline"
            className="border-steadystream-gold/30 text-steadystream-gold hover:bg-steadystream-gold/10"
          >
            Back to Channels
          </Button>
        </div>
        
        {/* EPG Configuration */}
        <div className="mb-6">
          <EPGSetup 
            onEPGUrlSubmit={loadEPGData}
            defaultUrl={epgUrl}
            isLoading={isLoading}
          />
        </div>

        {/* Filter Options */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className={filterType === 'all' ? 
              'bg-steadystream-gold text-black hover:bg-steadystream-gold-light' : 
              'border-steadystream-gold/30 text-steadystream-gold hover:bg-steadystream-gold/10'
            }
          >
            <ListVideo className="mr-2 h-4 w-4" />
            All Channels
          </Button>
          <Button
            variant={filterType === 'now' ? 'default' : 'outline'}
            onClick={() => setFilterType('now')}
            className={filterType === 'now' ? 
              'bg-steadystream-gold text-black hover:bg-steadystream-gold-light' : 
              'border-steadystream-gold/30 text-steadystream-gold hover:bg-steadystream-gold/10'
            }
          >
            <Clock className="mr-2 h-4 w-4" />
            Now Playing
          </Button>
          <Button
            variant={filterType === 'favorites' ? 'default' : 'outline'}
            onClick={() => setFilterType('favorites')}
            className={filterType === 'favorites' ? 
              'bg-steadystream-gold text-black hover:bg-steadystream-gold-light' : 
              'border-steadystream-gold/30 text-steadystream-gold hover:bg-steadystream-gold/10'
            }
          >
            <FilterIcon className="mr-2 h-4 w-4" />
            Favorites Only
          </Button>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Progress value={45} className="w-64 h-2" />
            <p className="text-steadystream-secondary">Loading program guide data...</p>
          </div>
        )}
        
        {/* Error state */}
        {error && (
          <div className="p-6 border border-red-500/30 bg-red-500/10 rounded-md text-red-300 mb-6">
            <p className="font-medium">Error loading EPG data</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        )}
        
        {/* No favorites message */}
        {filterType === 'favorites' && favoriteChannels.length === 0 && (
          <div className="p-6 border border-steadystream-gold/30 bg-steadystream-gold/5 rounded-md text-steadystream-gold mb-6 text-center">
            <p className="font-medium">No favorite channels yet</p>
            <p className="text-sm opacity-80 mt-2">Add favorites by clicking the star icon when watching a channel</p>
          </div>
        )}
        
        {/* EPG Grid */}
        {filteredEpgData && !isLoading && (
          <div className="h-[70vh]">
            <EPGGrid 
              epgData={filteredEpgData}
              onChannelSelect={handleChannelSelect}
              onProgramSelect={handleProgramSelect}
              className="h-full"
            />
          </div>
        )}
        
        {/* Selected program details */}
        {selectedProgram && (
          <div className="fixed bottom-4 right-4 w-80 bg-black border border-steadystream-gold/30 rounded-md shadow-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-steadystream-gold font-medium">{selectedProgram.title}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedProgram(null)}
                className="text-steadystream-secondary h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
            
            <div className="text-xs text-steadystream-secondary mb-2">
              {new Date(selectedProgram.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {new Date(selectedProgram.stop).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {selectedProgram.category && <span className="ml-2">• {selectedProgram.category}</span>}
              {selectedProgram.rating && <span className="ml-2">• Rated: {selectedProgram.rating}</span>}
            </div>
            
            <p className="text-sm text-white mb-4">
              {selectedProgram.description || "No description available"}
            </p>
            
            <Button 
              className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black font-medium"
              onClick={() => handleChannelSelect(selectedProgram.channelId)}
            >
              Watch Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EPGPage;
