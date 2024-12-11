import React from 'react';
import { Stage, Layer } from 'react-konva';
import EditableImage from './components/EditableImage';
import EditableVideo from './components/EditableVideo';
import TimelineRuler from './components/TimelineRuler';

const App: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>

      <div className="App">
        <TimelineRuler
          duration={60 * 180} // 30分钟 = 1800秒
          width={window.innerWidth}
          height={60}
        />
      </div>
    </div>
  );
};

export default App; 