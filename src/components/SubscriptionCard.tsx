
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const SubscriptionCard: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-black border border-steadystream-gold/20 shadow-lg hover:gold-glow transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-steadystream-gold-light flex items-center gap-2">
          <Crown className="h-5 w-5" /> Premium Subscription
        </CardTitle>
        <CardDescription className="text-steadystream-secondary">
          Unlock unlimited access with automatic tax calculation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-steadystream-gold-light">$9.99</div>
          <div className="text-steadystream-secondary text-sm">per month + applicable taxes</div>
        </div>
        <div className="space-y-2">
          {[
            "Unlimited HD streaming",
            "Access to all channels",
            "Multi-device support",
            "No ads",
            "Premium customer support"
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-steadystream-gold" />
              <span className="text-white/80">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black font-medium"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Subscribe Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
