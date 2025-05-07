
import React, { useState } from 'react';
import { useNotification } from '@/hooks/useNotification';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminNotifyPage: React.FC = () => {
  const { sendPushNotification } = useNotification();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [url, setUrl] = useState('/');
  const [isSending, setIsSending] = useState(false);
  
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both a title and message.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    try {
      // Get subscriptions from localStorage (mock implementation)
      const subscriptionJSON = localStorage.getItem('pushSubscription');
      
      if (!subscriptionJSON) {
        toast({
          title: "No Subscribers",
          description: "There are no users subscribed to notifications.",
          variant: "destructive",
        });
        setIsSending(false);
        return;
      }
      
      // In a real implementation, we would send this to a server
      // that would then use Web Push to deliver to all subscribers
      await sendPushNotification(title, message, url);
      
      toast({
        title: "Notification Sent",
        description: "Your notification has been delivered to all subscribers.",
      });
      
      // Reset form
      setTitle('');
      setMessage('');
      setUrl('/');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Sending Failed",
        description: "Could not send the notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-steadystream-gold">Admin Notifications</h1>
          <p className="text-steadystream-secondary">Send push notifications to all subscribers</p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="border-steadystream-gold/30 hover:bg-steadystream-gold/5"
        >
          Back to Dashboard
        </Button>
      </div>
      
      <Card className="bg-black border-steadystream-gold/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-steadystream-gold-light">
            <Bell className="h-5 w-5" />
            Send Push Notification
          </CardTitle>
          <CardDescription className="text-steadystream-secondary">
            This notification will be sent to all users who have opted in
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSendNotification}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-steadystream-gold-light">Notification Title</Label>
              <Input 
                id="title" 
                placeholder="Enter notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-steadystream-black border-steadystream-gold/30 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message" className="text-steadystream-gold-light">Message</Label>
              <Textarea 
                id="message" 
                placeholder="Enter notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-steadystream-black border-steadystream-gold/30 text-white min-h-[100px]"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url" className="text-steadystream-gold-light">Destination URL (Optional)</Label>
              <Input 
                id="url" 
                placeholder="Where to direct users when they click (default: /)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-steadystream-black border-steadystream-gold/30 text-white"
              />
              <p className="text-steadystream-secondary text-xs">
                This is where users will be directed when they click the notification
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit"
              disabled={isSending}
              className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black"
            >
              {isSending ? 'Sending...' : 'Send Notification to All Users'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <div className="mt-8 p-4 border border-steadystream-gold/20 rounded-md bg-steadystream-gold/5">
        <h3 className="font-medium text-steadystream-gold-light mb-2">Testing Instructions</h3>
        <p className="text-steadystream-secondary text-sm">
          To test notifications, first enable them by accepting the notification prompt or visiting the notification
          settings in your profile. Then send a notification from this admin panel.
        </p>
        <p className="text-steadystream-secondary text-sm mt-2">
          For this demo, notifications will only appear when the browser is open. In production, with a proper 
          backend implementation, they would show even when the browser is closed.
        </p>
      </div>
    </div>
  );
};

export default AdminNotifyPage;
