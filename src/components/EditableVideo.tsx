import React, { useRef, useEffect, useState } from 'react';
import { Image, Transformer } from 'react-konva';
import Konva from 'konva';
import GuideLines from './GuideLines';
import { calculateGuides } from '../utils/alignmentGuides';

interface EditableVideoProps {
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
}

const EditableVideo: React.FC<EditableVideoProps> = ({ x, y, width, height, src }) => {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isSelected, setIsSelected] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [guidelines, setGuidelines] = useState<Array<{ x?: number; y?: number }>>([]);

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = imageRef.current;
    if (!node) return;
    
    const newGuidelines = calculateGuides(node);
    setGuidelines(newGuidelines);
  };

  const handleDragEnd = () => {
    setGuidelines([]);
  };

  useEffect(() => {
    const video = document.createElement('video');
    
    video.onerror = (e) => {
      console.error('Video error:', e);
    };

    video.addEventListener('loadeddata', () => {
      console.log('First frame loaded');
      video.currentTime = 0;
      video.pause();
      setVideoElement(video);
    });

    video.src = src;
    video.crossOrigin = 'anonymous';
    video.controls = false;
    video.preload = 'auto';
    videoRef.current = video;

    const layer = imageRef.current?.getLayer();
    
    const anim = new Konva.Animation(() => {
      if (imageRef.current && video.readyState >= 2) {
        imageRef.current.image(video);
      }
    }, layer);

    const handleDoubleClick = () => {
      if (video.paused) {
        video.play().catch(e => console.error('Play failed:', e));
        anim.start();
      } else {
        video.pause();
        anim.stop();
      }
    };

    if (imageRef.current) {
      imageRef.current.on('dblclick', handleDoubleClick);
    }

    return () => {
      anim.stop();
      video.pause();
      setVideoElement(null);
      if (imageRef.current) {
        imageRef.current.off('dblclick');
      }
    };
  }, [src]);

  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleSelect = () => {
    setIsSelected(true);
  };

  return (
    <>
      <Image
        ref={imageRef}
        x={x}
        y={y}
        width={width}
        height={height}
        draggable
        onClick={handleSelect}
        onTap={handleSelect}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        image={videoElement || undefined}
      />
      <GuideLines 
        guidelines={guidelines}
        stageWidth={window.innerWidth}
        stageHeight={window.innerHeight}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            const minWidth = 50;
            const minHeight = 50;
            if (newBox.width < minWidth || newBox.height < minHeight) {
              return oldBox;
            }
            return newBox;
          }}
          anchorSize={8}
          anchorCornerRadius={4}
          anchorStroke="#666"
          anchorFill="#fff"
          borderStroke="#666"
        />
      )}
    </>
  );
};

export default EditableVideo; 