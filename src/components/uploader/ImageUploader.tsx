import React, { useCallback, useRef } from 'react';
import { Upload, FileImage } from 'lucide-react';
import { useSpriteStore } from '../../store/useSpriteStore';
import { Button } from '../ui/Button';

export const ImageUploader: React.FC = () => {
  const setImage = useSpriteStore((state) => state.setImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP)');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img, file.name);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="w-full max-w-3xl aspect-video border border-white/10 rounded-3xl flex flex-col items-center justify-center p-10 text-center glass-panel hover:border-primary/45 hover:bg-white/[0.03] hover:shadow-primary/5 transition-all duration-300 relative group cursor-pointer shadow-2xl overflow-hidden"
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Shine effect */}
        <div className="absolute -inset-full bg-[linear-gradient(45deg,transparent_40%,rgba(255,255,255,0.03)_50%,transparent_60%)] -rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />

        <div className="w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:border-primary/40 transition-all duration-300 shadow-lg">
          <Upload className="w-7 h-7 text-primary group-hover:animate-bounce" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Upload Sprite Sheet</h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm leading-relaxed">
          Drag & drop your sprite sheet image here, or click to browse.
          <span className="block mt-1 text-[11px] opacity-75">Supports PNG, JPG, WebP up to 20MB</span>
        </p>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
        
        <Button 
          size="lg" 
          className="glass-button h-11 px-6 text-xs font-semibold text-white rounded-xl shadow-lg border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <FileImage className="w-4 h-4" />
          Select File
        </Button>
      </div>
    </div>
  );
};
