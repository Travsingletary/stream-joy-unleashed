
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { usePlaylist } from '../hooks/usePlaylist';
import { XtreamCredentials } from '../types/playlist';
import { toast } from '../hooks/use-toast';
import Logo from '@/components/ui/logo';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ImportPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadM3U, loadXtream, isLoading } = usePlaylist();
  const [importType, setImportType] = useState<'m3u' | 'xtream'>('m3u');
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // M3U form schema and form handling
  const m3uSchema = z.object({
    url: z.string().url('Please enter a valid URL')
  });

  const m3uForm = useForm<z.infer<typeof m3uSchema>>({
    resolver: zodResolver(m3uSchema),
    defaultValues: {
      url: ''
    }
  });

  // Xtream form schema and form handling
  const xtreamSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    url: z.string().url('Please enter a valid URL')
  });

  const xtreamForm = useForm<z.infer<typeof xtreamSchema>>({
    resolver: zodResolver(xtreamSchema),
    defaultValues: {
      username: '',
      password: '',
      url: ''
    }
  });

  const onM3USubmit = async (data: z.infer<typeof m3uSchema>) => {
    try {
      setImportStatus('loading');
      setErrorMessage('');
      
      toast({
        title: "Importing playlist",
        description: "Please wait while we process your playlist...",
      });
      
      await loadM3U(data.url);
      
      setImportStatus('success');
      toast({
        title: "Playlist imported",
        description: "M3U playlist has been successfully loaded",
      });
      
      // Short delay before navigation to show success state
      setTimeout(() => navigate('/channels'), 1000);
    } catch (error: any) {
      console.error("Import error:", error);
      setImportStatus('error');
      const message = error.message || "Failed to load M3U playlist";
      setErrorMessage(message);
      
      toast({
        variant: "destructive",
        title: "Import failed",
        description: message,
      });
    }
  };

  const onXtreamSubmit = async (data: z.infer<typeof xtreamSchema>) => {
    try {
      setImportStatus('loading');
      setErrorMessage('');
      
      toast({
        title: "Connecting to service",
        description: "Please wait while we connect to your Xtream service...",
      });
      
      const credentials: XtreamCredentials = {
        username: data.username,
        password: data.password,
        url: data.url
      };
      
      await loadXtream(credentials);
      
      setImportStatus('success');
      toast({
        title: "Playlist imported",
        description: "Xtream playlist has been successfully loaded",
      });
      
      // Short delay before navigation to show success state
      setTimeout(() => navigate('/channels'), 1000);
    } catch (error: any) {
      console.error("Import error:", error);
      setImportStatus('error');
      const message = error.message || "Failed to load Xtream playlist";
      setErrorMessage(message);
      
      toast({
        variant: "destructive",
        title: "Import failed",
        description: message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-steadystream-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo variant="full" size="lg" className="mb-4 animate-fade-in" />
          <p className="text-steadystream-secondary">Import your playlist</p>
        </div>
        
        <Card className="bg-black border-steadystream-gold/20">
          <CardHeader>
            <CardTitle className="text-steadystream-gold-light">Import IPTV Playlist</CardTitle>
            <CardDescription className="text-steadystream-secondary">
              Add your M3U playlist URL or Xtream Codes credentials
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {importStatus === 'error' && (
              <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-700">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import Error</AlertTitle>
                <AlertDescription>
                  {errorMessage || "There was a problem importing your playlist. Please check your details and try again."}
                </AlertDescription>
                <AlertDescription className="mt-2 text-xs">
                  Try using a different URL format or check if the server supports CORS.
                </AlertDescription>
              </Alert>
            )}
            
            {importStatus === 'success' && (
              <Alert className="mb-4 bg-green-900/20 border-green-700">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Import Successful</AlertTitle>
                <AlertDescription>
                  Your playlist has been successfully imported. Redirecting to channels...
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="m3u" className="w-full" onValueChange={(value) => setImportType(value as 'm3u' | 'xtream')}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-steadystream-black border-steadystream-gold/20">
                <TabsTrigger 
                  value="m3u"
                  className="data-[state=active]:bg-gold-gradient data-[state=active]:text-black"
                >
                  M3U URL
                </TabsTrigger>
                <TabsTrigger 
                  value="xtream"
                  className="data-[state=active]:bg-gold-gradient data-[state=active]:text-black"
                >
                  Xtream Codes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="m3u">
                <Form {...m3uForm}>
                  <form onSubmit={m3uForm.handleSubmit(onM3USubmit)} className="space-y-4">
                    <FormField
                      control={m3uForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-steadystream-gold-light">M3U Playlist URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="http://example.com/playlist.m3u" 
                              className="bg-steadystream-black border-steadystream-gold/30 text-white"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-steadystream-secondary">
                            Enter the URL to your M3U or M3U8 playlist
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black"
                      disabled={isLoading || importStatus === 'loading'}
                    >
                      {importStatus === 'loading' ? 'Importing...' : 'Import M3U Playlist'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="xtream">
                <Form {...xtreamForm}>
                  <form onSubmit={xtreamForm.handleSubmit(onXtreamSubmit)} className="space-y-4">
                    <FormField
                      control={xtreamForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-steadystream-gold-light">Portal URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="http://example.com:port" 
                              className="bg-steadystream-black border-steadystream-gold/30 text-white"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-steadystream-secondary">
                            Enter your Xtream provider URL (with port if required)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={xtreamForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-steadystream-gold-light">Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Username" 
                                className="bg-steadystream-black border-steadystream-gold/30 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={xtreamForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-steadystream-gold-light">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"
                                placeholder="Password" 
                                className="bg-steadystream-black border-steadystream-gold/30 text-white"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black"
                      disabled={isLoading || importStatus === 'loading'}
                    >
                      {importStatus === 'loading' ? 'Connecting...' : 'Connect Xtream Service'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 pt-4 border-t border-steadystream-gold/10">
              <p className="text-xs text-center text-steadystream-secondary">
                You can import as many different playlists as you need.
                Your most recent import will be used as the active playlist.
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button 
              variant="link" 
              className="text-steadystream-secondary hover:text-steadystream-gold"
              onClick={() => navigate('/login')}
            >
              Back to login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ImportPage;
