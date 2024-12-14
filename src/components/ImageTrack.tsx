import { Group, Rect, Image } from 'react-konva';
import React, { useEffect, useState } from 'react';
import { ImageTrackProps } from '../types/timeline';
import { TIMELINE_CONFIG } from '../constants/timeline';
import { useTrackDrag } from '../hooks/useTrackDrag';

/**
 * 图片轨道组件
 * 支持水平和垂直方向的拖拽，用于调整时间位置和轨道位置
 */
const ImageTrack: React.FC<ImageTrackProps> = (props) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const { isDragging, dragBoundFunc, onDragStart, onDragEnd } = useTrackDrag(props);

  // 加载图片
  useEffect(() => {
    const img = new window.Image();
    img.src = props.imageUrl;
    img.onload = () => {
      setImage(img);
    };
  }, [props.imageUrl]);

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
      {image && (
        <Image
          x={5}
          y={2}
          image={image}
          width={props.width - 10}
          height={TIMELINE_CONFIG.TRACK.HEIGHT - 4}
          cornerRadius={2}
        />
      )}
    </Group>
  );
};

export default React.memo(ImageTrack); 