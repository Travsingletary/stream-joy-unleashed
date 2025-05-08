
/**
 * A service to help with CORS issues when fetching external playlists
 */

// List of public CORS proxies that can be used
const PUBLIC_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url='
];

/**
 * Applies a CORS proxy to a URL
 * Will try different proxies if the first one fails
 */
export const applyProxy = (url: string, proxyIndex = 0): string => {
  if (proxyIndex >= PUBLIC_PROXIES.length) {
    return url; // Return original URL if we've tried all proxies
  }
  
  // If URL is already using a proxy, return as is
  if (PUBLIC_PROXIES.some(proxy => url.includes(proxy))) {
    return url;
  }
  
  // Apply the proxy
  return `${PUBLIC_PROXIES[proxyIndex]}${encodeURIComponent(url)}`;
};

/**
 * Fetches a URL through a CORS proxy
 */
export const fetchWithProxy = async (url: string): Promise<Response> => {
  let currentProxyIndex = 0;
  let lastError: Error | null = null;
  
  // Try each proxy until one works
  while (currentProxyIndex < PUBLIC_PROXIES.length) {
    try {
      const proxiedUrl = applyProxy(url, currentProxyIndex);
      console.log(`Trying to fetch with proxy: ${proxiedUrl}`);
      const response = await fetch(proxiedUrl);
      
      if (response.ok) {
        return response;
      }
      
      lastError = new Error(`Proxy returned status: ${response.status}`);
    } catch (error) {
      console.error(`Proxy fetch error with ${PUBLIC_PROXIES[currentProxyIndex]}:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown proxy error');
    }
    
    currentProxyIndex++;
  }
  
  // If all proxies fail, throw the last error
  throw lastError || new Error('All proxies failed');
};
