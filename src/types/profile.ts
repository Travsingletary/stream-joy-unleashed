
export interface Profile {
  id: string;
  name: string;
  avatar?: string;
  favorites: string[];
  watchHistory: WatchHistoryItem[];
  lastWatched?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WatchHistoryItem {
  channelId: string;
  name: string;
  logo?: string;
  timestamp: number;
  watchDuration: number;
  genre?: string;
  category?: string;
  timeOfDay?: string; // morning, afternoon, evening, night
}

export interface ProfileContextType {
  profiles: Profile[];
  currentProfile: Profile | null;
  addProfile: (profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProfile: (profile: Profile) => void;
  deleteProfile: (profileId: string) => void;
  switchProfile: (profileId: string) => void;
}
