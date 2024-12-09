import React, { useState, useRef } from 'react';
import { Stage, Layer, Line, Text, Rect } from 'react-konva';
import Konva from 'konva';

interface Clip {
  id: string;
  startTime: number;  // 毫秒
  duration: number;   // 毫秒
  color?: string;
}

interface TimelineRulerProps {
  width: number;
  height: number;
  clips?: Clip[];
  currentTime?: number;
  pixelsPerSecond?: number;
  onTimeChange?: (time: number) => void;
}

const TimelineRuler: React.FC<TimelineRulerProps> = ({ 
  width, 
  height,
  clips = [],
  currentTime = 0,
  pixelsPerSecond = 100,
  onTimeChange
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  // 绘制时间刻度
  const drawTimeMarks = () => {
    const marks: JSX.Element[] = [];
    const startX = Math.floor(-position.x / (pixelsPerSecond * scale)) * pixelsPerSecond * scale;
    const endX = startX + (width / scale) + 200;
    const mainStep = pixelsPerSecond * scale;
    
    // 基准线
    marks.push(
      <Line
        key="baseline"
        points={[0, height - 25, width, height - 25]}
        stroke="#666"
        strokeWidth={1}
      />
    );

    // 根据缩放级别决定刻度精度
    const showMilliseconds = scale > 2;
    const subSteps = showMilliseconds ? 10 : 4;

    for (let x = startX; x < endX; x += mainStep) {
      // 主刻度线
      marks.push(
        <Line
          key={`line-${x}`}
          points={[x, height - 25, x, height - 10]}
          stroke="#333"
          strokeWidth={1}
        />
      );

      // 小刻度线
      for (let i = 1; i < subSteps; i++) {
        const subX = x + (mainStep * i) / subSteps;
        marks.push(
          <Line
            key={`subline-${subX}`}
            points={[subX, height - 25, subX, height - 20]}
            stroke="#999"
            strokeWidth={0.5}
          />
        );
      }

      // 时间文本
      const seconds = x / (pixelsPerSecond * scale);
      const timeText = showMilliseconds 
        ? `${seconds.toFixed(2)}s`
        : `${Math.floor(seconds)}s`;
      
      marks.push(
        <Text
          key={`text-${x}`}
          x={x - 15}
          y={height - 45}
          text={timeText}
          fontSize={12}
          fill="#333"
          width={30}
          align="center"
        />
      );
    }
    return marks;
  };

  // 绘制剪辑块
  const drawClips = () => {
    return clips.map(clip => {
      const x = clip.startTime * (pixelsPerSecond * scale) / 1000;
      const width = clip.duration * (pixelsPerSecond * scale) / 1000;
      
      return (
        <React.Fragment key={clip.id}>
          <Rect
            x={x}
            y={10}
            width={width}
            height={height - 60}
            fill={clip.color || '#4a9eff'}
            opacity={0.6}
            cornerRadius={4}
          />
        </React.Fragment>
      );
    });
  };

  // 绘制播放指针
  const drawPlayhead = () => {
    const x = currentTime * (pixelsPerSecond * scale) / 1000;
    return (
      <Line
        x={x}
        points={[0, 0, 0, height]}
        stroke="#ff0000"
        strokeWidth={2}
        draggable
        onDragMove={(e) => {
          const newTime = (e.target.x() * 1000) / (pixelsPerSecond * scale);
          onTimeChange?.(newTime);
        }}
      />
    );
  };

  // 处理拖动
  const handleDragStart = (e: Konva.KonvaEventObject<MouseEvent>) => {
    isDragging.current = true;
    lastPosition.current = {
      x: e.evt.clientX,
      y: e.evt.clientY,
    };
  };

  const handleDragMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDragging.current) return;

    const newPosition = {
      x: position.x + (e.evt.clientX - lastPosition.current.x),
      y: 0,
    };

    setPosition(newPosition);
    lastPosition.current = {
      x: e.evt.clientX,
      y: e.evt.clientY,
    };
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  // 处理缩放
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const oldScale = scale;
    const mousePointTo = {
      x: e.evt.clientX / oldScale - position.x / oldScale,
      y: 0,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    
    setScale(newScale);
    
    const newPos = {
      x: -(mousePointTo.x - e.evt.clientX / newScale) * newScale,
      y: 0,
    };
    
    setPosition(newPos);
  };

  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onWheel={handleWheel}
    >
      <Layer>
        {drawTimeMarks()}
        {drawClips()}
        {drawPlayhead()}
      </Layer>
    </Stage>
  );
};

export default TimelineRuler; 