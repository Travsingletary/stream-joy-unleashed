
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-steadystream-black p-4 sm:p-6 lg:p-8">
      {/* Logo and brand header */}
      <div className="text-center mb-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 relative overflow-hidden rounded-full gold-glow">
            <div className="absolute inset-0 bg-gold-gradient"></div>
            <div className="absolute inset-2 bg-steadystream-black rounded-full flex items-center justify-center">
              <div className="h-12 w-12 wave-pattern rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mt-4">
            <span className="gold-text">Steadystream</span>
          </h1>
          <p className="text-steadystream-secondary max-w-md">
            Your premium streaming experience with seamless playback and extensive channel selection
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black border border-steadystream-gold/20 shadow-lg hover:gold-glow transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-steadystream-gold-light">Welcome to Steadystream</CardTitle>
            <CardDescription className="text-steadystream-secondary">
              Discover premium content at your fingertips
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
            <Button 
              className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black font-medium"
              onClick={() => navigate("/channels")}
            >
              Explore Channels
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-black border border-steadystream-gold/20 shadow-lg hover:gold-glow transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-steadystream-gold-light">Program Guide</CardTitle>
            <CardDescription className="text-steadystream-secondary">
              Browse the electronic program guide
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-white/80">
            <p>
              View program schedules and details with our elegant electronic program guide (EPG).
              See what's currently playing and what's coming up next across all your channels.
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
            <Button 
              className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black font-medium"
              onClick={() => navigate("/epg")}
            >
              Open Program Guide
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Features section */}
      <div className="w-full max-w-5xl mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "HD Streaming",
            description: "Crystal clear quality with adaptive bitrate for smooth playback",
            icon: "🎬"
          },
          {
            title: "Multi-Device",
            description: "Watch on any screen, anytime with perfect synchronization",
            icon: "📱"
          },
          {
            title: "Global Content",
            description: "Access channels and content from around the world",
            icon: "🌍"
          }
        ].map((feature, index) => (
          <Card key={index} className="bg-black border border-steadystream-gold/20">
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
          </Card>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-steadystream-secondary text-sm">
        <p>© 2025 Steadystream • Premium Streaming Experience</p>
      </footer>
    </div>
  );
};

export default Index;
