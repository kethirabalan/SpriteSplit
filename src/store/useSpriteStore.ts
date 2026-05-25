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
  deleteBoxes: (ids: string[]) => void;
  clearBoxes: () => void;
  
  // Editor State
  selectedBoxIds: string[];
  setSelectedBoxIds: (ids: string[]) => void;
  toggleSelectBoxId: (id: string) => void;
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  
  // Detection Settings
  settings: DetectionSettings;
  updateSettings: (settings: Partial<DetectionSettings>) => void;
}

export const useSpriteStore = create<SpriteStore>((set) => ({
  imageElement: null,
  imageFileName: '',
  setImage: (img, fileName) => set({ imageElement: img, imageFileName: fileName, boxes: [], selectedBoxIds: [] }),
  
  boxes: [],
  setBoxes: (boxes) => set({ boxes, selectedBoxIds: boxes.map((b) => b.id) }),
  addBox: (box) => set((state) => ({ 
    boxes: [...state.boxes, box],
    selectedBoxIds: [...state.selectedBoxIds, box.id] // Auto select newly added boxes
  })),
  updateBox: (id, updatedBox) => set((state) => ({
    boxes: state.boxes.map((box) => (box.id === id ? { ...box, ...updatedBox } : box)),
  })),
  deleteBox: (id) => set((state) => ({
    boxes: state.boxes.filter((box) => box.id !== id),
    selectedBoxIds: state.selectedBoxIds.filter((boxId) => boxId !== id),
  })),
  deleteBoxes: (ids) => set((state) => ({
    boxes: state.boxes.filter((box) => !ids.includes(box.id)),
    selectedBoxIds: state.selectedBoxIds.filter((boxId) => !ids.includes(boxId)),
  })),
  clearBoxes: () => set({ boxes: [], selectedBoxIds: [] }),
  
  selectedBoxIds: [],
  setSelectedBoxIds: (ids) => set({ selectedBoxIds: ids }),
  toggleSelectBoxId: (id) => set((state) => {
    const isSelected = state.selectedBoxIds.includes(id);
    return {
      selectedBoxIds: isSelected
        ? state.selectedBoxIds.filter((boxId) => boxId !== id)
        : [...state.selectedBoxIds, id]
    };
  }),
  
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
