export interface Program {
  id: string;
  title: string;
  description?: string;
  start: number; // Unix timestamp of program start
  stop: number; // Unix timestamp of program end (renaming to match the fix needed)
  end?: number; // Adding this for backward compatibility with existing code
  channelId: string;
  category?: string;
  poster?: string;
  rating?: string;
  episodeTitle?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  icon?: string; // Adding the missing icon property
}

export interface EPGChannel {
  id: string;
  name: string;
  icon?: string;
  programs: Program[];
}

export interface EPGData {
  channels: EPGChannel[];
  startTime: number; // Unix timestamp for grid start
  endTime: number; // Unix timestamp for grid end
}

export interface EPGGridProps {
  epgData: EPGData;
  channelList: any[]; // This should match your Channel type
  onChannelSelect: (channelId: string) => void;
  onProgramSelect?: (program: Program) => void;
}

export interface TimeSlot {
  start: number;
  end: number;
  label: string;
}
