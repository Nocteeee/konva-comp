import React, { useEffect, useState } from 'react';
import { Image } from 'react-konva';
import EditableMedia, { EditableMediaProps } from './EditableMedia';

const EditableImage: React.FC<EditableMediaProps> = (props) => {
  const { x, y, width, height, src } = props;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const { mediaRef, handlers, renderGuideLines, renderTransformer } = EditableMedia();

  useEffect(() => {
    const img = new window.Image();
    
    img.onerror = (event: Event | string) => {
      console.error('Image error:', event);
    };

    img.onload = () => {
      setImage(img);
    };

    img.src = src;
    img.crossOrigin = 'anonymous';

    return () => {
      setImage(null);
    };
  }, [src]);

  return (
    <>
      <Image
        ref={mediaRef}
        x={x}
        y={y}
        width={width}
        height={height}
        draggable
        onClick={handlers.handleSelect}
        onTap={handlers.handleSelect}
        onDragMove={handlers.handleDragMove}
        onDragEnd={handlers.handleDragEnd}
        image={image || undefined}
      />
      {renderGuideLines()}
      {renderTransformer()}
    </>
  );
};

export default EditableImage; 