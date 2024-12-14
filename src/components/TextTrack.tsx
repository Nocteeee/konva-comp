import { Group, Rect, Text } from 'react-konva';
import React from 'react';
import { TextTrackProps } from '../types/timeline';
import { TIMELINE_CONFIG } from '../constants/timeline';
import { truncateText } from '../utils/timelineUtils';
import { useTrackDrag } from '../hooks/useTrackDrag';

const TextTrack: React.FC<TextTrackProps> = (props) => {
  const { isDragging, dragBoundFunc, onDragStart, onDragEnd } = useTrackDrag(props);

  return (
    <Group
      id={props.id}
      x={props.startX}
      y={props.y}
      draggable
      dragBoundFunc={dragBoundFunc}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <Rect
        x={0}
        y={0}
        width={props.width}
        height={TIMELINE_CONFIG.TRACK.HEIGHT}
        fill={isDragging ? TIMELINE_CONFIG.TRACK.COLORS.ACTIVE : TIMELINE_CONFIG.TRACK.COLORS.BACKGROUND}
        stroke={TIMELINE_CONFIG.TRACK.COLORS.BORDER}
        cornerRadius={4}
      />
      <Text
        x={5}
        y={15 - 7}
        text={truncateText(props.text, props.width)}
        fontSize={TIMELINE_CONFIG.TRACK.FONT.SIZE}
        fontFamily={TIMELINE_CONFIG.TRACK.FONT.FAMILY}
        fill={TIMELINE_CONFIG.TRACK.COLORS.TEXT}
        width={props.width - 10}
        verticalAlign="middle"
      />
    </Group>
  );
};

export default React.memo(TextTrack); 