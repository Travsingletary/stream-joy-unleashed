
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface NotificationState {
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isSupported: boolean;
  isPushSupported: boolean;
  isSubscribed: boolean;
}

// Mock push server key
const MOCK_VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

export const useNotification = () => {
  const { toast } = useToast();
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    subscription: null,
    isSupported: false,
    isPushSupported: false,
    isSubscribed: false,
  });

  // Helper to convert base64 string to Uint8Array for VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Register service worker
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/serviceWorker.js');
        console.log('Service Worker registered with scope:', registration.scope);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  };

  // Request notification permission
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive updates about new shows and features.",
        });
        return true;
      } else {
        toast({
          title: "Notifications Disabled",
          description: "You won't receive any notifications from Steadystream.",
          variant: "default",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Subscribe to push notifications
  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast({
        title: "Push Notifications Not Supported", 
        description: "Your browser doesn't support push notifications.",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      
      // Get existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      // If no subscription exists, create one
      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(MOCK_VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        });
      }

      console.log('Push Notification Subscription:', subscription);
      setState(prev => ({ 
        ...prev, 
        subscription, 
        isSubscribed: true 
      }));

      // Store subscription in localStorage (in a real app, would send to backend)
      localStorage.setItem('pushSubscription', JSON.stringify(subscription));
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      toast({
        title: "Subscription Failed",
        description: "Could not subscribe to push notifications.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        setState(prev => ({ ...prev, subscription: null, isSubscribed: false }));
        localStorage.removeItem('pushSubscription');
        
        toast({
          title: "Notifications Disabled",
          description: "You have unsubscribed from notifications.",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  };

  // Send a push notification (mock function for admin panel)
  const sendPushNotification = async (title: string, body: string, url: string = '/') => {
    try {
      // In a real application, this would send to your backend
      // which would then use Web Push to notify all subscribed clients
      
      // For demo purposes, we'll show a toast and a local notification if possible
      toast({
        title: "Notification Sent",
        description: "Your notification has been delivered.",
      });
      
      if ('Notification' in window && Notification.permission === 'granted') {
        // Only works if the page is open, but simulates the push for testing
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  };

  // Initialize notification detection on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      // Check if notifications are supported
      const notificationsSupported = 'Notification' in window;
      // Check if push is supported
      const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      
      if (notificationsSupported) {
        const permission = Notification.permission;
        setState(prev => ({ 
          ...prev, 
          permission,
          isSupported: notificationsSupported,
          isPushSupported: pushSupported
        }));
        
        // If we have permission and push is supported, check subscription status
        if (permission === 'granted' && pushSupported) {
          await registerServiceWorker();
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          
          setState(prev => ({ 
            ...prev, 
            subscription,
            isSubscribed: !!subscription
          }));
        }
      } else {
        setState(prev => ({ 
          ...prev, 
          isSupported: false,
          isPushSupported: false
        }));
      }
    };
    
    initializeNotifications();
  }, []);

  return {
    ...state,
    requestPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    sendPushNotification
  };
};
