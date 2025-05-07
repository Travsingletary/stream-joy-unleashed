
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaylist } from '../hooks/usePlaylist';
import { Channel } from '../types/playlist';
import { useProfiles } from '../hooks/useProfiles';
import { RecommendationCarousel } from '../components/recommendations/RecommendationCarousel';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Search, Heart, ChevronRight, ArrowLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ChannelsPage: React.FC = () => {
  const { playlist, isLoading } = usePlaylist();
  const { currentProfile, profiles, switchProfile } = useProfiles();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  
  useEffect(() => {
    if (playlist && playlist.channels) {
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(
          playlist.channels
            .map(channel => channel.group)
            .filter(Boolean)
        )
      ).sort() as string[];
      
      setCategories(uniqueCategories);
    }
  }, [playlist]);
  
  useEffect(() => {
    if (!playlist || !playlist.channels) {
      setFilteredChannels([]);
      return;
    }
    
    let result = [...playlist.channels];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(channel => 
        channel.name.toLowerCase().includes(query) ||
        (channel.group && channel.group.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(channel => channel.group === selectedCategory);
    }
    
    // Filter by favorites
    if (filterMode === 'favorites' && currentProfile) {
      result = result.filter(channel => 
        currentProfile.favorites.includes(channel.id)
      );
    }
    
    setFilteredChannels(result);
  }, [playlist, searchQuery, selectedCategory, filterMode, currentProfile]);
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-steadystream-black flex items-center justify-center">
        <div className="text-steadystream-gold">Loading channels...</div>
      </div>
    );
  }
  
  if (!playlist || !playlist.channels || playlist.channels.length === 0) {
    return (
      <div className="min-h-screen bg-steadystream-black flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl text-steadystream-gold mb-4">No Channels Found</h2>
        <p className="text-steadystream-secondary mb-6">
          Please connect to a service to view available channels.
        </p>
        <Button 
          onClick={() => navigate('/login')} 
          className="bg-gold-gradient hover:bg-gold-gradient-hover text-black"
        >
          Connect a Service
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-steadystream-black">
      {/* Header with profile selector */}
      <header className="p-4 border-b border-steadystream-gold/20 sticky top-0 bg-steadystream-black z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="border-steadystream-gold/30 text-steadystream-gold hover:bg-steadystream-gold/10"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Home
          </Button>
          
          <h1 className="text-xl font-bold text-steadystream-gold">Channels</h1>
          
          {currentProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 hover:bg-steadystream-gold/10 border border-steadystream-gold/20 rounded-full pr-2"
                >
                  <Avatar className="h-7 w-7">
                    {currentProfile.avatar ? (
                      <AvatarImage src={currentProfile.avatar} alt={currentProfile.name} />
                    ) : (
                      <AvatarFallback className="bg-steadystream-gold/20 text-steadystream-gold text-xs">
                        {getInitials(currentProfile.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-steadystream-gold-light text-sm">{currentProfile.name}</span>
                  <ChevronRight className="h-4 w-4 text-steadystream-gold-light" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black border-steadystream-gold/20">
                <DropdownMenuLabel className="text-steadystream-gold-light">Profiles</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-steadystream-gold/10" />
                {profiles.map(profile => (
                  <DropdownMenuItem 
                    key={profile.id}
                    className={`flex items-center gap-2 ${profile.id === currentProfile.id ? 'bg-steadystream-gold/10' : ''}`}
                    onClick={() => switchProfile(profile.id)}
                  >
                    <Avatar className="h-6 w-6">
                      {profile.avatar ? (
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                      ) : (
                        <AvatarFallback className="bg-steadystream-gold/20 text-steadystream-gold text-xs">
                          {getInitials(profile.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-steadystream-gold-light">{profile.name}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-steadystream-gold/10" />
                <DropdownMenuItem 
                  className="text-steadystream-gold" 
                  onClick={() => navigate('/profiles')}
                >
                  Manage Profiles
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      
      <div className="container mx-auto p-4">
        {/* Recommendations */}
        {currentProfile && playlist.channels && (
          <RecommendationCarousel channels={playlist.channels} />
        )}
        
        {/* Filters */}
        <div className="my-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-steadystream-secondary h-4 w-4" />
              <Input
                type="text"
                placeholder="Search channels..."
                className="pl-8 bg-steadystream-black border-steadystream-gold/30 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-steadystream-black border-steadystream-gold/30 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-black border-steadystream-gold/20">
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex rounded-md overflow-hidden border border-steadystream-gold/30">
              <Button
                variant={filterMode === 'all' ? 'default' : 'outline'}
                className={filterMode === 'all' 
                  ? 'bg-gold-gradient text-black rounded-none flex-1' 
                  : 'bg-transparent text-steadystream-secondary hover:bg-steadystream-gold/10 rounded-none border-0 flex-1'
                }
                onClick={() => setFilterMode('all')}
              >
                All
              </Button>
              <Button
                variant={filterMode === 'favorites' ? 'default' : 'outline'}
                className={filterMode === 'favorites' 
                  ? 'bg-gold-gradient text-black rounded-none flex-1' 
                  : 'bg-transparent text-steadystream-secondary hover:bg-steadystream-gold/10 rounded-none border-0 flex-1'
                }
                onClick={() => setFilterMode('favorites')}
              >
                <Heart className="h-4 w-4 mr-1" /> Favorites
              </Button>
            </div>
          </div>
        </div>
        
        {/* Channel Grid */}
        {filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredChannels.map((channel) => {
              const isFavorite = currentProfile?.favorites.includes(channel.id);
              
              return (
                <Card 
                  key={channel.id} 
                  className="bg-black border-steadystream-gold/20 hover:gold-glow transition-shadow duration-300"
                >
                  <CardHeader className="pb-0">
                    {channel.group && (
                      <p className="text-xs text-steadystream-secondary">{channel.group}</p>
                    )}
                    <CardTitle className="text-steadystream-gold-light truncate text-lg">
                      {channel.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center p-4">
                    <div className="w-full aspect-video bg-steadystream-black/50 rounded flex items-center justify-center overflow-hidden">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="text-steadystream-gold/30 text-sm">No Logo</div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black"
                      onClick={() => navigate(`/player/${channel.id}`)}
                    >
                      <Play className="h-4 w-4 mr-1" /> Watch
                    </Button>
                  </CardFooter>
                  {isFavorite && (
                    <div className="absolute top-2 right-2">
                      <Heart className="h-4 w-4 text-steadystream-gold fill-steadystream-gold" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-steadystream-gold-light text-lg">No channels found</h3>
            <p className="text-steadystream-secondary mt-2">
              {filterMode === 'favorites' 
                ? "You don't have any favorites yet. Add some channels to your favorites!" 
                : "No channels match your search criteria. Try adjusting your filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelsPage;
