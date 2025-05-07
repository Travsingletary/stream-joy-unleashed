
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { useToast } from '../../hooks/use-toast';
import { storeEPGUrl } from '../../services/epgService';

interface EPGSetupProps {
  onEPGUrlSubmit: (url: string) => void;
  defaultUrl?: string;
  isLoading?: boolean;
}

const EPGSetup: React.FC<EPGSetupProps> = ({ 
  onEPGUrlSubmit, 
  defaultUrl = '', 
  isLoading = false 
}) => {
  const [xmltvUrl, setXmltvUrl] = useState<string>(defaultUrl);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!xmltvUrl) {
      toast({
        variant: "destructive",
        title: "URL required",
        description: "Please enter a valid XMLTV URL",
      });
      return;
    }
    
    // Store URL in localStorage
    storeEPGUrl(xmltvUrl);
    
    // Submit URL to parent component
    onEPGUrlSubmit(xmltvUrl);
  };
  
  return (
    <Card className="bg-black border border-steadystream-gold/20">
      <CardHeader>
        <CardTitle className="text-steadystream-gold-light">EPG Configuration</CardTitle>
        <CardDescription className="text-steadystream-secondary">
          Configure your Electronic Program Guide by providing an XMLTV source URL
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="xmltv-url" className="text-steadystream-gold">XMLTV URL</Label>
            <Input
              id="xmltv-url"
              placeholder="https://example.com/epg.xml"
              className="bg-steadystream-black border-steadystream-gold/30 text-white"
              value={xmltvUrl}
              onChange={(e) => setXmltvUrl(e.target.value)}
            />
            <p className="text-xs text-steadystream-secondary">
              Enter the URL of your XMLTV source. This should be an XML file containing program guide data.
            </p>
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              disabled={isLoading || !xmltvUrl}
              className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black font-medium"
            >
              {isLoading ? 'Loading EPG Data...' : 'Load EPG Data'}
            </Button>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="text-xs text-steadystream-secondary border-t border-steadystream-gold/10 pt-4">
        EPG data will be matched to your channels automatically based on channel IDs or names.
      </CardFooter>
    </Card>
  );
};

export default EPGSetup;
