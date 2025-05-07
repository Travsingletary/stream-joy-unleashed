
/**
 * Store EPG URL to local storage
 */
export const storeEPGUrl = (url: string): void => {
  localStorage.setItem('steadystream_epg_url', url);
};

/**
 * Retrieve EPG URL from local storage
 */
export const getStoredEPGUrl = (): string | null => {
  return localStorage.getItem('steadystream_epg_url');
};
