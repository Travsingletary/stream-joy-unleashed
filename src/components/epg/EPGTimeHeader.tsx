
import React, { useRef, useEffect } from 'react';
import { TimeSlot } from '../../types/epg';
import { cn } from '@/lib/utils';

interface EPGTimeHeaderProps {
  timeSlots: TimeSlot[];
  timelineWidth: number;
  scrollLeft: number;
  onScroll: (scrollLeft: number) => void;
  currentTimePosition: number;
}

const EPGTimeHeader: React.FC<EPGTimeHeaderProps> = ({
  timeSlots,
  timelineWidth,
  scrollLeft,
  onScroll,
  currentTimePosition
}) => {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft]);

  const handleScroll = () => {
    if (headerRef.current) {
      onScroll(headerRef.current.scrollLeft);
    }
  };

  return (
    <div 
      ref={headerRef}
      className="bg-black border-b border-steadystream-gold/20 overflow-x-auto scrollbar-none"
      style={{ overflowY: 'hidden' }}
      onScroll={handleScroll}
    >
      <div className="flex" style={{ width: timelineWidth, position: 'relative' }}>
        {timeSlots.map((slot, index) => (
          <div 
            key={index}
            className={cn(
              "flex-shrink-0 p-2 border-r border-steadystream-gold/10",
              "text-steadystream-gold text-sm font-medium"
            )}
            style={{ width: slot.end - slot.start }}
          >
            {slot.label}
          </div>
        ))}
        
        {/* Current time indicator */}
        {currentTimePosition > 0 && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-steadystream-bronze z-10"
            style={{ left: currentTimePosition }}
          >
            <div className="w-2 h-2 rounded-full bg-steadystream-bronze -ml-1"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EPGTimeHeader;
