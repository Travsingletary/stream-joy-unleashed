
import React, { useRef, useEffect, useState } from 'react';

interface VideoPlayerProps {
  url: string;
  isMuted: boolean;
  isPlaying: boolean;
  onPlayStateChange: (isPlaying: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  isMuted, 
  isPlaying,
  onPlayStateChange 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Apply mute state to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  // Apply play/pause state to video element
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          onPlayStateChange(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, onPlayStateChange]);

  return (
    <video
      ref={videoRef}
      src={url}
      className="max-h-full max-w-full"
      controls={false}
      autoPlay
      muted={isMuted}
    />
  );
};

export default VideoPlayer;
