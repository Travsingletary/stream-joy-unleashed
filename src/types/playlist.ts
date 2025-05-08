
export interface XtreamCredentials {
  username: string;
  password: string;
  url: string;
}

export interface MegaOTTCredentials {
  apiKey: string;
}

export interface Channel {
  id: string;
  name: string;
  logo?: string;
  group?: string;
  url: string;
  epgChannelId?: string; // For matching with EPG data
}

export interface Group {
  id: string;
  name: string;
  channels: Channel[];
}

export interface Playlist {
  name?: string;
  groups: Group[];
  channels: Channel[];
  lastUpdated?: string; // ISO date string
}
