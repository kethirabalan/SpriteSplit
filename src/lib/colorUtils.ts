import type { DetectionSettings } from '../types/sprite';

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function autoDetectBackgroundColor(image: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(image.width, 500);
  canvas.height = Math.min(image.height, 500);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '#000000';
  
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  
  const w = canvas.width;
  const h = canvas.height;
  
  // Sample corners
  const cornerPixels = [
    ctx.getImageData(0, 0, 1, 1).data,
    ctx.getImageData(w - 1, 0, 1, 1).data,
    ctx.getImageData(0, h - 1, 1, 1).data,
    ctx.getImageData(w - 1, h - 1, 1, 1).data
  ];
  
  const counts: { [key: string]: number } = {};
  let maxCount = 0;
  let bestColor = '#000000';
  
  for (const pixel of cornerPixels) {
    const r = pixel[0];
    const g = pixel[1];
    const b = pixel[2];
    const alpha = pixel[3];
    
    if (alpha < 10) {
      return '#000000'; // Default to black key if corner is transparent
    }
    
    const hex = rgbToHex(r, g, b);
    counts[hex] = (counts[hex] || 0) + 1;
    if (counts[hex] > maxCount) {
      maxCount = counts[hex];
      bestColor = hex;
    }
  }
  
  return bestColor;
}

export function applyChromaKey(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: DetectionSettings
) {
  if (settings.detectionMode !== 'colorKey' || !settings.removeBackground) {
    return;
  }
  
  const targetColor = hexToRgb(settings.colorKey);
  if (!targetColor) return;
  
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const tolerance = settings.colorTolerance;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const dist = Math.sqrt(
      (r - targetColor.r) ** 2 +
      (g - targetColor.g) ** 2 +
      (b - targetColor.b) ** 2
    );
    
    if (dist <= tolerance) {
      data[i + 3] = 0; // Transparent
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
}

export function createKeyedCanvas(
  imageElement: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  settings: DetectionSettings
): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(imageElement, sx, sy, sw, sh, 0, 0, sw, sh);
  applyChromaKey(ctx, sw, sh, settings);

  return canvas;
}
