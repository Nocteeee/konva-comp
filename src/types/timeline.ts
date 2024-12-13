/**
 * 文字轨道数据结构
 */
export interface TextTrack {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  track: number;
}

/**
 * 文字轨道组件属性
 */
export interface TextTrackProps {
  id: string;
  text: string;
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
  isTargeted?: boolean;
}

/**
 * 拖拽模式类型
 */
export type DragMode = 'horizontal' | 'vertical' | null;

/**
 * 时间轴标尺组件属性
 */
export interface TimelineRulerProps {
  duration: number;
  width: number;
  height: number;
  textTracks?: TextTrack[];
}

/**
 * 位置坐标接口
 */
export interface Position {
  x: number;
  y: number;
} 