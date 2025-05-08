
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
  // Try different API endpoints - the main one might have changed
  const endpoints = [
    'https://megaott.net/api/v1/user/credits',
    'https://api.megaott.net/v1/user/credits',
    'https://megaott.net/api/user/credits'
  ];
  
  const errors = [];
  
  for (const endpoint of endpoints) {
    console.log(`Trying MegaOTT endpoint: ${endpoint}`);
    
    try {
      // First attempt without proxy
      try {
        const response = await fetch(endpoint, {
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
        } else {
          const errorText = await response.text();
          console.log(`Direct connection failed with status ${response.status}: ${errorText}`);
          errors.push(`Status ${response.status} from ${endpoint}`);
        }
      } catch (error) {
        console.log(`Direct connection to ${endpoint} failed, trying with proxy...`);
        // Continue to proxy attempt
      }
      
      // If direct connection fails, try with proxy
      const response = await fetchWithProxy(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('MegaOTT API Connection Result (via proxy):', result);
        return result;
      } else {
        const errorText = await response.text();
        console.log(`Proxy connection failed with status ${response.status}: ${errorText}`);
        errors.push(`Status ${response.status} from ${endpoint} (via proxy)`);
      }
    } catch (error) {
      console.error(`MegaOTT API Connection Error with ${endpoint}:`, error);
      errors.push(error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  console.error('All MegaOTT API endpoints failed:', errors);
  return {
    status: false,
    message: 'All API endpoints failed. Please check your API key and try again later.',
    error: errors.join('; ')
  };
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
