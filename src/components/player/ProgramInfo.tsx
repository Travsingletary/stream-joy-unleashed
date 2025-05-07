
import React from 'react';
import { Card } from '@/components/ui/card';
import { Program } from '@/types/epg';
import { Channel } from '@/types/playlist';

interface ProgramInfoProps {
  currentProgram: Program | null;
  channel: Channel;
}

const ProgramInfo: React.FC<ProgramInfoProps> = ({ currentProgram, channel }) => {
  if (!currentProgram) {
    return null;
  }
  
  return (
    <Card className="bg-black border-t border-steadystream-gold/20 rounded-none">
      <div className="p-3 flex items-center justify-between">
        <div>
          <h3 className="text-steadystream-gold-light font-medium text-lg">
            {currentProgram.title}
          </h3>
          <p className="text-steadystream-secondary text-sm">
            {new Date(currentProgram.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' - '}
            {new Date(currentProgram.end || currentProgram.stop).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {currentProgram.category ? ` • ${currentProgram.category}` : ''}
          </p>
        </div>
        <div className="text-right">
          <h4 className="text-steadystream-gold-light">{channel.name}</h4>
          {channel.group && (
            <p className="text-steadystream-secondary text-sm">{channel.group}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProgramInfo;
