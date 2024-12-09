import React from 'react';
import { Line } from 'react-konva';

interface GuideLinesProps {
  guidelines: Array<{ x?: number; y?: number }>;
  stageWidth: number;
  stageHeight: number;
}

const GuideLines: React.FC<GuideLinesProps> = ({ guidelines, stageWidth, stageHeight }) => {
  return (
    <>
      {guidelines.map((guide, i) => {
        if (guide.x !== undefined) {
          return (
            <Line
              key={`v${i}`}
              points={[guide.x, 0, guide.x, stageHeight]}
              stroke="#0096ff"
              strokeWidth={1}
              dash={[4, 6]}
            />
          );
        } else if (guide.y !== undefined) {
          return (
            <Line
              key={`h${i}`}
              points={[0, guide.y, stageWidth, guide.y]}
              stroke="#0096ff"
              strokeWidth={1}
              dash={[4, 6]}
            />
          );
        }
        return null;
      })}
    </>
  );
};

export default GuideLines; 