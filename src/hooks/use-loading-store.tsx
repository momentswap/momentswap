import { create } from "zustand";

type LoadingStore = {
  loading: number;
  setLoadingProcess: () => void;
  setLoadingNotify: () => void;
  resetLoadingProcess: () => void;
};

export const useLoadingStore = create<LoadingStore>((set) => ({
  loading: 0,
  setLoadingProcess: () => set((state: any) => ({ loading: 1 })),
  setLoadingNotify: () => set((state: any) => ({ loading: 2 })),
  resetLoadingProcess: () => set((state) => ({ loading: 0 })),
}));
