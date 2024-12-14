import { useState, useCallback } from 'react';
import { DragMode, Position } from '../types/timeline';
import { TIMELINE_CONFIG } from '../constants/timeline';

interface UseTrackDragProps {
  id: string;
  startX: number;
  width: number;
  y: number;
  maxX: number;
  track: number;
  tracksCount: number;
  trackStartY: number;
  onDragEnd?: (id: string, newStartX: number) => void;
  onChange?: (id: string, newTrack: number) => void;
  onDrag?: (id: string, newY: number) => void;
}

export const useTrackDrag = ({
  id,
  startX,
  width,
  y,
  maxX,
  track,
  tracksCount,
  trackStartY,
  onDragEnd,
  onChange,
  onDrag,
}: UseTrackDragProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });

  const handleDragBound = useCallback((pos: Position) => {
    if (!dragMode) {
      const dx = Math.abs(pos.x - startPos.x);
      const dy = Math.abs(pos.y - startPos.y);
      if (dx > 5 || dy > 5) {
        setDragMode(dy > dx ? 'vertical' : 'horizontal');
      }
    }

    const newX = dragMode === 'vertical' ? startX : Math.max(0, Math.min(pos.x, maxX - width));
    const minY = trackStartY;
    const maxY = minY + (tracksCount - 1) * TIMELINE_CONFIG.TRACK.SPACING;
    const newY = Math.max(minY, Math.min(pos.y, maxY));

    if (dragMode === 'vertical') {
      requestAnimationFrame(() => {
        onDrag?.(id, newY);
      });
    }

    return {
      x: newX,
      y: dragMode === 'horizontal' ? y : newY
    };
  }, [dragMode, startPos, startX, maxX, width, trackStartY, tracksCount, y, id, onDrag]);

  const handleDragEnd = useCallback((e: any) => {
    setIsDragging(false);
    setDragMode(null);
    const newX = e.target.x();
    const newY = e.target.y();
    
    const newTrack = Math.round((newY - trackStartY) / TIMELINE_CONFIG.TRACK.SPACING);
    
    if (dragMode === 'horizontal') {
      onDragEnd?.(id, newX);
    } else if (dragMode === 'vertical') {
      const targetY = trackStartY + newTrack * TIMELINE_CONFIG.TRACK.SPACING;
      
      if (newTrack !== track) {
        e.target.to({
          y: targetY,
          duration: TIMELINE_CONFIG.RULER.ANIMATION_DURATION,
          onFinish: () => {
            onChange?.(id, newTrack);
          }
        });
      } else {
        e.target.to({
          y: y,
          duration: TIMELINE_CONFIG.RULER.ANIMATION_DURATION
        });
      }
    }
  }, [dragMode, trackStartY, id, onDragEnd, track, onChange, y]);

  const handleDragStart = useCallback((e: any) => {
    setIsDragging(true);
    setDragMode(null);
    setStartPos({ x: e.target.x(), y: e.target.y() });
  }, []);

  return {
    isDragging,
    dragBoundFunc: handleDragBound,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd
  };
}; 