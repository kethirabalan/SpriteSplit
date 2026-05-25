export interface SpriteBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name?: string;
}

export interface DetectionSettings {
  minSize: number;
  alphaThreshold: number;
  padding: number;
  mergeDistance: number;
  detectionMode: 'transparency' | 'colorKey';
  colorKey: string;
  colorTolerance: number;
  removeBackground: boolean;
}
