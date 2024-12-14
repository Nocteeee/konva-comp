import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Stage, Layer, Line, Text, Group, Rect } from 'react-konva';
import Konva from 'konva';
import { TimelineRulerProps, TextTrack, ImageTrack } from '../types/timeline';
import { TIMELINE_CONFIG } from '../constants/timeline';
import { calculateTrackStartY, calculateTrackY } from '../utils/timelineUtils';
import TextTrackComponent from './TextTrack';
import { formatTime } from '../utils';
import ImageTrackComponent from './ImageTrack';

/**
 * 计算缩放相关参数
 */
const calculateScaleParams = (
  width: number,
  scale: number,
  actualDuration: number
) => {
  const scaledWidth = width * scale;
  const pixelsPerSecond = scaledWidth / actualDuration;
  return { scaledWidth, pixelsPerSecond };
};

/**
 * 时间轴标尺组件
 */
const TimelineRuler: React.FC<TimelineRulerProps> = ({ 
  duration, 
  width, 
  height, 
  textTracks: initialTracks = [], 
  imageTracks: initialImageTracks = [] 
}) => {
  const stage = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState(TIMELINE_CONFIG.RULER.MIN_SCALE);
  const [offsetX, setOffsetX] = useState(0);
  const [textTracks, setTextTracks] = useState(initialTracks);
  const [targetTrack, setTargetTrack] = useState<number | null>(null);
  const [imageTracks, setImageTracks] = useState(initialImageTracks);

  // 计算实际使用的时长（原时长 + 1/5）
  const actualDuration = useMemo(() => duration * 1.2, [duration]);

  // 动态计算最大缩放比例
  const maxScale = useMemo(() => {
    const targetPixelsPerSecond = TIMELINE_CONFIG.RULER.MAX_PIXELS_PER_SECOND;
    return Math.ceil((actualDuration * targetPixelsPerSecond) / width);
  }, [actualDuration, width]);

  // 计算轨道区域的起始Y坐标
  const trackStartY = useMemo(() => {
    const totalTracks = textTracks.length + imageTracks.length;  // 计算总轨道数
    return calculateTrackStartY(height, totalTracks);
  }, [height, textTracks.length, imageTracks.length]);

  /**
   * 获取当前可见时间范围
   */
  const getVisibleTimeRange = useCallback(() => {
    const scaledWidth = width * scale;
    const secondsPerPixel = actualDuration / scaledWidth;
    const visibleSeconds = width * secondsPerPixel;
    return {
      start: 0,
      end: Math.ceil(visibleSeconds)
    };
  }, [actualDuration, width, scale]);

  /**
   * 获取刻度配置
   */
  const getTickConfig = useCallback(() => {
    const scaledWidth = width * scale;
    const pixelsPerSecond = scaledWidth / actualDuration;
    const interval = Math.ceil(80 / pixelsPerSecond);
    return { mainInterval: interval };
  }, [scale, width, actualDuration]);

  /**
   * 渲染时间刻度线和文本
   */
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
        points={[0, 0, width, 0]}
        stroke={TIMELINE_CONFIG.RULER.COLORS.BORDER}
        strokeWidth={1}
      />
    );

    // 渲染主刻度线
    for (let time = 0; time <= renderEndTime; time += mainInterval) {
      const x = time * pixelsPerSecond;
      ticks.push(
        <Line
          key={`line-${time}`}
          points={[x, 0, x, TIMELINE_CONFIG.RULER.TICK_PADDING]}
          stroke={TIMELINE_CONFIG.RULER.COLORS.MAIN_TICK}
          strokeWidth={1}
          opacity={0.8}
        />,
        <Text
          key={`text-${time}`}
          x={x + 4}
          y={5}
          text={formatTime(time)}
          fontSize={11}
          fontFamily={TIMELINE_CONFIG.TRACK.FONT.FAMILY}
          fill={TIMELINE_CONFIG.RULER.COLORS.TEXT}
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

    if (newScale < TIMELINE_CONFIG.RULER.MIN_SCALE || newScale > maxScale) {
      return;
    }
    setScale(newScale);
  };

  /**
   * 处理轨道水平拖拽结束
   */
  const handleTrackDragEnd = (id: string, newStartX: number) => {
    const { pixelsPerSecond } = calculateScaleParams(width, scale, actualDuration);
    const newStartTime = Math.max(0, Math.round(newStartX / pixelsPerSecond));

    setTextTracks(tracks => tracks.map(track => {
      if (track.id === id) {
        const duration = track.endTime - track.startTime;
        return {
          ...track,
          startTime: newStartTime,
          endTime: newStartTime + duration
        };
      }
      return track;
    }));
  };

  /**
   * 处理轨道垂直位置变化
   */
  const handleTrackChange = (id: string, newTrack: number) => {
    // 查找拖动的轨道（可能是文字或图片轨道）
    const draggedTextTrack = textTracks.find(t => t.id === id);
    const draggedImageTrack = imageTracks.find(t => t.id === id);
    
    // 查找目标位置的轨道（可能是文字或图片轨道）
    const targetTextTrack = textTracks.find(t => t.track === newTrack);
    const targetImageTrack = imageTracks.find(t => t.track === newTrack);

    // 获取被拖动的轨道和目标轨道
    const draggedTrack = draggedTextTrack || draggedImageTrack;
    const targetTrack = targetTextTrack || targetImageTrack;
    
    if (!draggedTrack || !targetTrack) return;

    // 执行动画和交换
    animateTrackSwap(targetTrack.id, draggedTrack.track, () => {
      if (draggedTextTrack) {
        // 文字轨道与其他轨道交换
        if (targetTextTrack) {
          // 文字轨道之间交换
          updateTextTracksPosition(id, newTrack, draggedTextTrack, targetTextTrack);
        } else if (targetImageTrack) {
          // 文字轨道与图片轨道交换
          updateMixedTracksPosition(
            draggedTextTrack, targetImageTrack,
            'text', 'image'
          );
        }
      } else if (draggedImageTrack) {
        // 图片轨道与其他轨道交换
        if (targetTextTrack) {
          // 图片轨道与文字轨道交换
          updateMixedTracksPosition(
            draggedImageTrack, targetTextTrack,
            'image', 'text'
          );
        } else if (targetImageTrack) {
          // 图片轨道之间交换
          updateImageTracksPosition(id, newTrack, draggedImageTrack, targetImageTrack);
        }
      }
    });
  };

  /**
   * 更新文字轨道位置
   */
  const updateTextTracksPosition = (
    draggedId: string,
    newTrack: number,
    draggedTrack: TextTrack,
    targetTrack: TextTrack
  ) => {
    setTextTracks(tracks => tracks.map(track => {
      if (track.id === draggedId) {
        return { ...track, track: newTrack };
      }
      if (track.id === targetTrack.id) {
        return { ...track, track: draggedTrack.track };
      }
      return track;
    }));
    setTargetTrack(null);
  };

  /**
   * 更新图片轨道位置
   */
  const updateImageTracksPosition = (
    draggedId: string,
    newTrack: number,
    draggedTrack: ImageTrack,
    targetTrack: ImageTrack
  ) => {
    setImageTracks(tracks => tracks.map(track => {
      if (track.id === draggedId) {
        return { ...track, track: newTrack };
      }
      if (track.id === targetTrack.id) {
        return { ...track, track: draggedTrack.track };
      }
      return track;
    }));
    setTargetTrack(null);
  };

  /**
   * 更新不同类型轨道之间的交换
   */
  const updateMixedTracksPosition = (
    draggedTrack: TextTrack | ImageTrack,
    targetTrack: TextTrack | ImageTrack,
    draggedType: 'text' | 'image',
    targetType: 'text' | 'image'
  ) => {
    if (draggedType === 'text') {
      setTextTracks(tracks => tracks.map(track => 
        track.id === draggedTrack.id ? { ...track, track: targetTrack.track } : track
      ));
      setImageTracks(tracks => tracks.map(track => 
        track.id === targetTrack.id ? { ...track, track: draggedTrack.track } : track
      ));
    } else {
      setImageTracks(tracks => tracks.map(track => 
        track.id === draggedTrack.id ? { ...track, track: targetTrack.track } : track
      ));
      setTextTracks(tracks => tracks.map(track => 
        track.id === targetTrack.id ? { ...track, track: draggedTrack.track } : track
      ));
    }
    setTargetTrack(null);
  };

  /**
   * 执行轨道交换动画
   */
  const animateTrackSwap = (targetId: string, newTrackPos: number, onComplete: () => void) => {
    const targetNode = stage.current?.findOne(`#${targetId}`);
    if (targetNode) {
      targetNode.to({
        y: trackStartY + newTrackPos * TIMELINE_CONFIG.TRACK.SPACING,
        duration: TIMELINE_CONFIG.RULER.ANIMATION_DURATION,
        onFinish: onComplete
      });
    }
  };

  /**
   * 渲染轨道背景
   */
  const renderTrackBackground = () => {
    const { scaledWidth } = calculateScaleParams(width, maxScale, actualDuration);
    const totalTracks = textTracks.length + imageTracks.length;  // 计算总轨道数
    
    return Array.from({ length: totalTracks }).map((_, index) => (
      <Group key={`track-bg-${index}`}>
        <Rect
          x={0}
          y={trackStartY + index * TIMELINE_CONFIG.TRACK.SPACING}
          width={scaledWidth}
          height={TIMELINE_CONFIG.TRACK.HEIGHT}
          fill="#FAFAFA"
          stroke={TIMELINE_CONFIG.TRACK.COLORS.BORDER}
          strokeWidth={1}
        />
        {renderTrackIndicator(index)}
      </Group>
    ));
  };

  /**
   * 渲染轨道指示线
   */
  const renderTrackIndicator = (index: number) => {
    if (index !== targetTrack) return null;
    
    const { scaledWidth } = calculateScaleParams(width, maxScale, actualDuration);
    return (
      <Line
        x={0}
        y={trackStartY + index * TIMELINE_CONFIG.TRACK.SPACING + TIMELINE_CONFIG.TRACK.HEIGHT}
        points={[0, 0, scaledWidth, 0]}
        stroke={TIMELINE_CONFIG.TRACK.COLORS.INDICATOR}
        strokeWidth={2}
      />
    );
  };

  const renderTextTracks = () => {
    const scaledWidth = width * scale;
    const pixelsPerSecond = scaledWidth / actualDuration;
    const maxX = duration * pixelsPerSecond;

    return textTracks.map((track) => {
      const startX = track.startTime * pixelsPerSecond;
      const trackWidth = (track.endTime - track.startTime) * pixelsPerSecond;
      const trackY = trackStartY + track.track * 40;  // 使用计算的起始位置

      return (
        <TextTrackComponent
          key={track.id}
          id={track.id}
          text={track.text}
          startX={startX}
          width={trackWidth}
          y={trackY}
          track={track.track}
          maxX={maxX}
          tracksCount={textTracks.length}
          isTargeted={track.track === targetTrack}
          onDragEnd={handleTrackDragEnd}
          onChange={handleTrackChange}
          onDrag={handleTrackDrag}
          trackStartY={trackStartY}
        />
      );
    });
  };

  /**
   * 处理轨道拖拽过程
   */
  const handleTrackDrag = (id: string, newY: number) => {
    // 查找拖动的轨道（可能是文字或图片轨道）
    const track = textTracks.find(t => t.id === id) || imageTracks.find(t => t.id === id);
    if (!track) return;

    const totalTracks = textTracks.length + imageTracks.length;
    const newTrack = Math.round((newY - trackStartY) / TIMELINE_CONFIG.TRACK.SPACING);

    // 检查新轨道位置是否有效
    if (newTrack !== track.track && newTrack >= 0 && newTrack < totalTracks) {
      setTargetTrack(newTrack);
    } else {
      setTargetTrack(null);
    }
  };

  const renderImageTracks = () => {
    const scaledWidth = width * scale;
    const pixelsPerSecond = scaledWidth / actualDuration;
    const maxX = duration * pixelsPerSecond;

    return imageTracks.map((track) => {
      const startX = track.startTime * pixelsPerSecond;
      const trackWidth = (track.endTime - track.startTime) * pixelsPerSecond;
      const trackY = trackStartY + track.track * 40;

      return (
        <ImageTrackComponent
          key={track.id}
          id={track.id}
          imageUrl={track.imageUrl}
          startX={startX}
          width={trackWidth}
          y={trackY}
          track={track.track}
          maxX={maxX}
          tracksCount={textTracks.length + imageTracks.length}
          isTargeted={track.track === targetTrack}
          onDragEnd={handleTrackDragEnd}
          onChange={handleTrackChange}
          onDrag={handleTrackDrag}
          trackStartY={trackStartY}
        />
      );
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <Stage ref={stage} width={width} height={height} onWheel={handleWheel}>
        <Layer offsetX={offsetX}>
          <Group x={0} y={0}>
            {renderTicks()}
            <Group>
              {renderTrackBackground()}
              {renderTextTracks()}
              {renderImageTracks()}
            </Group>
          </Group>
        </Layer>
      </Stage>
      <div
        style={{
          width,
          height: 16,
          position: 'absolute',
          bottom: 0,
          left: 0,
          overflow: 'auto'
        }}
        onScroll={(e) => setOffsetX(e.currentTarget.scrollLeft)}
      >
        <div style={{ width: width * scale, height: '100%', position: 'relative' }} />
      </div>
    </div>
  );
};

export default TimelineRuler; 