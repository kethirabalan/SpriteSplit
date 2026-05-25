import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { SpriteBox, DetectionSettings } from '../types/sprite';
import { createKeyedCanvas } from './colorUtils';

export async function exportToZip(
  image: HTMLImageElement,
  boxes: SpriteBox[],
  settings: DetectionSettings,
  fileNamePrefix: string = 'sprites'
): Promise<void> {
  const zip = new JSZip();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const promises = boxes.map((box, index) => {
    return new Promise<void>((resolve, reject) => {
      const keyedCanvas = createKeyedCanvas(image, box.x, box.y, box.width, box.height, settings);
      if (!keyedCanvas) {
        reject(new Error(`Failed to create canvas for ${box.name}`));
        return;
      }
      
      keyedCanvas.toBlob((blob) => {
        if (blob) {
          const name = box.name || `asset_${String(index + 1).padStart(3, '0')}`;
          zip.file(`${name}.png`, blob);
          resolve();
        } else {
          reject(new Error(`Failed to create blob for ${box.name}`));
        }
      }, 'image/png');
    });
  });

  await Promise.all(promises);
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${fileNamePrefix}.zip`);
}

export function exportSingleAsset(
  image: HTMLImageElement,
  box: SpriteBox,
  settings: DetectionSettings
) {
  const keyedCanvas = createKeyedCanvas(image, box.x, box.y, box.width, box.height, settings);
  if (!keyedCanvas) return;
  
  keyedCanvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, `${box.name || 'asset'}.png`);
    }
  }, 'image/png');
}
