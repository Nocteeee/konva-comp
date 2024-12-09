import React, { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';

interface BoxBounds {
    width: number;
    height: number;
    x: number;
    y: number;
    rotation: number;
}

interface TransformerComponentProps {
    isSelected: boolean;
    nodeRef: React.RefObject<Konva.Node>;
    minWidth?: number;
    minHeight?: number;
    boundBoxFunc?: (oldBox: BoxBounds, newBox: BoxBounds) => BoxBounds;
}

const TransformerComponent: React.FC<TransformerComponentProps> = ({
    isSelected,
    nodeRef,
    boundBoxFunc,
}) => {
    const transformerRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
        if (isSelected && transformerRef.current && nodeRef.current) {
            transformerRef.current.nodes([nodeRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected, nodeRef]);

    if (!isSelected) return null;

    return (
        <Transformer
            ref={transformerRef}
            boundBoxFunc={boundBoxFunc}
            anchorSize={8}
            anchorCornerRadius={4}
            anchorStroke="#666"
            anchorFill="#fff"
            borderStroke="#666"
        />
    );
};

export default TransformerComponent; 