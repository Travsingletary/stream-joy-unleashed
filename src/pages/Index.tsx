import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Tv, CalendarDays, LogIn, User, Play, Heart } from "lucide-react";
import { useProfiles } from "../hooks/useProfiles";
import { usePlaylist } from "../hooks/usePlaylist";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const Index = () => {
  const navigate = useNavigate();
  const {
    currentProfile,
    profiles
  } = useProfiles();
  const {
    playlist
  } = usePlaylist();
  useEffect(() => {
    // If no profiles exist yet, redirect to profile creation
    if (profiles.length === 0) {
      navigate('/profiles');
    }
  }, [profiles, navigate]);

  // Find last watched channel if any
  const lastWatchedChannel = currentProfile?.lastWatched && playlist?.channels ? playlist.channels.find(ch => ch.id === currentProfile.lastWatched) : null;
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  return <div className="min-h-screen flex flex-col items-center justify-center bg-steadystream-black p-4 sm:p-6 lg:p-8">
      {/* Logo and brand header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 sm:h-24 sm:w-24 relative overflow-hidden rounded-full gold-glow">
            <div className="absolute inset-0 bg-gold-gradient"></div>
            <div className="absolute inset-2 bg-steadystream-black rounded-full flex items-center justify-center">
              
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 sm:mt-4">
            <span className="gold-text">Steadystream</span>
          </h1>
          <p className="text-steadystream-secondary max-w-md">
            Your premium streaming experience with seamless playback and extensive channel selection
          </p>
        </div>
      </div>

      {/* Profile selection */}
      {profiles.length > 0 && <div className="w-full max-w-5xl mb-8">
          <h2 className="text-steadystream-gold-light text-xl mb-4 text-center">Who's watching?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {profiles.map(profile => <Card key={profile.id} className={`bg-black border-steadystream-gold/20 cursor-pointer hover:gold-glow transition-all duration-300 w-28 ${currentProfile?.id === profile.id ? 'border-steadystream-gold border-2' : ''}`} onClick={() => {
          const {
            switchProfile
          } = useProfiles();
          switchProfile(profile.id);
        }}>
                <CardContent className="flex flex-col items-center justify-center pt-6 pb-4">
                  <Avatar className="h-16 w-16 mb-2 border-2 border-steadystream-gold/30">
                    {profile.avatar ? <AvatarImage src={profile.avatar} alt={profile.name} /> : <AvatarFallback className="bg-steadystream-gold/20 text-steadystream-gold">
                        {getInitials(profile.name)}
                      </AvatarFallback>}
                  </Avatar>
                  <p className="text-steadystream-gold-light text-center font-medium text-sm truncate w-full">
                    {profile.name}
                  </p>
                </CardContent>
              </Card>)}
            <Card className="bg-black border-steadystream-gold/20 border-dashed cursor-pointer hover:gold-glow transition-all duration-300 w-28" onClick={() => navigate('/profiles')}>
              <CardContent className="flex flex-col items-center justify-center pt-6 pb-4">
                <Avatar className="h-16 w-16 mb-2 border-2 border-dashed border-steadystream-gold/30">
                  <AvatarFallback className="bg-transparent text-steadystream-gold/50">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <p className="text-steadystream-secondary text-center text-sm">
                  Manage
                </p>
              </CardContent>
            </Card>
          </div>
        </div>}

      {/* Continue watching card (shows only if there's a last watched channel) */}
      {lastWatchedChannel && <div className="w-full max-w-5xl mb-6">
          <Card className="bg-black border border-steadystream-gold/20 shadow-lg hover:gold-glow transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-steadystream-gold-light flex items-center gap-2">
                <Play className="h-5 w-5" /> Continue Watching
              </CardTitle>
              <CardDescription className="text-steadystream-secondary">
                Pick up where you left off
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <div className="w-20 h-20 bg-steadystream-black/50 rounded flex items-center justify-center overflow-hidden">
                {lastWatchedChannel.logo ? <img src={lastWatchedChannel.logo} alt={lastWatchedChannel.name} className="max-h-full max-w-full object-contain" onError={e => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }} /> : <Tv className="h-10 w-10 text-steadystream-gold/30" />}
              </div>
              <div className="flex-1">
                <h3 className="text-steadystream-gold-light font-medium">{lastWatchedChannel.name}</h3>
                {lastWatchedChannel.group && <p className="text-steadystream-secondary text-sm">{lastWatchedChannel.group}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black font-medium" onClick={() => navigate(`/player/${lastWatchedChannel.id}`)}>
                Continue Watching
              </Button>
            </CardFooter>
          </Card>
        </div>}

      {/* Main content */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black border border-steadystream-gold/20 shadow-lg hover:gold-glow transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-steadystream-gold-light flex items-center gap-2">
              <Tv className="h-5 w-5" /> Start Watching
            </CardTitle>
            <CardDescription className="text-steadystream-secondary">
              Browse channels and start streaming right away
            </CardDescription>
          </CardHeader>
          <CardContent className="text-white/80">
            <p>
              Access thousands of channels and on-demand content with our
              state-of-the-art streaming platform. Enjoy crisp HD quality and
              buffer-free playback on any device.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black font-medium" onClick={() => navigate("/channels")}>
              Browse Live TV
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-black border border-steadystream-gold/20 shadow-lg hover:gold-glow transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-steadystream-gold-light flex items-center gap-2">
              <CalendarDays className="h-5 w-5" /> Program Guide
            </CardTitle>
            <CardDescription className="text-steadystream-secondary">
              See what's on now and coming up next
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <p>
              View program schedules and details with our elegant program guide.
              Never miss your favorite shows with our comprehensive listings and timely reminders.
            </p>
            <div className="grid gap-3 mt-3">
              <div className="flex items-center p-2 rounded-md bg-steadystream-gold/10 border border-steadystream-gold/20">
                <div className="h-8 w-8 rounded-full bg-steadystream-gold flex items-center justify-center text-black font-bold mr-3">✓</div>
                <div>
                  <h3 className="font-medium text-steadystream-gold-light">Live Progress</h3>
                  <p className="text-xs text-white/60">See what's playing now with progress indicators</p>
                </div>
              </div>
              <div className="flex items-center p-2 rounded-md bg-steadystream-gold/10 border border-steadystream-gold/20">
                <div className="h-8 w-8 rounded-full bg-steadystream-gold flex items-center justify-center text-black font-bold mr-3">✓</div>
                <div>
                  <h3 className="font-medium text-steadystream-gold-light">Program Details</h3>
                  <p className="text-xs text-white/60">View detailed information about each program</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black font-medium" onClick={() => navigate("/epg")}>
              Open Program Guide
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Features section */}
      <div className="w-full max-w-5xl mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[{
        title: "HD Streaming",
        description: "Crystal clear quality with adaptive bitrate for smooth playback",
        icon: "🎬"
      }, {
        title: "Multi-Profile",
        description: "Create unique profiles with personalized favorites and history",
        icon: "👤"
      }, {
        title: "Global Content",
        description: "Access channels and content from around the world",
        icon: "🌍"
      }].map((feature, index) => <Card key={index} className="bg-black border border-steadystream-gold/20">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center">
                <span className="text-xl">{feature.icon}</span>
              </div>
              <CardTitle className="text-steadystream-gold-light text-lg">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/80 text-sm">
              {feature.description}
            </CardContent>
          </Card>)}
      </div>

      {/* Connect service button */}
      <div className="mt-12 mb-4">
        <Button variant="outline" className="border-steadystream-gold/30 text-steadystream-gold hover:bg-steadystream-gold/10" onClick={() => navigate("/login")}>
          <LogIn className="mr-2 h-4 w-4" /> Connect My Service
        </Button>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-steadystream-secondary text-sm">
        <p>© 2025 Steadystream • Premium Streaming Experience</p>
      </footer>
    </div>;
};
export default Index;