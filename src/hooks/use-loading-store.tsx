import { create } from "zustand";
type LoadingStore = {
  loading: number;
  setLoadingProcess: () => void;
  setLoadingNotify: () => void;
  resetLoadingProcess: () => void;
};
type notifyStore = {
  status: number;
  success: () => void;
  fail: () => void;
  resetStatus: () => void;
};


export const useLoadingStore = create<LoadingStore>((set) => ({
  loading: 0,
  setLoadingProcess: () => set((state: any) => ({ loading: 1 })),
  setLoadingNotify: () => set((state: any) => ({ loading: 2 })),
  resetLoadingProcess: () => set((state) => ({ loading: 0 })),
}));

export const useNotifyStatus = create<notifyStore>((set) => ({
  status: 0,
  success: () => set((state: any) => ({ status: 1 })),
  fail: () => set((state: any) => ({ status: 2 })),
  resetStatus: () => set((state) => ({ status: 0 })),
}));