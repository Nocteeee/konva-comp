import Konva from 'konva';
import { TIMELINE_CONFIG } from '../constants/timeline';

export const calculateTrackY = (trackIndex: number, startY: number): number => {
  return startY + trackIndex * TIMELINE_CONFIG.TRACK.SPACING;
};

export const calculateTrackStartY = (
  containerHeight: number,
  tracksCount: number
): number => {
  const { TICKS_HEIGHT } = TIMELINE_CONFIG.RULER;
  const { SPACING } = TIMELINE_CONFIG.TRACK;
  const tracksHeight = tracksCount * SPACING;
  const availableHeight = containerHeight - TICKS_HEIGHT;
  return TICKS_HEIGHT + (availableHeight - tracksHeight) / 2;
};

export const truncateText = (text: string, maxWidth: number): string => {
  const { SIZE, FAMILY } = TIMELINE_CONFIG.TRACK.FONT;
  const textNode = new Konva.Text({
    text,
    fontSize: SIZE,
    fontFamily: FAMILY,
  });

  if (textNode.getTextWidth() <= maxWidth - 10) {
    return text;
  }

  let truncated = text;
  while (truncated.length > 0 && textNode.getTextWidth() > maxWidth - 20) {
    truncated = truncated.slice(0, -1);
    textNode.text(truncated + '...');
  }

  return truncated + '...';
}; 