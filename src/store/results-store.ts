// store/prediction-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ResponseObject } from "@/types/response";

interface ServerResponse {
  results: ResponseObject[];
  summary?: {
    total_requested: number;
    processed_successfully: number;
    failed: number;
    total_available_samples: number;
  };
}

interface ResultsStore {
  results: ResponseObject[];
  isLoading: boolean;
  error: string | null;
  summary?: ServerResponse["summary"];

  // Actions
  addResults: (data: ResponseObject[] | ServerResponse) => void;
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
      summary: undefined,

      addResults: (data) => {
        // Handle both array of results and server response object
        if (Array.isArray(data)) {
          set({ results: data });
        } else if (data && typeof data === "object" && "results" in data) {
          set({
            results: Array.isArray(data.results) ? data.results : [],
            summary: data.summary,
          });
        } else {
          console.error("Invalid data format for addResults:", data);
          set({ results: [] });
        }
      },

      clearResults: () => set({ results: [], summary: undefined }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "prediction-results",
      partialize: (state) => ({
        results: state.results,
        summary: state.summary,
      }),
    }
  )
);
