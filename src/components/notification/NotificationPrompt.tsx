
import React, { useState, useEffect } from 'react';
import { useNotification } from '@/hooks/useNotification';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import Logo from '@/components/ui/logo';

// Time to wait before showing the notification prompt (3 seconds)
const PROMPT_DELAY = 3000;

export const NotificationPrompt: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { permission, isSupported, requestPermission, subscribeToPushNotifications } = useNotification();

  useEffect(() => {
    // Only show prompt if notifications are supported and not granted/denied yet
    if (isSupported && permission === 'default') {
      const timer = setTimeout(() => {
        const hasPrompted = localStorage.getItem('notificationPromptShown');
        if (!hasPrompted) {
          setOpen(true);
        }
      }, PROMPT_DELAY);
      
      return () => clearTimeout(timer);
    }
  }, [isSupported, permission]);

  const handleAccept = async () => {
    localStorage.setItem('notificationPromptShown', 'true');
    setOpen(false);
    
    const permissionGranted = await requestPermission();
    if (permissionGranted) {
      await subscribeToPushNotifications();
    }
  };

  const handleDecline = () => {
    localStorage.setItem('notificationPromptShown', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-black border-steadystream-gold/20 max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <Logo variant="symbol" size="md" className="mb-2" />
          </div>
          <DialogTitle className="flex items-center gap-2 text-steadystream-gold-light">
            <Bell className="h-5 w-5" />
            Stay Updated with Steadystream
          </DialogTitle>
          <DialogDescription className="text-steadystream-secondary">
            Would you like to receive updates about new shows, features, and announcements?
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-steadystream-gold/5 rounded-md border border-steadystream-gold/10">
          <p className="text-sm text-steadystream-secondary">
            Notifications help you keep up with:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-steadystream-secondary">
            <li className="flex gap-2">
              • New shows and movies added
            </li>
            <li className="flex gap-2">
              • Live sports events starting soon
            </li>
            <li className="flex gap-2">
              • Service maintenance updates
            </li>
            <li className="flex gap-2">
              • Personalized recommendations
            </li>
          </ul>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={handleDecline}
            className="border-steadystream-gold/30 text-steadystream-secondary hover:bg-steadystream-gold/5"
          >
            Not Now
          </Button>
          <Button 
            onClick={handleAccept}
            className="bg-gold-gradient hover:bg-gold-gradient-hover text-black"
          >
            Enable Notifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
