import type { SpriteBox, DetectionSettings } from '../types/sprite';
import { hexToRgb } from './colorUtils';

export async function detectSprites(
  image: HTMLImageElement,
  settings: DetectionSettings,
  onProgress?: (progress: number) => void
): Promise<SpriteBox[]> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      resolve([]);
      return;
    }

    const { width, height } = image;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const visited = new Uint8Array(width * height);
    const regions: { minX: number; minY: number; maxX: number; maxY: number }[] = [];

    const getIndex = (x: number, y: number) => (y * width + x) * 4;
    
    let currentY = 0;

    const processChunk = () => {
      const CHUNK_SIZE = 50; // rows per frame
      const endY = Math.min(currentY + CHUNK_SIZE, height);

      const targetColor = settings.detectionMode === 'colorKey' ? hexToRgb(settings.colorKey) : null;

      for (let y = currentY; y < endY; y++) {
        for (let x = 0; x < width; x++) {
          const pixelIdx = y * width + x;
          if (visited[pixelIdx]) continue;

          const alphaIdx = getIndex(x, y) + 3;
          let isForeground = data[alphaIdx] >= settings.alphaThreshold;
          
          if (isForeground && targetColor) {
            const rIdx = getIndex(x, y);
            const r = data[rIdx];
            const g = data[rIdx + 1];
            const b = data[rIdx + 2];
            const dist = Math.sqrt(
              (r - targetColor.r) ** 2 +
              (g - targetColor.g) ** 2 +
              (b - targetColor.b) ** 2
            );
            if (dist <= settings.colorTolerance) {
              isForeground = false;
            }
          }

          if (isForeground) {
            // Found a non-transparent/non-background pixel, start flood fill
            const region = floodFill(x, y, width, height, data, visited, settings);
            if (
              region.maxX - region.minX + 1 >= settings.minSize &&
              region.maxY - region.minY + 1 >= settings.minSize
            ) {
              regions.push(region);
            }
          } else {
            visited[pixelIdx] = 1;
          }
        }
      }

      currentY = endY;
      
      if (onProgress) {
        onProgress(currentY / height);
      }

      if (currentY < height) {
        requestAnimationFrame(processChunk);
      } else {
        // Finished scanning, now merge and map to SpriteBox
        const mergedRegions = mergeRegions(regions, settings.mergeDistance);
        
        const boxes: SpriteBox[] = mergedRegions.map((r, i) => {
          const pad = settings.padding;
          const minX = Math.max(0, r.minX - pad);
          const minY = Math.max(0, r.minY - pad);
          const maxX = Math.min(width, r.maxX + pad);
          const maxY = Math.min(height, r.maxY + pad);
          
          return {
            id: `sprite-${Date.now()}-${i}`,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            name: `asset_${(i + 1).toString().padStart(3, '0')}`,
          };
        });
        resolve(boxes);
      }
    };

    requestAnimationFrame(processChunk);
  });
}

function floodFill(
  startX: number,
  startY: number,
  width: number,
  height: number,
  data: Uint8ClampedArray,
  visited: Uint8Array,
  settings: DetectionSettings
) {
  let minX = startX, minY = startY, maxX = startX, maxY = startY;
  const queue = [{ x: startX, y: startY }];
  visited[startY * width + startX] = 1;

  const targetColor = settings.detectionMode === 'colorKey' ? hexToRgb(settings.colorKey) : null;

  let qIdx = 0;
  while (qIdx < queue.length) {
    const { x, y } = queue[qIdx++];

    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;

    // Check 4 neighbors
    const neighbors = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];

    for (const n of neighbors) {
      if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
        const vIdx = n.y * width + n.x;
        if (!visited[vIdx]) {
          const aIdx = (n.y * width + n.x) * 4 + 3;
          
          let isNeighborForeground = data[aIdx] >= settings.alphaThreshold;
          if (isNeighborForeground && targetColor) {
            const rIdx = (n.y * width + n.x) * 4;
            const r = data[rIdx];
            const g = data[rIdx + 1];
            const b = data[rIdx + 2];
            const dist = Math.sqrt(
              (r - targetColor.r) ** 2 +
              (g - targetColor.g) ** 2 +
              (b - targetColor.b) ** 2
            );
            if (dist <= settings.colorTolerance) {
              isNeighborForeground = false;
            }
          }

          if (isNeighborForeground) {
            visited[vIdx] = 1;
            queue.push({ x: n.x, y: n.y });
          } else {
            visited[vIdx] = 1; // Mark transparent/background as visited to avoid re-checking
          }
        }
      }
    }
  }

  return { minX, minY, maxX, maxY };
}

function mergeRegions(regions: { minX: number; minY: number; maxX: number; maxY: number }[], distance: number) {
  if (distance <= 0) return regions;

  let changed = true;
  let currentRegions = [...regions];

  while (changed) {
    changed = false;
    for (let i = 0; i < currentRegions.length; i++) {
      for (let j = i + 1; j < currentRegions.length; j++) {
        const r1 = currentRegions[i];
        const r2 = currentRegions[j];

        // Check if regions overlap or are within distance
        const overlapX = r1.minX - distance <= r2.maxX && r1.maxX + distance >= r2.minX;
        const overlapY = r1.minY - distance <= r2.maxY && r1.maxY + distance >= r2.minY;

        if (overlapX && overlapY) {
          // Merge r2 into r1
          currentRegions[i] = {
            minX: Math.min(r1.minX, r2.minX),
            minY: Math.min(r1.minY, r2.minY),
            maxX: Math.max(r1.maxX, r2.maxX),
            maxY: Math.max(r1.maxY, r2.maxY),
          };
          currentRegions.splice(j, 1);
          changed = true;
          break; // break inner loop and restart
        }
      }
      if (changed) break;
    }
  }

  return currentRegions;
}
