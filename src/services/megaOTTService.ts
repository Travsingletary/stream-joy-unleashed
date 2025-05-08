
import { fetchWithProxy } from './corsProxyService';
import { toast } from '../hooks/use-toast';

// MegaOTT API response interface
export interface MegaOTTCreditsResponse {
  status: boolean;
  message: string;
  data?: {
    credits: number;
    [key: string]: any;
  };
  error?: string;
}

/**
 * Tests connection to MegaOTT API by checking credits
 */
export async function testMegaOTTConnection(apiKey: string): Promise<MegaOTTCreditsResponse> {
  const megaottApiUrl = 'https://megaott.net/api/v1/user/credits';
  
  try {
    // First attempt without proxy
    try {
      const response = await fetch(megaottApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('MegaOTT API Connection Result:', result);
        return result;
      }
    } catch (error) {
      console.log('Direct connection failed, trying with proxy...');
      // Continue to proxy attempt
    }
    
    // If direct connection fails, try with proxy
    const response = await fetchWithProxy(megaottApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    const result = await response.json();
    console.log('MegaOTT API Connection Result (via proxy):', result);
    return result;
  } catch (error) {
    console.error('MegaOTT API Connection Error:', error);
    return {
      status: false,
      message: error instanceof Error ? error.message : 'Unknown connection error'
    };
  }
}

/**
 * Loads playlist from MegaOTT API
 * This is a stub function that would be implemented fully once
 * we have the complete MegaOTT API integration requirements
 */
export async function loadMegaOTTPlaylist(apiKey: string) {
  // This function would be implemented with the full MegaOTT playlist loading logic
  // For now it just tests the connection
  const result = await testMegaOTTConnection(apiKey);
  
  if (!result.status) {
    throw new Error(result.message || 'Failed to connect to MegaOTT API');
  }
  
  return {
    status: true,
    message: 'MegaOTT connection successful',
    credits: result.data?.credits
  };
}
