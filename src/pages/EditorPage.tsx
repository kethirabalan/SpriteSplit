import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpriteStore } from '../store/useSpriteStore';
import { CanvasEditor } from '../components/editor/CanvasEditor';
import { Toolbar } from '../components/toolbar/Toolbar';
import { PreviewGrid } from '../components/preview/PreviewGrid';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { Layers, ArrowLeft, Zap } from 'lucide-react';
import { detectSprites } from '../lib/spriteDetector';

export const EditorPage: React.FC = () => {
  const {
    imageElement,
    imageFileName,
    setImage,
    boxes,
    setBoxes,
    settings,
  } = useSpriteStore();

  const navigate = useNavigate();
  const [isDetecting, setIsDetecting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Guard: redirect to landing if no image is loaded
  useEffect(() => {
    if (!imageElement) {
      navigate('/', { replace: true });
    }
  }, [imageElement, navigate]);

  // Debounced auto sprite split on image load or settings change
  useEffect(() => {
    if (!imageElement) return;

    let active = true;
    setIsDetecting(true);
    setProgress(0);

    const runDetection = async () => {
      try {
        const detectedBoxes = await detectSprites(imageElement, settings, (p) => {
          if (active) setProgress(p);
        });
        if (active) {
          setBoxes(detectedBoxes);
          setIsDetecting(false);
        }
      } catch (e) {
        console.error('Detection failed', e);
        if (active) setIsDetecting(false);
      }
    };

    const timer = setTimeout(runDetection, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [imageElement, settings, setBoxes]);

  const handleBack = () => {
    setImage(null, '');
    navigate('/');
  };

  if (!imageElement) return null;

  return (
    <div className="w-full h-screen overflow-hidden bg-[#070b19] text-foreground relative flex flex-col">
      {/* Background Floating Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] animate-float-slow" />
      </div>

      {/* Top Header - Glassmorphic */}
      <header className="glass-panel h-16 shrink-0 z-50 flex items-center justify-between px-6 border-b border-white/5 relative">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="glass-button h-9 px-4 rounded-xl flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="w-[1px] h-6 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-wide truncate max-w-[200px] md:max-w-xs">
                {imageFileName}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {imageElement.width} × {imageElement.height} px
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-panel px-3 py-1.5 rounded-full text-xs font-semibold text-primary flex items-center gap-1.5 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {boxes.length} {boxes.length === 1 ? 'Sprite' : 'Sprites'} Found
          </div>
        </div>
      </header>

      {/* Editor Area */}
      <div className="flex-1 relative flex overflow-hidden">
        <Toolbar />

        <div className="flex-1 relative h-full">
          <CanvasEditor />
          <SettingsPanel />

          {/* Auto-detection Progress Overlay */}
          {isDetecting && (
            <div className="absolute inset-0 bg-[#070b19]/80 backdrop-blur-md z-[100] flex items-center justify-center animate-in fade-in duration-300">
              <div className="glass-panel-heavy p-8 rounded-3xl flex flex-col items-center max-w-sm w-full mx-4 border border-white/10">
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
                  <div className="w-12 h-12 bg-primary/10 rounded-full animate-ping absolute" />
                  <Zap className="w-6 h-6 text-primary absolute animate-pulse" />
                </div>

                <h3 className="font-bold text-lg text-white mb-1">Analyzing Sprite Sheet</h3>
                <p className="text-xs text-muted-foreground text-center mb-6">
                  Scanning pixels to isolate sprite components...
                </p>

                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-100 ease-out shadow-[0_0_12px_rgba(0,150,255,0.6)]"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-primary mt-3">
                  {Math.round(progress * 100)}% Complete
                </span>
              </div>
            </div>
          )}
        </div>

        <PreviewGrid />
      </div>
    </div>
  );
};
