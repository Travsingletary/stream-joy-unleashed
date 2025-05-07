
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaylist } from '../hooks/usePlaylist';
import { Channel, Group } from '../types/playlist';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Tv, Search, List } from 'lucide-react';
import { getPlaylistFromStorage } from '../services/playlistService';

const ChannelsPage: React.FC = () => {
  const navigate = useNavigate();
  const { playlist, isLoading } = usePlaylist();
  const [search, setSearch] = useState('');
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  
  // Check if playlist is loaded
  useEffect(() => {
    // If there's no playlist, try loading from storage
    if (!playlist && !isLoading) {
      const storedPlaylist = getPlaylistFromStorage();
      
      // If still no playlist, redirect to login
      if (!storedPlaylist) {
        navigate('/login');
      }
    }
  }, [playlist, isLoading, navigate]);
  
  // Filter channels based on search
  useEffect(() => {
    if (!playlist) return;
    
    if (!search) {
      setFilteredChannels(playlist.channels);
      return;
    }
    
    const searchLower = search.toLowerCase();
    const filtered = playlist.channels.filter(channel => 
      channel.name.toLowerCase().includes(searchLower)
    );
    
    setFilteredChannels(filtered);
  }, [search, playlist]);
  
  // Navigate to player
  const openChannel = (channel: Channel) => {
    navigate(`/player/${channel.id}`);
  };
  
  if (!playlist) {
    return (
      <div className="min-h-screen bg-steadystream-black flex items-center justify-center">
        <Card className="p-4 bg-black border-steadystream-gold/20 text-steadystream-gold">
          Loading channels...
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-steadystream-black">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-steadystream-gold">Channels</h1>
            <p className="text-steadystream-secondary text-sm">
              {playlist.channels.length} channels available
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-steadystream-gold/30 text-steadystream-gold"
              onClick={() => navigate('/epg')}
            >
              <List className="mr-2 h-4 w-4" />
              EPG
            </Button>
            
            <Button 
              variant="outline" 
              className="border-steadystream-gold/30 text-steadystream-gold"
              onClick={() => navigate('/login')}
            >
              Change Source
            </Button>
          </div>
        </header>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-steadystream-gold/50" />
            <Input
              className="pl-10 bg-steadystream-black border-steadystream-gold/30 text-white"
              placeholder="Search channels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 bg-steadystream-black border border-steadystream-gold/30 overflow-x-auto flex flex-nowrap pb-1 steadystream-scrollbar">
            <TabsTrigger value="all" className="whitespace-nowrap">
              All Channels
            </TabsTrigger>
            
            {playlist.groups.map(group => (
              <TabsTrigger key={group.id} value={group.id} className="whitespace-nowrap">
                {group.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredChannels.map(channel => (
                <ChannelCard 
                  key={channel.id} 
                  channel={channel} 
                  onClick={() => openChannel(channel)}
                />
              ))}
            </div>
            
            {filteredChannels.length === 0 && (
              <div className="text-center py-12 text-steadystream-secondary">
                No channels found matching your search.
              </div>
            )}
          </TabsContent>
          
          {playlist.groups.map(group => (
            <TabsContent key={group.id} value={group.id} className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {group.channels
                  .filter(channel => channel.name.toLowerCase().includes(search.toLowerCase()))
                  .map(channel => (
                    <ChannelCard 
                      key={channel.id} 
                      channel={channel} 
                      onClick={() => openChannel(channel)}
                    />
                  ))
                }
              </div>
              
              {group.channels.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                <div className="text-center py-12 text-steadystream-secondary">
                  No channels found in this group matching your search.
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

interface ChannelCardProps {
  channel: Channel;
  onClick: () => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick }) => {
  return (
    <div 
      className="bg-black border border-steadystream-gold/20 rounded-lg overflow-hidden cursor-pointer hover:border-steadystream-gold/50 transition-all"
      onClick={onClick}
    >
      <div className="aspect-video flex items-center justify-center bg-steadystream-black/50 overflow-hidden">
        {channel.logo ? (
          <img 
            src={channel.logo} 
            alt={channel.name} 
            className="w-full h-full object-contain p-2"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv className="h-10 w-10 text-steadystream-gold/70" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-steadystream-gold font-medium text-sm truncate">
          {channel.name}
        </h3>
      </div>
    </div>
  );
};

export default ChannelsPage;
