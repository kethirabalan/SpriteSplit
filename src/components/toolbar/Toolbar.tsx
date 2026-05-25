import React, { useState } from 'react';
import { MousePointer2, Move, Plus, Trash2, Wand2, Download, Pipette } from 'lucide-react';
import { useSpriteStore } from '../../store/useSpriteStore';
import { Button } from '../ui/Button';
import { detectSprites } from '../../lib/spriteDetector';
import { exportToZip, exportSingleAsset } from '../../lib/zipExporter';

export const Toolbar: React.FC = () => {
  const { toolMode, setToolMode, selectedBoxIds, deleteBoxes, imageElement, settings, setBoxes, boxes, imageFileName } = useSpriteStore();
  const [isDetecting, setIsDetecting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleDetect = async () => {
    if (!imageElement) return;
    setIsDetecting(true);
    try {
      const detectedBoxes = await detectSprites(imageElement, settings);
      setBoxes(detectedBoxes);
    } catch (e) {
      console.error(e);
      alert('Detection failed');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleExport = async () => {
    if (!imageElement || boxes.length === 0) {
      alert("No sprites to export!");
      return;
    }
    setIsExporting(true);
    try {
      if (boxes.length === 1) {
        exportSingleAsset(imageElement, boxes[0], settings);
      } else {
        const prefix = imageFileName.split('.')[0] || 'sprites';
        await exportToZip(imageElement, boxes, settings, prefix);
      }
    } catch (e) {
      console.error(e);
      alert('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 p-2 glass-panel rounded-2xl shadow-2xl m-4 w-14 items-center absolute z-50 left-0 top-1/2 -translate-y-1/2 border border-white/5">
      <Button
        variant="ghost"
        size="icon"
        title="Select & Resize (V)"
        onClick={() => setToolMode('select')}
        className={`rounded-xl cursor-pointer transition-all duration-300 ${
          toolMode === 'select' 
            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
            : 'text-muted-foreground hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        <MousePointer2 className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Pan Canvas (Space)"
        onClick={() => setToolMode('pan')}
        className={`rounded-xl cursor-pointer transition-all duration-300 ${
          toolMode === 'pan' 
            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
            : 'text-muted-foreground hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        <Move className="w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Add Box"
        onClick={() => setToolMode('add')}
        className={`rounded-xl cursor-pointer transition-all duration-300 ${
          toolMode === 'add' 
            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
            : 'text-muted-foreground hover:text-white hover:bg-white/[0.05]'
        }`}
      >
        <Plus className="w-5 h-5" />
      </Button>

      {settings.detectionMode === 'colorKey' && (
        <Button
          variant="ghost"
          size="icon"
          title="Pick Color Key (P)"
          onClick={() => setToolMode(toolMode === 'colorPick' ? 'select' : 'colorPick')}
          className={`rounded-xl cursor-pointer transition-all duration-300 ${
            toolMode === 'colorPick' 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'text-muted-foreground hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Pipette className="w-5 h-5" />
        </Button>
      )}
      
      <div className="w-8 h-[1px] bg-white/10 my-1" />
      
      <Button
        variant="ghost"
        size="icon"
        title="Delete Selected Boxes (Del)"
        disabled={selectedBoxIds.length === 0}
        onClick={() => selectedBoxIds.length > 0 && deleteBoxes(selectedBoxIds)}
        className="text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none animate-in fade-in"
      >
        <Trash2 className="w-5 h-5" />
      </Button>
      
      <div className="w-8 h-[1px] bg-white/10 my-1" />
      
      <Button
        variant="ghost"
        size="icon"
        title="Auto Detect Sprites"
        onClick={handleDetect}
        disabled={isDetecting || !imageElement}
        className="text-primary hover:bg-primary/10 hover:text-primary rounded-xl cursor-pointer transition-all duration-300"
      >
        <Wand2 className={`w-5 h-5 ${isDetecting ? 'animate-pulse' : ''}`} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        title={boxes.length === 1 ? "Download PNG" : "Download ZIP"}
        onClick={handleExport}
        disabled={isExporting || boxes.length === 0}
        className="text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-400 rounded-xl cursor-pointer transition-all duration-300"
      >
        <Download className="w-5 h-5" />
      </Button>
    </div>
  );
};
