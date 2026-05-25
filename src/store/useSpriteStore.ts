import { create } from 'zustand';
import type { SpriteBox, DetectionSettings } from '../types/sprite';

export type ToolMode = 'select' | 'add' | 'pan' | 'colorPick';

interface SpriteStore {
  // Image Data
  imageElement: HTMLImageElement | null;
  imageFileName: string;
  setImage: (img: HTMLImageElement | null, fileName: string) => void;
  
  // Bounding Boxes
  boxes: SpriteBox[];
  setBoxes: (boxes: SpriteBox[]) => void;
  addBox: (box: SpriteBox) => void;
  updateBox: (id: string, box: Partial<SpriteBox>) => void;
  deleteBox: (id: string) => void;
  clearBoxes: () => void;
  
  // Editor State
  selectedBoxId: string | null;
  setSelectedBoxId: (id: string | null) => void;
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  
  // Detection Settings
  settings: DetectionSettings;
  updateSettings: (settings: Partial<DetectionSettings>) => void;
}

export const useSpriteStore = create<SpriteStore>((set) => ({
  imageElement: null,
  imageFileName: '',
  setImage: (img, fileName) => set({ imageElement: img, imageFileName: fileName, boxes: [], selectedBoxId: null }),
  
  boxes: [],
  setBoxes: (boxes) => set({ boxes }),
  addBox: (box) => set((state) => ({ boxes: [...state.boxes, box] })),
  updateBox: (id, updatedBox) => set((state) => ({
    boxes: state.boxes.map((box) => (box.id === id ? { ...box, ...updatedBox } : box)),
  })),
  deleteBox: (id) => set((state) => ({
    boxes: state.boxes.filter((box) => box.id !== id),
    selectedBoxId: state.selectedBoxId === id ? null : state.selectedBoxId,
  })),
  clearBoxes: () => set({ boxes: [], selectedBoxId: null }),
  
  selectedBoxId: null,
  setSelectedBoxId: (id) => set({ selectedBoxId: id }),
  
  toolMode: 'select',
  setToolMode: (mode) => set({ toolMode: mode }),
  
  settings: {
    minSize: 10,
    alphaThreshold: 10,
    padding: 0,
    mergeDistance: 2,
    detectionMode: 'transparency',
    colorKey: '#000000',
    colorTolerance: 30,
    removeBackground: true,
  },
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
  })),
}));
