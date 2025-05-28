// store/prediction-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResponseObject } from "@/types/response";

interface ResultsStore {
  results: ResponseObject[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addResults: (results: ResponseObject[]) => void;
  clearResults: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useResultsStore = create<ResultsStore>()(
  persist(
    (set) => ({
      results: [],
      isLoading: false,
      error: null,

      addResults: (results) => set({ results }),
      clearResults: () => set({ results: [] }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "prediction-results", // key di localStorage
      // Hanya persist results, tidak persist loading state
      partialize: (state) => ({ results: state.results }),
    }
  )
);
