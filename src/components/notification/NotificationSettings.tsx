
import React from 'react';
import { useNotification } from '@/hooks/useNotification';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Logo from '@/components/ui/logo';

export const NotificationSettings: React.FC = () => {
  const { 
    permission,
    isSupported,
    isPushSupported, 
    isSubscribed,
    requestPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications
  } = useNotification();

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribeFromPushNotifications();
    } else {
      if (permission !== 'granted') {
        await requestPermission();
      }
      if (permission === 'granted' || Notification.permission === 'granted') {
        await subscribeToPushNotifications();
      }
    }
  };

  if (!isSupported) {
    return (
      <Alert variant="destructive" className="bg-black border-destructive/20">
        <AlertTitle className="text-destructive">Notifications Not Supported</AlertTitle>
        <AlertDescription>
          Your browser doesn't support notifications. Try using a modern browser like Chrome, Firefox, or Edge.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-black border-steadystream-gold/20">
      <CardHeader>
        <div className="flex items-center justify-center mb-2">
          <Logo variant="symbol" size="sm" />
        </div>
        <CardTitle className="flex items-center gap-2 text-steadystream-gold-light">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription className="text-steadystream-secondary">
          Control how and when Steadystream can notify you
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="push-notifications" className="text-white">Push Notifications</Label>
            <p className="text-steadystream-secondary text-sm mt-1">
              Receive updates even when you're not using the app
            </p>
          </div>
          
          {isPushSupported ? (
            <Switch
              id="push-notifications"
              checked={isSubscribed}
              onCheckedChange={handleToggleNotifications}
              disabled={permission === 'denied'}
              className="data-[state=checked]:bg-steadystream-gold"
            />
          ) : (
            <p className="text-steadystream-secondary text-sm">Not supported</p>
          )}
        </div>
        
        {permission === 'denied' && (
          <Alert className="bg-black border-steadystream-gold/20">
            <AlertTitle className="text-steadystream-gold-light">Notifications Blocked</AlertTitle>
            <AlertDescription className="text-steadystream-secondary">
              You've blocked notifications for this site. To enable them, please update your browser settings.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      {permission !== 'granted' && permission !== 'denied' && (
        <CardFooter>
          <Button 
            onClick={() => requestPermission()}
            className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black"
          >
            Enable Notifications
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
