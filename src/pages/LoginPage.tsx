
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePlaylist } from '../hooks/usePlaylist';
import { XtreamCredentials } from '../types/playlist';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/popover';
import { toast } from '../hooks/use-toast';
import { InfoIcon, ExternalLink, CheckCircle } from 'lucide-react';
import { useAccessVerification } from '../hooks/useAccessVerification';
import Logo from '@/components/ui/logo';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loadM3U, loadXtream, isLoading } = usePlaylist();
  const [accessCode, setAccessCode] = useState('');
  const { hasAccess, credentials } = useAccessVerification();
  const [autoConnecting, setAutoConnecting] = useState(false);
  const [autoConnected, setAutoConnected] = useState(false);
  
  // If the user already has access and credentials, try to automatically connect
  useEffect(() => {
    if (hasAccess && credentials.username && credentials.password && !autoConnected && !autoConnecting) {
      const autoConnect = async () => {
        try {
          setAutoConnecting(true);
          toast({
            title: "Connecting to service",
            description: "Using your verified credentials to connect...",
          });
          
          // Construct an Xtream Codes URL with the provided credentials
          // This is a mock URL format, adjust as needed for your service
          const serverUrl = "http://your-panel-url.com"; // Replace with your actual panel URL
          
          const xtreamCredentials: XtreamCredentials = {
            username: credentials.username,
            password: credentials.password,
            url: serverUrl
          };
          
          await loadXtream(xtreamCredentials);
          setAutoConnected(true);
          
          toast({
            title: "Connected",
            description: "Successfully connected to your service.",
            variant: "default"
          });
          
          // Navigate to channels page after successful connection
          navigate('/channels');
        } catch (error) {
          console.error("Auto-connection error:", error);
          toast({
            variant: "destructive",
            title: "Connection failed",
            description: "Could not automatically connect with your credentials. Please enter your access code manually.",
          });
        } finally {
          setAutoConnecting(false);
        }
      };
      
      autoConnect();
    } else if (hasAccess && !credentials.username && !credentials.password) {
      const from = location.state?.from?.pathname || "/channels";
      navigate(from, { replace: true });
    }
  }, [hasAccess, credentials, navigate, loadXtream, autoConnected, autoConnecting, location.state?.from?.pathname]);
  
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter your access code or service link",
      });
      return;
    }
    
    try {
      // Check if it's an Xtream Codes URL
      if (accessCode.includes('get.php') || accessCode.includes('username=') || accessCode.includes('password=')) {
        // Parse Xtream URL to get credentials
        const url = new URL(accessCode);
        const username = url.searchParams.get('username') || '';
        const password = url.searchParams.get('password') || '';
        const serverUrl = accessCode.split('/c/')[0];
        
        if (!username || !password || !serverUrl) {
          throw new Error('Invalid Xtream URL format');
        }
        
        const credentials: XtreamCredentials = {
          username,
          password,
          url: serverUrl
        };
        
        await loadXtream(credentials);
        navigate('/channels');
      }
      // Check if it's an M3U URL
      else if (accessCode.toLowerCase().endsWith('.m3u') || accessCode.toLowerCase().endsWith('.m3u8')) {
        await loadM3U(accessCode);
        navigate('/channels');
      }
      // Treat as a DNS code and resolve via API
      else if (/^[a-zA-Z0-9]{5,12}$/.test(accessCode)) {
        // Simulate API call for now
        toast({
          title: "Resolving access code...",
          description: "Please wait while we connect to your service",
        });
        
        // Mock API call - in a real app, this would be a fetch to '/api/resolve-code'
        setTimeout(async () => {
          try {
            // Mock response - in production, this would come from the API
            const mockResponse = {
              type: 'm3u',
              url: 'https://example.com/playlist.m3u'
            };
            
            if (mockResponse.type === 'm3u') {
              await loadM3U(mockResponse.url);
              navigate('/channels');
            } else if (mockResponse.type === 'xtream') {
              const credentials: XtreamCredentials = {
                username: 'demo',
                password: 'demo',
                url: 'https://example.com'
              };
              await loadXtream(credentials);
              navigate('/channels');
            }
          } catch (error) {
            toast({
              variant: "destructive",
              title: "Connection failed",
              description: "Could not resolve your access code. Please check and try again.",
            });
          }
        }, 2000);
      } else {
        throw new Error('Unrecognized format');
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Please check your access code or service link and try again.",
      });
    }
  };
  
  // If we're auto-connecting, show a loading state
  if (autoConnecting) {
    return (
      <div className="min-h-screen bg-steadystream-black flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 flex flex-col items-center">
            <Logo variant="full" size="lg" className="mb-4 animate-fade-in" />
            <p className="text-steadystream-secondary">Connecting to your service</p>
          </div>
          
          <Card className="bg-black border-steadystream-gold/20">
            <CardHeader>
              <CardTitle className="text-steadystream-gold-light">Automatic connection</CardTitle>
              <CardDescription className="text-steadystream-secondary">
                Using your verified credentials to connect to the service
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <div className="h-16 w-16 text-steadystream-gold animate-spin mb-4 border-4 border-current border-t-transparent rounded-full"></div>
              <p className="text-white mt-4">Connecting to your service...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-steadystream-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo variant="full" size="lg" className="mb-4 animate-fade-in" />
          <p className="text-steadystream-secondary">Connect to start watching</p>
        </div>
        
        <Card className="bg-black border-steadystream-gold/20">
          {hasAccess && credentials.username && credentials.password ? (
            <CardHeader>
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
              </div>
              <CardTitle className="text-steadystream-gold-light text-center">Verified Purchase</CardTitle>
              <CardDescription className="text-steadystream-secondary text-center">
                Your account is already connected with verified credentials
              </CardDescription>
            </CardHeader>
          ) : (
            <CardHeader>
              <CardTitle className="text-steadystream-gold-light">Connect to your service</CardTitle>
              <CardDescription className="text-steadystream-secondary">
                Enter your access code or service link to continue
              </CardDescription>
            </CardHeader>
          )}
          
          <CardContent>
            {hasAccess && credentials.username && credentials.password ? (
              <div className="space-y-4">
                <p className="text-steadystream-secondary text-center">
                  You can proceed directly to watch your content
                </p>
                <Button 
                  className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black"
                  onClick={() => navigate('/channels')}
                >
                  Start Watching
                </Button>
              </div>
            ) : (
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="access-code" className="text-steadystream-gold-light">
                      Enter your access code or service link
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full text-steadystream-secondary hover:text-steadystream-gold hover:bg-transparent"
                        >
                          <InfoIcon className="h-4 w-4" />
                          <span className="sr-only">Help</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 bg-black border-steadystream-gold/20 text-white">
                        <div className="space-y-2">
                          <h4 className="font-medium text-steadystream-gold-light">What to enter?</h4>
                          <p className="text-sm text-steadystream-secondary">
                            You can enter a code from your provider or paste a service link you were given.
                          </p>
                          <p className="text-sm text-steadystream-secondary">
                            Examples:
                            <br />• Short code: skytv42
                            <br />• M3U link: http://example.com/playlist.m3u
                            <br />• Xtream service link
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Input 
                    id="access-code"
                    type="text" 
                    placeholder="Enter code or paste link"
                    className="bg-steadystream-black border-steadystream-gold/30 text-white"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
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

                <div className="text-center">
                  <span className="text-xs text-steadystream-secondary">or</span>
                </div>

                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-steadystream-gold/30 text-steadystream-gold hover:bg-steadystream-gold/5"
                  onClick={() => navigate('/import')}
                >
                  Manual Playlist Import
                </Button>
              </form>
            )}
            
            <div className="mt-6 pt-4 border-t border-steadystream-gold/10">
              <p className="text-sm text-steadystream-secondary text-center mb-4">
                Don't have an access code?
              </p>
              <Button
                variant="outline"
                className="w-full border-steadystream-gold/30 text-steadystream-gold hover:bg-steadystream-gold/5"
                onClick={() => window.open('https://your-website.com/purchase', '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Purchase Access
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="link" 
              className="text-steadystream-secondary hover:text-steadystream-gold"
              onClick={() => navigate('/')}
            >
              Back to home
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center">
          <img 
            src="/logo-symbol.png" 
            alt="" 
            className="h-8 mx-auto opacity-30 hover:opacity-60 transition-opacity"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
