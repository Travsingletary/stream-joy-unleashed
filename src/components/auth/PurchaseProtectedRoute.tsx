
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAccessVerification } from '@/hooks/useAccessVerification';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/ui/logo';

interface PurchaseProtectedRouteProps {
  children: React.ReactNode;
}

const PurchaseProtectedRoute: React.FC<PurchaseProtectedRouteProps> = ({ children }) => {
  const { hasAccess, isLoading } = useAccessVerification();
  const location = useLocation();

  // If we're still loading, show a spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-steadystream-black flex items-center justify-center">
        <Card className="bg-black border-steadystream-gold/20 p-6">
          <CardContent className="flex flex-col items-center gap-4">
            <Logo variant="symbol" size="md" className="mb-2" />
            <Loader2 className="h-8 w-8 text-steadystream-gold animate-spin" />
            <p className="text-steadystream-secondary">Verifying your access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user doesn't have access, redirect to login
  if (!hasAccess) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user has access, render the protected route
  return <>{children}</>;
};

export default PurchaseProtectedRoute;
