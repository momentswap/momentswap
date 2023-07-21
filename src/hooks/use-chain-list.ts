import { create } from "zustand";


export const useChainList = create<any>((set:any) => ({
    TYPE: "ALEO",
    setFilChain: () => set((state: any) => ({ TYPE: "FIL" })),
    setAleoChain: () => set((state: any) => ({ TYPE: "ALEO" })),
  }));

export const useAleoPrivateKey = create<any>((set:any) => ({
    PK: "",
    Address:"",
    login:false,
    setAleoPrivateKey: (e:any) => set((state: any) => ({ PK: e })),
    setAleoAddress: (e:any) => set((state: any) => ({ Address: e })),
    setLogin: (e:any) => set((state: any) => ({ login: true })),
  }));


  export const useAleoLoading = create<any>((set:any) => ({
    loading:false,
    setLoading: (e:any) => set((state: any) => ({ loading: e })),
  }));

  export const useAleoRecords = create<any>((set:any) => ({
    records:[],
    setRecords: (e:any) => set((state: any) => ({ records: e })),
  }));