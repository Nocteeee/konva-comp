import { Stage, Layer, Line, Text, Group, Rect } from 'react-konva';
import { useState, useCallback } from 'react';

interface TimelineRulerProps {
  duration: number;
  width: number;
  height: number;
}

const TimelineRuler: React.FC<TimelineRulerProps> = ({ duration, width, height }) => {
  const minScale = 0.33;
  const maxScale = 10;
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
    // 计算实际缩放后的宽度
    const scaledWidth = width * scale;
    // 计算每像素代表的秒数
    const secondsPerPixel = duration / scaledWidth;
    // 计算当前可见区域的总秒数
    const visibleSeconds = width * secondsPerPixel;
    // 返回可见时间范围,从0开始到可见秒数(向上取整)
    return {
      start: 0,
      end: Math.ceil(visibleSeconds)
    };
  }, [duration, width, scale]);

  const getTickConfig = useCallback(() => {
    const scaledWidth = width * scale;
    const pixelsPerSecond = scaledWidth / duration;
    console.log('pixelsPerSecond', pixelsPerSecond);

    // 根据缩放比例计算合适的时间间隔
    let interval = Math.ceil(80 / pixelsPerSecond)

    return {
      mainInterval: interval
    };
  }, [scale, width, duration]);

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
    const pixelsPerSecond = scaledWidth / duration;
    const { end } = getVisibleTimeRange();
    const renderEndTime = Math.max(
      duration,
      end + (scaledWidth > width ? mainInterval * 2 : mainInterval));

    // 添加顶部边框线
    ticks.push(
      <Line
        key="top-border"
        points={[0, styles.tickPadding, width, styles.tickPadding]}
        stroke={styles.borderColor}
        strokeWidth={1}
      />
    );
    console.log('renderEndTime', renderEndTime);
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
    // 阻止默认滚动行为
    e.evt.preventDefault();

    // 缩放系数
    const scaleBy = 1.1;
    // 根据滚轮方向计算新的缩放比例
    const newScale = e.evt.deltaY < 0 ? scale * scaleBy : scale / scaleBy;
    // 计算新的每秒像素数
    // 计算新的pixelsPerSecond
    const newPixelsPerSecond = (width * newScale) / duration;

    // 如果是放大操作（deltaY < 0）且已经达到最大缩放，则不再放大
    if (e.evt.deltaY < 0 && newPixelsPerSecond >= 120) {  // 调整为120像素/秒
      return;
    }

    if (newScale < minScale || newScale > maxScale) {
      return;
    }
    console.log('newScale', newScale);
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