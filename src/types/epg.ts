
export interface Program {
  id: string;
  title: string;
  description?: string;
  start: number; // Unix timestamp
  stop: number; // Unix timestamp
  channelId: string;
  category?: string;
  rating?: string;
  icon?: string;
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
