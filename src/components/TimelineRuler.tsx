import { Stage, Layer, Line, Text, Group, Rect } from 'react-konva';
import { useState, useCallback } from 'react';

interface TimelineRulerProps {
  duration: number;
  width: number;
  height: number;
}

const TimelineRuler: React.FC<TimelineRulerProps> = ({ duration, width, height }) => {
  const initialScale = 0.67;
  const [scale, setScale] = useState(initialScale);
  const minScale = 0.33;
  const maxScale = 3;
  
  const styles = {
    background: '#FFFFFF',
    mainTickColor: '#333333',
    subTickColor: '#999999',
    textColor: '#666666',
    currentTimeColor: '#1890FF',
    borderColor: '#E8E8E8',
    rulerHeight: height - 20,
    tickPadding: 15,
  };

  const getVisibleTimeRange = useCallback(() => {
    const scaledWidth = width * scale;
    const secondsPerPixel = duration / scaledWidth;
    const visibleSeconds = width * secondsPerPixel;
    return {
      start: 0,
      end: Math.ceil(visibleSeconds)
    };
  }, [duration, width, scale]);

  const getTickConfig = useCallback(() => {
    if (scale >= 2) {
      return {
        mainInterval: 60,
        subInterval: 15,
        showText: true
      };
    } else if (scale >= 1) {
      return {
        mainInterval: 120,
        subInterval: 30,
        showText: true
      };
    } else {
      return {
        mainInterval: 300,
        subInterval: 60,
        showText: true
      };
    }
  }, [scale]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderTicks = () => {
    const { mainInterval, subInterval, showText } = getTickConfig();
    const ticks = [];
    const scaledWidth = width * scale;
    const pixelsPerSecond = scaledWidth / duration;
    const { end } = getVisibleTimeRange();
    const renderEndTime = Math.max(duration, end + mainInterval);

    // 添加背景和边框
    ticks.push(
      <Rect
        key="background"
        x={0}
        y={0}
        width={width}
        height={styles.rulerHeight}
        fill={styles.background}
        stroke={styles.borderColor}
        strokeWidth={1}
        shadowColor="rgba(0,0,0,0.05)"
        shadowBlur={3}
        shadowOffsetY={1}
        cornerRadius={4}
      />
    );

    // 添加顶部边框线
    ticks.push(
      <Line
        key="top-border"
        points={[0, styles.tickPadding, width, styles.tickPadding]}
        stroke={styles.borderColor}
        strokeWidth={1}
      />
    );

    for (let time = 0; time <= renderEndTime; time += subInterval) {
      const x = (time * pixelsPerSecond);
      const isMainTick = time % mainInterval === 0;
      
      // 刻度线（从上往下画）
      ticks.push(
        <Line
          key={`line-${time}`}
          points={[
            x, 
            styles.tickPadding, 
            x, 
            styles.tickPadding + (isMainTick ? 20 : 12)
          ]}
          stroke={isMainTick ? styles.mainTickColor : styles.subTickColor}
          strokeWidth={isMainTick ? 1 : 0.5}
          opacity={isMainTick ? 0.8 : 0.4}
        />
      );

      // 时间文本（放在刻度线右侧）
      if (isMainTick && showText) {
        ticks.push(
          <Text
            key={`text-${time}`}
            x={x + 4}
            y={styles.tickPadding + 4}
            text={formatTime(time)}
            fontSize={11}
            fontFamily="Arial"
            fill={styles.textColor}
            opacity={0.85}
            align="left"
          />
        );
      }
    }

    return ticks;
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? scale * scaleBy : scale / scaleBy;
    if (newScale >= minScale && newScale <= maxScale) {
      setScale(newScale);
    }
  };

  return (
    <Stage width={width} height={height} onWheel={handleWheel}>
      <Layer>
        <Group x={0} y={10}>{renderTicks()}</Group>
      </Layer>
    </Stage>
  );
};

export default TimelineRuler; 