import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useSpriteStore } from '../../store/useSpriteStore';
import { exportSingleAsset, exportToZip } from '../../lib/zipExporter';
import { Button } from '../ui/Button';
import { createKeyedCanvas } from '../../lib/colorUtils';
import type { SpriteBox } from '../../types/sprite';

const PreviewItem: React.FC<{ 
  box: SpriteBox, 
  index: number, 
  imageElement: HTMLImageElement,
  isSelected: boolean,
  onToggleSelect: (id: string) => void,
  onClick: () => void
}> = ({ box, index, imageElement, isSelected, onToggleSelect, onClick }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const { settings } = useSpriteStore();
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (canvas && ctx && imageElement) {
      const scale = Math.min(60 / box.width, 60 / box.height);
      canvas.width = box.width * scale;
      canvas.height = box.height * scale;
      
      const keyedCanvas = createKeyedCanvas(imageElement, box.x, box.y, box.width, box.height, settings);
      if (keyedCanvas) {
        ctx.drawImage(keyedCanvas, 0, 0, canvas.width, canvas.height);
      }
    }
  }, [box, imageElement, settings]);

  return (
    <div 
      className={`flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'border-primary/50 bg-primary/15 shadow-[0_0_12px_rgba(0,150,255,0.15)] text-white' 
          : 'border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] text-muted-foreground hover:text-white'
      }`}
      onClick={onClick}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onToggleSelect(box.id);
        }}
        className="w-4 h-4 rounded border-white/10 bg-slate-900 text-primary focus:ring-primary focus:ring-offset-slate-950 cursor-pointer ml-1"
      />
      <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/5 flex items-center justify-center shrink-0 checkerboard-bg">
        <canvas ref={canvasRef} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate text-white">{box.name || `asset_${index + 1}`}</p>
        <p className="text-[10px] text-muted-foreground">{box.width} × {box.height}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          exportSingleAsset(imageElement, box, settings);
        }}
      >
        <Download className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};

export const PreviewGrid: React.FC = () => {
  const { boxes, imageElement, selectedBoxIds, setSelectedBoxIds, toggleSelectBoxId, imageFileName, settings } = useSpriteStore();
  const [isExporting, setIsExporting] = useState(false);

  if (!imageElement || boxes.length === 0) return null;

  const handleExport = async () => {
    const selectedBoxes = boxes.filter(b => selectedBoxIds.includes(b.id));
    if (selectedBoxes.length === 0) return;
    
    setIsExporting(true);
    try {
      const prefix = imageFileName.split('.')[0] || 'sprites';
      if (selectedBoxes.length === 1) {
        exportSingleAsset(imageElement, selectedBoxes[0], settings);
      } else {
        await exportToZip(imageElement, selectedBoxes, settings, prefix);
      }
    } catch (e) {
      console.error(e);
      alert('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const allSelected = boxes.length > 0 && selectedBoxIds.length === boxes.length;
  const someSelected = selectedBoxIds.length > 0;

  return (
    <div className="w-68 shrink-0 glass-panel border-l border-white/5 flex flex-col z-40 relative shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-col gap-3">
        <h3 className="font-bold text-sm text-white tracking-wide">Detected Assets ({boxes.length})</h3>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => {
                if (allSelected) {
                  setSelectedBoxIds([]);
                } else {
                  setSelectedBoxIds(boxes.map(b => b.id));
                }
              }}
              className="w-4 h-4 rounded border-white/10 bg-slate-900 text-primary focus:ring-primary focus:ring-offset-slate-950 cursor-pointer"
            />
            <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">
              {someSelected ? `${selectedBoxIds.length} Selected` : 'Select All'}
            </span>
          </label>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {boxes.map((box, index) => (
          <PreviewItem 
            key={box.id}
            box={box}
            index={index}
            imageElement={imageElement}
            isSelected={selectedBoxIds.includes(box.id)}
            onToggleSelect={toggleSelectBoxId}
            onClick={() => {
              if (selectedBoxIds.includes(box.id)) {
                // If it's already selected, just leave it (toggling is via checkbox or shift click)
                // If they want to select *only* this one, they can uncheck others, 
                // or we can make a normal click select ONLY this one.
                setSelectedBoxIds([box.id]);
              } else {
                setSelectedBoxIds([box.id]);
              }
            }}
          />
        ))}
      </div>

      {/* Prominent Action Button Panel */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02] flex flex-col gap-2">
        <Button
          onClick={handleExport}
          disabled={isExporting || selectedBoxIds.length === 0}
          className={`w-full font-bold text-xs py-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all duration-300 ${
            selectedBoxIds.length === 0
              ? 'bg-white/5 text-muted-foreground shadow-none hover:bg-white/10'
              : selectedBoxIds.length === 1 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10 hover:shadow-emerald-500/20' 
                : 'bg-primary hover:bg-primary/95 text-white shadow-primary/10 hover:shadow-primary/20'
          }`}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {selectedBoxIds.length === 0 
            ? 'Select assets to download' 
            : selectedBoxIds.length === 1 
              ? 'Download PNG' 
              : `Download ZIP (${selectedBoxIds.length})`
          }
        </Button>
      </div>
      
      <style>{`
        .checkerboard-bg {
          background-image: 
            linear-gradient(45deg, #101524 25%, transparent 25%), 
            linear-gradient(-45deg, #101524 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #101524 75%), 
            linear-gradient(-45deg, transparent 75%, #101524 75%);
          background-size: 8px 8px;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
          background-color: #080c16;
        }
      `}</style>
    </div>
  );
};
