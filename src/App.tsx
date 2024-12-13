import React from 'react';
import { Stage, Layer } from 'react-konva';
import EditableImage from './components/EditableImage';
import EditableVideo from './components/EditableVideo';
import TimelineRuler from './components/TimelineRuler';

interface TextTrack {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  track: number;
}

const App: React.FC = () => {
  // 添加测试用的文字轨道数据
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
    },
    {
      id: '3',
      text: '第三段字幕',
      startTime: 100,
      endTime: 110,
      track: 2
    },
    // {
    //   id: '4',
    //   text: '第四段字幕',
    //   startTime: 110,
    //   endTime: 120,
    //   track: 3
    // }
  ];

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className="App">
        <TimelineRuler
          duration={60 * 2}
          width={window.innerWidth}
          height={400}
          textTracks={textTracksData}
        />
      </div>
    </div>
  );
};

export default App; 