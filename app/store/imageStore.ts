import { create } from 'zustand';

interface ImageStoreState {
  // 生成されたSVG画像のデータURL
  generatedImage: string | null;
  // 画像データを設定する関数
  setGeneratedImage: (imageData: string) => void;
  // 画像データをクリアする関数
  clearGeneratedImage: () => void;
}

export const useImageStore = create<ImageStoreState>((set) => ({
  generatedImage: null,
  setGeneratedImage: (imageData: string) => set({ generatedImage: imageData }),
  clearGeneratedImage: () => set({ generatedImage: null }),
}));
