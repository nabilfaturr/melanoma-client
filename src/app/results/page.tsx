"use client";

import { useResultsStore } from "@/store/results-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import Image component

export default function ResultsPage() {
  const { results, isLoading, error, clearResults } = useResultsStore();
  const router = useRouter();

  useEffect(() => {
    // Redirect jika tidak ada hasil
    if (!isLoading && results.length === 0) {
      router.push("/");
    }
  }, [results, isLoading, router]);

  // Fungsi helper untuk mengubah base64 menjadi data URL
  const createImageSrc = (
    base64String: string,
    imageFormat: string = "png"
  ) => {
    // Pastikan base64String tidak kosong
    if (!base64String) return "";

    // Jika sudah ada prefix data:image, gunakan langsung
    if (base64String.startsWith("data:image/")) {
      return base64String;
    }

    // Tambahkan prefix data URL
    return `data:image/${imageFormat};base64,${base64String}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Processing results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Convert to grascale and crop it into 20x20</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => (
          <div key={index} className="border rounded-lg p-4 shadow-md">
            {/* Nama file asli */}
            <h3 className="text-lg font-semibold mb-2">
              {result.original_filename}
            </h3>

            {/* Gambar hasil prediksi - Ganti dengan Image component */}
            <div className="mb-4 relative h-48 w-full">
              <Image
                src={createImageSrc(result.processed_image)}
                alt={`Processed result for ${result.original_filename}`}
                fill
                className="object-cover rounded border"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized // Untuk data URL base64
                onError={() => {
                  console.error(
                    "Failed to load image:",
                    result.processed_image
                  );
                }}
              />
            </div>

            {/* Informasi tambahan dari response */}
            <div className="space-y-2 text-sm">
              <p>
                <strong>Processed Filename:</strong> {result.processed_filename}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Clear Results
        </button>
      </div>
    </div>
  );
}
