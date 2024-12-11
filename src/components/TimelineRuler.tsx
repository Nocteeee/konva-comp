import { Stage, Layer, Line, Text, Group } from 'react-konva';
import { useState, useCallback, useMemo } from 'react';

interface TimelineRulerProps {
  duration: number;
  width: number;
  height: number;
}

const TimelineRuler: React.FC<TimelineRulerProps> = ({ duration, width, height }) => {
  const minScale = 0.33;
  
  // 计算实际使用的时长（原时长 + 1/5）
  const actualDuration = useMemo(() => {
    return duration * 1.2; // 增加1/5的长度
  }, [duration]);
  
  // 动态计算最大缩放比例
  const maxScale = useMemo(() => {
    const targetPixelsPerSecond = 100;
    // 计算所需的最大缩放比例，使用actualDuration
    return Math.ceil((actualDuration * targetPixelsPerSecond) / width);
  }, [actualDuration, width]);

  const [scale, setScale] = useState(minScale);
  const [offsetX, setOffsetX] = useState(0);

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

  // 获取当前可见时间范围
  const getVisibleTimeRange = useCallback(() => {
    const scaledWidth = width * scale;
    const secondsPerPixel = actualDuration / scaledWidth;
    const visibleSeconds = width * secondsPerPixel;
    return {
      start: 0,
      end: Math.ceil(visibleSeconds)
    };
  }, [actualDuration, width, scale]);

  const getTickConfig = useCallback(() => {
    const scaledWidth = width * scale;
    const pixelsPerSecond = scaledWidth / actualDuration;

    const interval = Math.ceil(80 / pixelsPerSecond)
    
    return {
      mainInterval: interval
    };
  }, [scale, width, actualDuration]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderTicks = () => {
    const { mainInterval } = getTickConfig();
    const ticks = [];
    const scaledWidth = width * scale;
    const pixelsPerSecond = scaledWidth / actualDuration;
    const { end } = getVisibleTimeRange();
    const renderEndTime = Math.max(actualDuration, end);

    // 添加顶部边框线
    ticks.push(
      <Line
        key="top-border"
        points={[0, styles.tickPadding, width, styles.tickPadding]}
        stroke={styles.borderColor}
        strokeWidth={1}
      />
    );

    // 只渲染主刻度线
    for (let time = 0; time <= renderEndTime; time += mainInterval) {
      const x = (time * pixelsPerSecond);

      // 主刻度线
      ticks.push(
        <Line
          key={`line-${time}`}
          points={[
            x,
            styles.tickPadding,
            x,
            styles.tickPadding + 20
          ]}
          stroke={styles.mainTickColor}
          strokeWidth={1}
          opacity={0.8}
        />
      );

      // 时间文本
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

    return ticks;
  };

  /**
   * 处理鼠标滚轮事件
   * @param e 滚轮事件对象
   */
  const handleWheel = (e: any) => {
    // 检查是否按住Command(Mac)或Ctrl(Windows)键
    if (!(e.evt.metaKey || e.evt.ctrlKey)) {
      return;
    }

    // 阻止默认滚动行为
    e.evt.preventDefault();

    // 缩放系数
    const scaleBy = 1.1;
    // 根据滚轮方向计算新的缩放比例
    const newScale = e.evt.deltaY < 0 ? scale * scaleBy : scale / scaleBy;
    // 计算新的每秒像素数
    const newPixelsPerSecond = (width * newScale) / actualDuration;

    // 如果是放大操作（deltaY < 0）且已经达到最大缩放，则不再放大
    if (e.evt.deltaY < 0 && newPixelsPerSecond >= 120) {  // 调整为120像素/秒
      return;
    }

    if (newScale < minScale || newScale > maxScale) {
      return;
    }
    setScale(newScale);
  };

  return (
    <div style={{ position: 'relative' }}>
      <Stage width={width} height={height - 20} onWheel={handleWheel}>
        <Layer offsetX={offsetX}>
          <Group x={0} y={10}>{renderTicks()}</Group>
        </Layer>
      </Stage>
      <div
        style={{
          width: width,
          height: '16px',
          position: 'absolute',
          bottom: -100,
          left: 0,
          overflow: 'auto'
        }}
        onScroll={(e) => {
          const scrollLeft = e.currentTarget.scrollLeft;
          setOffsetX(scrollLeft);
        }}
      >
        <div
          style={{
            width: width * scale,
            height: '100%',
            position: 'relative'
          }}
        />
      </div>
    </div>
  );
};

export default TimelineRuler; 