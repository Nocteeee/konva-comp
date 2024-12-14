import React from 'react';
import { Stage, Layer } from 'react-konva';
import TimelineRuler from './components/TimelineRuler';
import { TextTrack, ImageTrack } from './types/timeline';

const App: React.FC = () => {
  // 文字轨道测试数据
  const textTracksData: TextTrack[] = [
    {
      id: '1',
      text: '第一段字幕内容',
      startTime: 0,
      endTime: 50,
      track: 0
    },
    {
      id: '2',
      text: '第二段字幕内容较长，可能会被省略显示',
      startTime: 50,
      endTime: 100,
      track: 1
    }
  ];

  // 图片轨道测试数据
  const imageTracksData: ImageTrack[] = [
    {
      id: 'img1',
      imageUrl: 'https://picsum.photos/200/100',  // 使用随机图片作为测试
      startTime: 20,
      endTime: 80,
      track: 2
    },
    {
      id: 'img2',
      imageUrl: 'https://picsum.photos/200/100?random=2',
      startTime: 90,
      endTime: 120,
      track: 3
    }
  ];

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className="App">
        <TimelineRuler
          duration={60 * 2}
          width={window.innerWidth}
          height={400}
          textTracks={textTracksData}
          imageTracks={imageTracksData}
        />
      </div>
    </div>
  );
};

export default App; 