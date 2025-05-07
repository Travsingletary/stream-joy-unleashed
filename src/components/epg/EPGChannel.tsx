
import React from 'react';
import { EPGChannel, Program } from '../../types/epg';
import { cn } from '@/lib/utils';

interface EPGChannelProps {
  channel: EPGChannel;
  timeStart: number;
  pixelsPerMinute: number;
  onChannelSelect: (channelId: string) => void;
  onProgramSelect?: (program: Program) => void;
}

const EPGChannel: React.FC<EPGChannelProps> = ({
  channel,
  timeStart,
  pixelsPerMinute,
  onChannelSelect,
  onProgramSelect
}) => {
  const handleChannelClick = () => {
    onChannelSelect(channel.id);
  };

  const handleProgramClick = (program: Program) => {
    if (onProgramSelect) {
      onProgramSelect(program);
    }
  };

  // Calculate if program is currently playing
  const isNowPlaying = (program: Program) => {
    const now = Date.now();
    return program.start <= now && program.stop > now;
  };

  // Calculate progress percentage for currently playing programs
  const getProgressPercentage = (program: Program) => {
    if (!isNowPlaying(program)) return 0;
    
    const now = Date.now();
    const total = program.stop - program.start;
    const elapsed = now - program.start;
    return (elapsed / total) * 100;
  };

  // Calculate position and width based on program times
  const getProgramStyle = (program: Program) => {
    const startOffset = Math.max(0, program.start - timeStart);
    const left = (startOffset / (60 * 1000)) * pixelsPerMinute;
    
    const duration = program.stop - program.start;
    const width = (duration / (60 * 1000)) * pixelsPerMinute;
    
    return {
      left: `${left}px`,
      width: `${Math.max(width, 50)}px` // Minimum width of 50px
    };
  };

  return (
    <div className="flex relative h-20 border-b border-steadystream-gold/10">
      {/* Channel info */}
      <div 
        className="w-48 bg-steadystream-black p-2 flex items-center gap-2 cursor-pointer hover:bg-steadystream-gold/10"
        onClick={handleChannelClick}
      >
        {channel.icon ? (
          <img 
            src={channel.icon} 
            alt={channel.name} 
            className="w-8 h-8 object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <div className="w-8 h-8 bg-steadystream-gold/20 rounded-sm flex items-center justify-center">
            <span className="text-xs text-steadystream-gold">TV</span>
          </div>
        )}
        <div className="truncate">
          <p className="text-steadystream-gold-light text-sm font-medium truncate">{channel.name}</p>
        </div>
      </div>
      
      {/* Programs */}
      <div className="flex-1 relative">
        {channel.programs.map(program => (
          <div
            key={program.id}
            className={cn(
              "absolute top-0 h-full border-r border-steadystream-gold/10 p-2",
              "hover:bg-steadystream-gold/5 cursor-pointer transition-colors",
              isNowPlaying(program) ? "bg-steadystream-gold/10" : "bg-black/60"
            )}
            style={getProgramStyle(program)}
            onClick={() => handleProgramClick(program)}
          >
            <div className="flex flex-col h-full overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{program.title}</p>
              {program.description && (
                <p className="text-xs text-steadystream-secondary truncate">{program.description}</p>
              )}
              
              {/* Time display */}
              <div className="text-xs text-steadystream-gold/70 mt-auto">
                {new Date(program.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(program.stop).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              {/* Progress bar for currently playing */}
              {isNowPlaying(program) && (
                <div className="mt-1 h-1 bg-steadystream-gold/20 relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-steadystream-gold" 
                    style={{ width: `${getProgressPercentage(program)}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EPGChannel;
