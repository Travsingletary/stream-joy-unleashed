
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

// Interface for fetch options
interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

/**
 * Fetches a URL through a CORS proxy
 */
export const fetchWithProxy = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  let currentProxyIndex = 0;
  let lastError: Error | null = null;
  
  // Set default headers if not provided
  const fetchOptions: FetchOptions = {
    ...options,
    headers: {
      'Accept': '*/*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      ...(options.headers || {})
    }
  };
  
  // Try each proxy until one works
  while (currentProxyIndex < PUBLIC_PROXIES.length) {
    try {
      const proxiedUrl = applyProxy(url, currentProxyIndex);
      console.log(`Trying to fetch with proxy: ${proxiedUrl}`);
      const response = await fetch(proxiedUrl, fetchOptions);
      
      if (response.ok) {
        // For M3U content, validate it
        if (url.includes('.m3u') || url.includes('m3u_plus')) {
          // If response is ok but content length is very small, check if valid
          const contentLength = response.headers.get('Content-Length');
          if (contentLength && parseInt(contentLength, 10) < 10) {
            const text = await response.clone().text();
            if (text.trim() === '') {
              throw new Error('Empty response from proxy');
            }
            if (!text.includes('#EXTM3U')) {
              throw new Error('Invalid M3U content');
            }
          }
        }
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
  throw lastError || new Error('All proxies failed. This could be due to CORS restrictions or an invalid URL.');
};
