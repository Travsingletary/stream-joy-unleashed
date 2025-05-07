
import { useState, useEffect } from 'react';

interface AccessVerificationResult {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
  credentials: { username: string | null; password: string | null };
}

export const useAccessVerification = (): AccessVerificationResult => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{ username: string | null; password: string | null }>({
    username: null,
    password: null
  });

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // 1. Check for access token in localStorage
        const accessToken = localStorage.getItem('steadystream_access_token');
        const purchaseId = localStorage.getItem('steadystream_purchase_id');
        const username = localStorage.getItem('steadystream_username');
        const password = localStorage.getItem('steadystream_password');

        if (!accessToken || !purchaseId) {
          setHasAccess(false);
          return;
        }

        // For production, you'd verify this with your backend
        // This is a simple client-side check, which is not secure on its own
        
        // Mock verification - in reality, you would validate with your backend
        // For example, checking token validity, expiration, etc.
        const isValid = true; // Replace with actual verification logic

        setHasAccess(isValid);
        
        // Set the credentials if they exist
        setCredentials({
          username,
          password
        });
      } catch (error) {
        console.error("Access verification error:", error);
        setError("Failed to verify access");
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccess();
  }, []);

  return { hasAccess, isLoading, error, credentials };
};
