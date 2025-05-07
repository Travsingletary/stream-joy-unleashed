
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/ui/logo';

const VerifyPurchasePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifyingPurchase, setVerifyingPurchase] = useState(true);
  const [purchaseValid, setPurchaseValid] = useState(false);
  const purchaseToken = searchParams.get('token');
  const purchaseId = searchParams.get('purchase_id');

  useEffect(() => {
    const verifyPurchase = async () => {
      if (!purchaseToken || !purchaseId) {
        setPurchaseValid(false);
        setVerifyingPurchase(false);
        return;
      }

      try {
        // Here we would verify the purchase with your website's API
        // This is a mock implementation - replace with your actual API call
        const response = await fetch(`https://your-website-api.com/verify-purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            purchase_id: purchaseId,
            token: purchaseToken
          })
        });

        // Mock successful verification
        const isValid = true; // Replace with actual verification logic
        setPurchaseValid(isValid);

        if (isValid) {
          // Store access token in localStorage
          localStorage.setItem('steadystream_access_token', purchaseToken);
          localStorage.setItem('steadystream_purchase_id', purchaseId);
          
          toast({
            title: "Access Granted",
            description: "Your purchase has been verified. Welcome to Steadystream!",
          });

          // Optional: Create anonymous user in Supabase to track usage
          const { data, error } = await supabase.auth.signUp({
            email: `user_${purchaseId}@steadystream.temporary`,
            password: crypto.randomUUID(),
          });

          if (!error && data.user) {
            // Save the user ID for future reference
            localStorage.setItem('steadystream_user_id', data.user.id);
          }
        } else {
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "Could not verify your purchase. Please contact support.",
          });
        }
      } catch (error) {
        console.error("Verification error:", error);
        setPurchaseValid(false);
        toast({
          variant: "destructive",
          title: "Verification Error",
          description: "An error occurred during verification. Please try again.",
        });
      } finally {
        setVerifyingPurchase(false);
      }
    };

    verifyPurchase();
  }, [purchaseId, purchaseToken]);

  return (
    <div className="min-h-screen bg-steadystream-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo variant="full" size="lg" className="mb-4 animate-fade-in" />
          <p className="text-steadystream-secondary">Verifying your purchase</p>
        </div>

        <Card className="bg-black border-steadystream-gold/20">
          <CardHeader>
            <CardTitle className="text-steadystream-gold-light text-center">
              Purchase Verification
            </CardTitle>
            <CardDescription className="text-steadystream-secondary text-center">
              {verifyingPurchase 
                ? "Validating your purchase details..." 
                : purchaseValid 
                  ? "Your purchase has been verified!" 
                  : "There was an issue with your purchase verification."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            {verifyingPurchase && (
              <div className="flex flex-col items-center">
                <Loader2 className="h-16 w-16 text-steadystream-gold animate-spin mb-4" />
                <p className="text-white mt-4">Just a moment while we verify your purchase...</p>
              </div>
            )}
            
            {!verifyingPurchase && purchaseValid && (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-white text-center mb-6">
                  Welcome to Steadystream! Your purchase has been verified.
                </p>
                <Button 
                  className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black"
                  onClick={() => navigate('/channels')}
                >
                  Start Watching
                </Button>
              </div>
            )}
            
            {!verifyingPurchase && !purchaseValid && (
              <div className="flex flex-col items-center">
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <p className="text-white text-center mb-6">
                  We couldn't verify your purchase. Please check your purchase details or contact support.
                </p>
                <Button 
                  className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black mb-4"
                  onClick={() => navigate('/login')}
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-steadystream-gold/30 text-steadystream-secondary hover:bg-steadystream-gold/5"
                  onClick={() => window.open('https://your-website.com/support', '_blank')}
                >
                  Contact Support
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyPurchasePage;
