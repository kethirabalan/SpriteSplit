import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer } from 'react-konva';
import Konva from 'konva';
import { useSpriteStore } from '../../store/useSpriteStore';

export const CanvasEditor: React.FC = () => {
  const { imageElement, boxes, updateBox, selectedBoxIds, setSelectedBoxIds, toggleSelectBoxId, deleteBoxes, toolMode, addBox, updateSettings, setToolMode } = useSpriteStore();
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  
  const [stageScale, setStageScale] = useState(1);
  const [stageX, setStageX] = useState(0);
  const [stageY, setStageY] = useState(0);

  // Initialize stage view to fit image with some padding
  useEffect(() => {
    if (imageElement && stageRef.current) {
      const container = stageRef.current.container();
      const padding = 40;
      
      const scaleX = (container.clientWidth - padding * 2) / imageElement.width;
      const scaleY = (container.clientHeight - padding * 2) / imageElement.height;
      const initialScale = Math.min(scaleX, scaleY, 1); // Cap at 1 so we don't scale up small images too much
      
      setStageScale(initialScale);
      
      // Center image
      setStageX((container.clientWidth - imageElement.width * initialScale) / 2);
      setStageY((container.clientHeight - imageElement.height * initialScale) / 2);
    }
  }, [imageElement]);

  useEffect(() => {
    if (transformerRef.current) {
      if (selectedBoxIds.length > 0) {
        const stage = transformerRef.current.getStage();
        const selectedNodes = selectedBoxIds
          .map((id) => stage?.findOne(`#${id}`))
          .filter((node): node is Konva.Node => node !== undefined);
        
        transformerRef.current.nodes(selectedNodes);
        transformerRef.current.getLayer()?.batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    }
  }, [selectedBoxIds]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field (like the color picker)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBoxIds.length > 0) {
        deleteBoxes(selectedBoxIds);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBoxIds, deleteBoxes]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    if (!stageRef.current) return;

    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    setStageScale(newScale);
    setStageX(pointer.x - mousePointTo.x * newScale);
    setStageY(pointer.y - mousePointTo.y * newScale);
  };

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (toolMode === 'pan') return;

    if (toolMode === 'colorPick' && imageElement) {
      const stage = e.target.getStage();
      if (stage) {
        const pointer = stage.getRelativePointerPosition();
        if (
          pointer &&
          pointer.x >= 0 &&
          pointer.x < imageElement.width &&
          pointer.y >= 0 &&
          pointer.y < imageElement.height
        ) {
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(imageElement, Math.floor(pointer.x), Math.floor(pointer.y), 1, 1, 0, 0, 1, 1);
            const data = ctx.getImageData(0, 0, 1, 1).data;
            const r = data[0];
            const g = data[1];
            const b = data[2];
            const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            updateSettings({ colorKey: hex });
            setToolMode('select');
          }
        }
      }
      return;
    }
    
    // Clicked on empty area - deselect
    if (e.target === e.target.getStage() || e.target.name() === 'backgroundImage') {
      setSelectedBoxIds([]);
      
      if (toolMode === 'add') {
        const stage = e.target.getStage();
        if (stage) {
          const pointer = stage.getRelativePointerPosition();
          if (pointer) {
            addBox({
              id: `manual-${Date.now()}`,
              x: Math.round(pointer.x),
              y: Math.round(pointer.y),
              width: 50,
              height: 50,
              name: `asset_new_${Date.now().toString().slice(-4)}`
            });
          }
        }
      }
    }
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    updateBox(id, {
      x: Math.round(e.target.x()),
      y: Math.round(e.target.y()),
    });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, id: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale to 1 and update width/height instead
    node.scaleX(1);
    node.scaleY(1);
    
    updateBox(id, {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      width: Math.max(5, Math.round(node.width() * scaleX)),
      height: Math.max(5, Math.round(node.height() * scaleY)),
    });
  };

  if (!imageElement) return null;

  return (
    <div className="w-full h-full bg-slate-900/50 rounded-xl border overflow-hidden relative">
      {/* Checkerboard background for transparency */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      />
      <Stage
        ref={stageRef}
        width={window.innerWidth} // Better to use ResizeObserver in prod, simplified here
        height={window.innerHeight}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stageX}
        y={stageY}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        draggable={toolMode === 'pan'}
        style={{ cursor: toolMode === 'pan' ? 'grab' : toolMode === 'add' ? 'crosshair' : toolMode === 'colorPick' ? 'crosshair' : 'default' }}
        className="z-10 absolute inset-0"
      >
        <Layer>
          <KonvaImage
            image={imageElement}
            name="backgroundImage"
          />
          {boxes.map((box) => (
            <Rect
              key={box.id}
              id={box.id}
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
              fill="rgba(0, 150, 255, 0.2)"
              stroke={selectedBoxIds.includes(box.id) ? "#00f0ff" : "rgba(0, 150, 255, 0.8)"}
              strokeWidth={selectedBoxIds.includes(box.id) ? 2 / stageScale : 1 / stageScale}
              draggable={toolMode === 'select' && selectedBoxIds.includes(box.id)}
              onClick={(e) => {
                if (toolMode === 'select') {
                  if (e.evt.ctrlKey || e.evt.shiftKey) {
                    toggleSelectBoxId(box.id);
                  } else {
                    setSelectedBoxIds([box.id]);
                  }
                }
              }}
              onDragEnd={(e) => handleDragEnd(e, box.id)}
              onTransformEnd={(e) => handleTransformEnd(e, box.id)}
            />
          ))}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return oldBox;
              return newBox;
            }}
            ignoreStroke={true}
          />
        </Layer>
      </Stage>
    </div>
  );
};
