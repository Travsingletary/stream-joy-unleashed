
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaylist } from '../hooks/usePlaylist';
import { XtreamCredentials } from '../types/playlist';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { getXtreamCredentials, getM3UUrl } from '../services/playlistService';
import { cn } from '@/lib/utils';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadM3U, loadXtream, isLoading } = usePlaylist();
  
  // Initialize with saved values if available
  const savedXtream = getXtreamCredentials();
  const savedM3U = getM3UUrl();
  
  // Xtream credentials state
  const [xtreamCreds, setXtreamCreds] = useState<XtreamCredentials>({
    username: savedXtream?.username || '',
    password: savedXtream?.password || '',
    url: savedXtream?.url || ''
  });
  
  // M3U URL state
  const [m3uUrl, setM3UUrl] = useState<string>(savedM3U || '');
  
  // Handle Xtream login
  const handleXtreamLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await loadXtream(xtreamCreds);
      navigate('/channels');
    } catch (error) {
      console.error('Xtream login error:', error);
      // Toast notification is handled in the hook
    }
  };
  
  // Handle M3U loading
  const handleM3ULoad = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await loadM3U(m3uUrl);
      navigate('/channels');
    } catch (error) {
      console.error('M3U load error:', error);
      // Toast notification is handled in the hook
    }
  };
  
  // Update Xtream form fields
  const updateXtreamField = (field: keyof XtreamCredentials, value: string) => {
    setXtreamCreds(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  return (
    <div className="min-h-screen bg-steadystream-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-steadystream-gold mb-2">SteadyStream</h1>
          <p className="text-steadystream-secondary">Sign in to access your channels</p>
        </div>
        
        <Tabs defaultValue={savedM3U ? "m3u" : "xtream"} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="xtream">Xtream Login</TabsTrigger>
            <TabsTrigger value="m3u">M3U URL</TabsTrigger>
          </TabsList>
          
          {/* Xtream Login Tab */}
          <TabsContent value="xtream">
            <Card className="bg-black border-steadystream-gold/20">
              <CardHeader>
                <CardTitle className="text-steadystream-gold-light">Xtream Login</CardTitle>
                <CardDescription className="text-steadystream-secondary">
                  Enter your Xtream provider credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleXtreamLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="xtream-url" className="text-steadystream-gold-light">Server URL</Label>
                    <Input 
                      id="xtream-url"
                      type="url" 
                      placeholder="http://example.com:port"
                      className="bg-steadystream-black border-steadystream-gold/30 text-white"
                      value={xtreamCreds.url}
                      onChange={(e) => updateXtreamField('url', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="xtream-username" className="text-steadystream-gold-light">Username</Label>
                    <Input 
                      id="xtream-username"
                      type="text" 
                      className="bg-steadystream-black border-steadystream-gold/30 text-white"
                      value={xtreamCreds.username}
                      onChange={(e) => updateXtreamField('username', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="xtream-password" className="text-steadystream-gold-light">Password</Label>
                    <Input 
                      id="xtream-password"
                      type="password" 
                      className="bg-steadystream-black border-steadystream-gold/30 text-white"
                      value={xtreamCreds.password}
                      onChange={(e) => updateXtreamField('password', e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Connecting...' : 'Connect'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* M3U URL Tab */}
          <TabsContent value="m3u">
            <Card className="bg-black border-steadystream-gold/20">
              <CardHeader>
                <CardTitle className="text-steadystream-gold-light">M3U Playlist</CardTitle>
                <CardDescription className="text-steadystream-secondary">
                  Enter the URL of your M3U playlist
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleM3ULoad} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="m3u-url" className="text-steadystream-gold-light">M3U URL</Label>
                    <Input 
                      id="m3u-url"
                      type="url" 
                      placeholder="http://example.com/playlist.m3u"
                      className="bg-steadystream-black border-steadystream-gold/30 text-white"
                      value={m3uUrl}
                      onChange={(e) => setM3UUrl(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load Playlist'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LoginPage;
