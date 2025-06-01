
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Logo from '@/components/ui/logo';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-steadystream-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo variant="full" size="lg" className="mb-4" />
          <p className="text-steadystream-secondary">Payment successful!</p>
        </div>

        <Card className="bg-black border-steadystream-gold/20">
          <CardHeader>
            <CardTitle className="text-steadystream-gold-light text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              Subscription Activated
            </CardTitle>
            <CardDescription className="text-steadystream-secondary text-center">
              Welcome to Steadystream Premium! Your subscription is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-white mb-4">
                Thank you for subscribing! Taxes have been automatically calculated and applied to your payment.
              </p>
              {sessionId && (
                <p className="text-steadystream-secondary text-sm">
                  Session ID: {sessionId}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Button 
                className="w-full bg-gold-gradient hover:bg-gold-gradient-hover text-black"
                onClick={() => navigate('/channels')}
              >
                Start Watching <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-steadystream-gold/30 text-steadystream-secondary hover:bg-steadystream-gold/5"
                onClick={() => navigate('/')}
              >
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuccessPage;
