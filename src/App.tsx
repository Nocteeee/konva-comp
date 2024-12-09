import React from 'react';
import { Stage, Layer } from 'react-konva';
import EditableImage from './components/EditableImage';
import EditableVideo from './components/EditableVideo';

const App: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {/* 图片示例 */}
          <EditableImage
            x={100}
            y={100}
            width={300}
            height={200}
            src="/path/to/your/image.jpg"
          />
          
          {/* 视频示例 */}
          <EditableVideo
            x={500}
            y={100}
            width={300}
            height={200}
            src="/path/to/your/video.mp4"
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default App; 