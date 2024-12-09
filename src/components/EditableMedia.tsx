import React, { useRef, useState } from 'react';
import { Image } from 'react-konva';
import Konva from 'konva';
import GuideLines from './GuideLines';
import { calculateGuides } from '../utils/alignmentGuides';
import TransformerComponent from './TransformerComponent';

export interface EditableMediaProps {
    x: number;
    y: number;
    width: number;
    height: number;
    src: string;
}

interface EditableMediaReturn {
    mediaRef: React.RefObject<Konva.Image>;
    isSelected: boolean;
    guidelines: Array<{ x?: number; y?: number }>;
    handlers: {
        handleDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
        handleDragEnd: () => void;
        handleSelect: () => void;
    };
    renderGuideLines: () => JSX.Element;
    renderTransformer: () => JSX.Element;
}

const EditableMedia = (): EditableMediaReturn => {
    const mediaRef = useRef<Konva.Image>(null);
    const [isSelected, setIsSelected] = useState(false);
    const [guidelines, setGuidelines] = useState<Array<{ x?: number; y?: number }>>([]);

    const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
        const node = mediaRef.current;
        if (!node) return;

        const newGuidelines = calculateGuides(node);
        setGuidelines(newGuidelines);
    };

    const handleDragEnd = () => {
        setGuidelines([]);
    };

    const handleSelect = () => {
        setIsSelected(true);
    };

    return {
        mediaRef,
        isSelected,
        guidelines,
        handlers: {
            handleDragMove,
            handleDragEnd,
            handleSelect
        },
        renderGuideLines: () => (
            <GuideLines
                guidelines={guidelines}
                stageWidth={window.innerWidth}
                stageHeight={window.innerHeight}
            />
        ),
        renderTransformer: () => (
            <TransformerComponent
                isSelected={isSelected}
                nodeRef={mediaRef}
            />
        )
    };
};

export default EditableMedia; 