
import React, { useState, useRef, useEffect } from 'react';
import { EPGData, Program } from '../../types/epg';
import EPGTimeHeader from './EPGTimeHeader';
import EPGChannel from './EPGChannel';
import { 
  generateTimeSlots, 
  getCurrentTimePosition, 
  calculateProgramWidth 
} from '../../services/epgService';
import { ScrollArea } from '../ui/scroll-area';

interface EPGGridProps {
  epgData: EPGData;
  onChannelSelect: (channelId: string) => void;
  onProgramSelect?: (program: Program) => void;
  className?: string;
}

const EPGGrid: React.FC<EPGGridProps> = ({
  epgData,
  onChannelSelect,
  onProgramSelect,
  className
}) => {
  const [scrollLeft, setScrollLeft] = useState(0);
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Generate time slots for the header
  const { slots: timeSlots, pixelsPerMinute } = generateTimeSlots(
    epgData.startTime,
    epgData.endTime,
    30 // 30-minute intervals
  );
  
  // Calculate the width of the timeline
  const timelineWidth = (epgData.endTime - epgData.startTime) / (60 * 1000) * pixelsPerMinute;
  
  // Scroll to current time on initial load
  useEffect(() => {
    const now = Date.now();
    
    // If current time is within the EPG timeline
    if (now >= epgData.startTime && now <= epgData.endTime) {
      const position = getCurrentTimePosition(epgData.startTime, pixelsPerMinute);
      setCurrentTimePosition(position);
      
      // Scroll to current time (centered)
      if (gridRef.current) {
        const containerWidth = gridRef.current.clientWidth;
        const channelColumnWidth = 192; // 12rem (w-48)
        const scrollTo = position - (containerWidth - channelColumnWidth) / 2;
        
        setScrollLeft(Math.max(0, scrollTo));
      }
    }
  }, [epgData.startTime, epgData.endTime, pixelsPerMinute]);
  
  // Update current time position every minute
  useEffect(() => {
    const updateCurrentTime = () => {
      const position = getCurrentTimePosition(epgData.startTime, pixelsPerMinute);
      setCurrentTimePosition(position);
    };
    
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [epgData.startTime, pixelsPerMinute]);
  
  const handleScroll = (newScrollLeft: number) => {
    setScrollLeft(newScrollLeft);
  };
  
  // Handle scroll of the main grid area
  const handleGridScroll = () => {
    if (gridRef.current) {
      setScrollLeft(gridRef.current.scrollLeft);
    }
  };
  
  // Scroll to the current time
  const scrollToNow = () => {
    if (currentTimePosition > 0) {
      const containerWidth = gridRef.current?.clientWidth || 800;
      const channelColumnWidth = 192; // 12rem (w-48)
      const scrollTo = currentTimePosition - (containerWidth - channelColumnWidth) / 2;
      
      setScrollLeft(Math.max(0, scrollTo));
      
      if (gridRef.current) {
        gridRef.current.scrollLeft = Math.max(0, scrollTo);
      }
    }
  };
  
  return (
    <div className={`flex flex-col h-full border border-steadystream-gold/20 rounded-md bg-black ${className || ''}`}>
      {/* EPG Header with current time indicator */}
      <div className="flex">
        {/* Empty space above channel list */}
        <div className="w-48 p-2 border-b border-r border-steadystream-gold/20 bg-steadystream-black flex justify-between items-center">
          <span className="text-steadystream-gold font-medium text-sm">Channels</span>
          <button 
            onClick={scrollToNow}
            className="text-xs bg-steadystream-gold px-2 py-1 rounded text-black hover:bg-steadystream-gold-light"
          >
            Now
          </button>
        </div>
        
        {/* Time header */}
        <EPGTimeHeader 
          timeSlots={timeSlots}
          timelineWidth={timelineWidth}
          scrollLeft={scrollLeft}
          onScroll={handleScroll}
          currentTimePosition={currentTimePosition}
        />
      </div>
      
      {/* Main grid with channels and programs */}
      <div 
        ref={gridRef}
        className="flex-1 overflow-y-auto steadystream-scrollbar"
        onScroll={handleGridScroll}
      >
        <div className="flex">
          {/* Fixed channel list */}
          <div className="w-48 flex-shrink-0">
            {epgData.channels.map(channel => (
              <div 
                key={channel.id}
                className="h-20 border-b border-r border-steadystream-gold/10 p-2 flex items-center gap-2 cursor-pointer hover:bg-steadystream-gold/10"
                onClick={() => onChannelSelect(channel.id)}
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
            ))}
          </div>
          
          {/* Scrollable program grid */}
          <div className="flex-1 relative" style={{ width: `calc(100% - 12rem)`, overflow: 'hidden' }}>
            <div style={{ width: timelineWidth, position: 'relative' }}>
              {epgData.channels.map(channel => (
                <div key={channel.id} className="flex relative h-20 border-b border-steadystream-gold/10">
                  {channel.programs.map(program => {
                    const startOffset = Math.max(0, program.start - epgData.startTime);
                    const left = (startOffset / (60 * 1000)) * pixelsPerMinute;
                    
                    const duration = program.stop - program.start;
                    const width = (duration / (60 * 1000)) * pixelsPerMinute;
                    
                    // Check if program is currently playing
                    const now = Date.now();
                    const isNowPlaying = program.start <= now && program.stop > now;
                    
                    // Calculate progress percentage
                    const progressPercentage = isNowPlaying
                      ? ((now - program.start) / (program.stop - program.start)) * 100
                      : 0;
                    
                    return (
                      <div
                        key={program.id}
                        className={`absolute top-0 h-full border-r border-steadystream-gold/10 p-2
                          hover:bg-steadystream-gold/5 cursor-pointer transition-colors
                          ${isNowPlaying ? 'bg-steadystream-gold/10' : 'bg-black/60'}`}
                        style={{
                          left: `${left}px`,
                          width: `${Math.max(width, 50)}px` // Minimum width of 50px
                        }}
                        onClick={() => onProgramSelect && onProgramSelect(program)}
                      >
                        <div className="flex flex-col h-full overflow-hidden">
                          <p className="text-sm font-medium text-white truncate">{program.title}</p>
                          {program.description && (
                            <p className="text-xs text-steadystream-secondary truncate">{program.description}</p>
                          )}
                          
                          <div className="text-xs text-steadystream-gold/70 mt-auto">
                            {new Date(program.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(program.stop).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          
                          {isNowPlaying && (
                            <div className="mt-1 h-1 bg-steadystream-gold/20 relative">
                              <div 
                                className="absolute top-0 left-0 h-full bg-steadystream-gold" 
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {/* Current time indicator line */}
              {currentTimePosition > 0 && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-steadystream-bronze z-10"
                  style={{ left: currentTimePosition }}
                ></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EPGGrid;
