import React, { useState, useRef, useEffect } from 'react';
import { Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';

interface EditableTextProps {
  x: number;
  y: number;
  text: string;
  onChange?: (newText: string) => void;
}

const EditableText: React.FC<EditableTextProps> = ({ x, y, text: initialText, onChange }) => {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const textRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && transformerRef.current && textRef.current) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDblClick = () => {
    setIsEditing(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (onChange) {
      onChange(newText);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleSelect = () => {
    setIsSelected(true);
  };

  const handleDeselect = (e: any) => {
    // 点击空白处取消选中
    if (e.target === e.target.getStage()) {
      setIsSelected(false);
    }
  };

  if (isEditing) {
    const textPosition = textRef.current.getAbsolutePosition();
    const scale = textRef.current.getTransform().scale();
    const textWidth = textRef.current.width() * scale.x;
    const textHeight = textRef.current.height() * scale.y;
    const fontSize = textRef.current.fontSize() * scale.x;
    
    return (
      <Html>
        <textarea
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          style={{
            position: 'absolute',
            top: `${textPosition.y}px`,
            left: `${textPosition.x}px`,
            width: `${textWidth}px`,
            height: `${textHeight}px`,
            fontSize: `${fontSize}px`,
            padding: '0px',
            margin: '0px',
            border: 'none',
            resize: 'none',
            background: 'none',
            outline: 'none',
            fontFamily: 'Arial',
            lineHeight: '1',
            textAlign: 'left',
            color: '#000',
            overflow: 'hidden'
          }}
          autoFocus
        />
      </Html>
    );
  }

  return (
    <>
      <Text
        ref={textRef}
        x={x}
        y={y}
        text={text}
        draggable
        onClick={handleSelect}
        onDblClick={handleDblClick}
        fontSize={16}
        fontFamily="Arial"
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          anchorSize={8}
          anchorCornerRadius={4}
          anchorStroke="#666"
          anchorFill="#fff"
          borderStroke="#666"
          boundBoxFunc={(oldBox, newBox) => {
            const minWidth = 20;
            const minHeight = 20;
            if (newBox.width < minWidth || newBox.height < minHeight) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default EditableText; 