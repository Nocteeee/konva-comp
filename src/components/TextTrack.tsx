import { Group, Rect, Text } from 'react-konva';
import React, { useState } from 'react';
import { TextTrackProps, DragMode, Position } from '../types/timeline';
import { TIMELINE_CONFIG } from '../constants/timeline';
import { truncateText } from '../utils/timelineUtils';

/**
 * 文字轨道组件
 * 支持水平和垂直方向的拖拽，用于调整时间位置和轨道位置
 */
const TextTrack: React.FC<TextTrackProps> = ({
  id,
  text,
  startX,
  width,
  y,
  maxX,
  track,
  tracksCount,
  onDragEnd,
  onChange,
  onDrag,
  trackStartY,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [startPos, setStartPos] = useState<Position>({ x: 0, y: 0 });

  const handleDragBound = (pos: Position) => {
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
      onDrag?.(id, newY);
    }

    return {
      x: newX,
      y: dragMode === 'horizontal' ? y : newY
    };
  };

  const handleDragEnd = (e: any) => {
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
  };

  return (
    <Group
      id={id}
      x={startX}
      y={y}
      draggable
      dragBoundFunc={handleDragBound}
      onDragStart={(e) => {
        setIsDragging(true);
        setDragMode(null);
        setStartPos({ x: e.target.x(), y: e.target.y() });
      }}
      onDragEnd={handleDragEnd}
    >
      <Rect
        x={0}
        y={0}
        width={width}
        height={TIMELINE_CONFIG.TRACK.HEIGHT}
        fill={isDragging ? TIMELINE_CONFIG.TRACK.COLORS.ACTIVE : TIMELINE_CONFIG.TRACK.COLORS.BACKGROUND}
        stroke={TIMELINE_CONFIG.TRACK.COLORS.BORDER}
        cornerRadius={4}
      />
      <Text
        x={5}
        y={15 - 7}
        text={truncateText(text, width)}
        fontSize={TIMELINE_CONFIG.TRACK.FONT.SIZE}
        fontFamily={TIMELINE_CONFIG.TRACK.FONT.FAMILY}
        fill={TIMELINE_CONFIG.TRACK.COLORS.TEXT}
        width={width - 10}
        verticalAlign="middle"
      />
    </Group>
  );
};

export default React.memo(TextTrack); 