import React, { useState } from 'react';
import { Settings2, X, Pipette, Sparkles } from 'lucide-react';
import { useSpriteStore } from '../../store/useSpriteStore';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { autoDetectBackgroundColor } from '../../lib/colorUtils';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, toolMode, setToolMode, imageElement } = useSpriteStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="absolute top-4 right-4 z-50 rounded-full shadow-lg border-primary/50 text-primary bg-background/80 backdrop-blur-sm"
        onClick={() => setIsOpen(true)}
      >
        <Settings2 className="w-5 h-5" />
      </Button>

      {isOpen && (
        <Card className="absolute top-16 right-4 z-50 w-72 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <CardHeader className="relative pb-4">
            <CardTitle className="text-lg">Detection Settings</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-muted-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-medium">Detection Mode</label>
              </div>
              <select
                value={settings.detectionMode}
                onChange={(e) => updateSettings({ detectionMode: e.target.value as 'transparency' | 'colorKey' })}
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="transparency">Transparency (Alpha)</option>
                <option value="colorKey">Solid Background Color</option>
              </select>
            </div>

            {settings.detectionMode === 'colorKey' && (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <label className="font-medium">Background Color</label>
                    <span className="text-muted-foreground text-xs font-mono">{settings.colorKey}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 flex items-center">
                      <input
                        type="color"
                        value={settings.colorKey}
                        onChange={(e) => updateSettings({ colorKey: e.target.value })}
                        className="absolute left-2 w-6 h-6 rounded-md border-0 p-0 bg-transparent cursor-pointer overflow-hidden"
                      />
                      <input
                        type="text"
                        value={settings.colorKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('#') && val.length <= 7) {
                            updateSettings({ colorKey: val });
                          }
                        }}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      title="Pick color from image"
                      className={`h-8 w-8 rounded-lg cursor-pointer transition-colors ${
                        toolMode === 'colorPick' 
                          ? 'bg-primary text-white border-primary' 
                          : 'text-muted-foreground hover:text-white border-white/10'
                      }`}
                      onClick={() => setToolMode(toolMode === 'colorPick' ? 'select' : 'colorPick')}
                    >
                      <Pipette className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      title="Auto-detect background color"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white border-white/10 cursor-pointer"
                      onClick={() => {
                        if (imageElement) {
                          const detected = autoDetectBackgroundColor(imageElement);
                          updateSettings({ colorKey: detected });
                        }
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <label className="font-medium">Color Tolerance</label>
                    <span className="text-muted-foreground">{settings.colorTolerance}</span>
                  </div>
                  <Slider
                    min={1}
                    max={150}
                    step={1}
                    value={settings.colorTolerance}
                    onChange={(e) => updateSettings({ colorTolerance: parseInt(e.target.value) })}
                  />
                  <p className="text-[10px] text-muted-foreground">Similarity range for key color removal.</p>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-white/5 mt-2">
                  <label className="text-xs font-medium text-muted-foreground">Remove BG on Export</label>
                  <input
                    type="checkbox"
                    checked={settings.removeBackground}
                    onChange={(e) => updateSettings({ removeBackground: e.target.checked })}
                    className="w-4 h-4 rounded border-white/10 bg-slate-900 text-primary focus:ring-primary focus:ring-offset-slate-950 cursor-pointer"
                  />
                </div>
              </>
            )}

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-medium">Min Size (px)</label>
                <span className="text-muted-foreground">{settings.minSize}</span>
              </div>
              <Slider
                min={1}
                max={50}
                step={1}
                value={settings.minSize}
                onChange={(e) => updateSettings({ minSize: parseInt(e.target.value) })}
              />
              <p className="text-[10px] text-muted-foreground">Ignore regions smaller than this.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-medium">Alpha Threshold</label>
                <span className="text-muted-foreground">{settings.alphaThreshold}</span>
              </div>
              <Slider
                min={1}
                max={255}
                step={1}
                value={settings.alphaThreshold}
                onChange={(e) => updateSettings({ alphaThreshold: parseInt(e.target.value) })}
              />
              <p className="text-[10px] text-muted-foreground">Minimum opacity (0-255) to consider non-transparent.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-medium">Padding (px)</label>
                <span className="text-muted-foreground">{settings.padding}</span>
              </div>
              <Slider
                min={0}
                max={20}
                step={1}
                value={settings.padding}
                onChange={(e) => updateSettings({ padding: parseInt(e.target.value) })}
              />
              <p className="text-[10px] text-muted-foreground">Extra padding around detected sprite bounds.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <label className="font-medium">Merge Distance (px)</label>
                <span className="text-muted-foreground">{settings.mergeDistance}</span>
              </div>
              <Slider
                min={0}
                max={50}
                step={1}
                value={settings.mergeDistance}
                onChange={(e) => updateSettings({ mergeDistance: parseInt(e.target.value) })}
              />
              <p className="text-[10px] text-muted-foreground">Merge regions closer than this distance.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
