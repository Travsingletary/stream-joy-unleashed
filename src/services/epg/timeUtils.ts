
import { TimeSlot } from "../../types/epg";

/**
 * Generate time slots for the EPG grid
 */
export const generateTimeSlots = (
  startTime: number,
  endTime: number,
  intervalMinutes: number = 30
): { slots: TimeSlot[], pixelsPerMinute: number } => {
  const slots = [];
  const intervalMs = intervalMinutes * 60 * 1000;
  const totalMinutes = (endTime - startTime) / (60 * 1000);
  const pixelsPerMinute = 5; // 5px per minute
  
  // Round start time down to nearest intervalMinutes
  const roundedStart = Math.floor(startTime / intervalMs) * intervalMs;
  
  // Create slots
  for (let time = roundedStart; time < endTime; time += intervalMs) {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    slots.push({
      start: time,
      end: time + intervalMs,
      label: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    });
  }
  
  return { slots, pixelsPerMinute };
};

/**
 * Get current time position for progress bars
 */
export const getCurrentTimePosition = (
  startTime: number,
  pixelsPerMinute: number
): number => {
  const now = Date.now();
  const minutesSinceStart = (now - startTime) / (60 * 1000);
  return minutesSinceStart * pixelsPerMinute;
};

/**
 * Calculate program width based on duration
 */
export const calculateProgramWidth = (
  start: number,
  end: number,
  pixelsPerMinute: number
): number => {
  const durationMinutes = (end - start) / (60 * 1000);
  return Math.max(durationMinutes * pixelsPerMinute, 50); // Minimum width of 50px
};
