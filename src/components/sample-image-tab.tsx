"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ResponseObject } from "@/types/response";
import { useResultsStore } from "@/store/results-store";
import { sampleImages } from "@/lib/sample-images";

const URL_ENDPOINT =
  process.env.NODE_ENV === "production"
    ? "/api/v1"
    : process.env.NEXT_PUBLIC_API_URL || "/api/v1";

type SampleImageTabProps = {
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
  uploadError: string | null;
  setUploadError: (error: string | null) => void;
  onUploadComplete?: (results: ResponseObject[]) => void;
};

export function SampleImageTab({
  uploading,
  setUploading,
  uploadProgress,
  setUploadProgress,
  uploadError,
  setUploadError,
  onUploadComplete,
}: SampleImageTabProps) {
  const [selectedSamples, setSelectedSamples] = useState<number[]>([]);
  const [inspectImage, setInspectImage] = useState<{
    id: number;
    src: string;
    alt: string;
  } | null>(null);
  const router = useRouter();
  const { addResults, setLoading, setError } = useResultsStore();

  const toggleSampleSelection = (imageId: number) => {
    setSelectedSamples((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };

  const clearAllSamples = () => {
    setSelectedSamples([]);
  };

  const selectAllSamples = () => {
    setSelectedSamples(sampleImages.map((img) => img.id));
  };

  // Batch process selected sample images by sending all IDs at once
  // This is more efficient than processing images one by one
  const handleAnalyze = async () => {
    if (selectedSamples.length === 0) {
      setUploadError("No sample images selected");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setLoading(true);
    setError(null);

    try {
      // Send all selected image IDs in a single batch request
      const response = await fetch(`${URL_ENDPOINT}/predict-samples`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          imageIds: selectedSamples,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sample processing failed: ${response.statusText}`);
      }

      // Simulate progress for better UX
      setUploadProgress(50);

      const data = await response.json();

      // Server sudah mengirim format yang benar dengan summary
      // Langsung pass ke store tanpa modifikasi
      addResults(data);

      setUploadProgress(100);
      setSelectedSamples([]);

      if (onUploadComplete) {
        onUploadComplete(data.results || []);
      }

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);

      router.push("/results");
    } catch (error) {
      console.error("Sample processing error:", error);
      setUploadError("Failed to process sample images. Please try again.");
      setUploading(false);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Sample Images Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">
            Sample Images ({selectedSamples.length}/50)
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllSamples}
              disabled={selectedSamples.length === 50}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllSamples}
              disabled={selectedSamples.length === 0}
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Sample Images Grid */}
      <div className="border rounded-lg bg-white">
        <div className="h-96 overflow-y-auto p-4">
          <div className="grid grid-cols-5 gap-3">
            {sampleImages.map((image) => (
              <div
                key={image.id}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 group ${
                  selectedSamples.includes(image.id)
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleSampleSelection(image.id)}
              >
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />

                {/* Selection Indicator */}
                {selectedSamples.includes(image.id) && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center">
                    <div className="bg-blue-500 bg-opacity-80 text-white rounded-full p-1 shadow-md">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Image Number */}
                <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                  {image.id}
                </div>

                {/* Inspect Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectImage({
                      id: image.id,
                      src: image.src,
                      alt: image.alt,
                    });
                  }}
                  className="absolute bottom-1 right-1 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Inspect image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error message */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Processing samples...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Analyze button */}
      <Button
        onClick={handleAnalyze}
        disabled={uploading || selectedSamples.length === 0}
        className="w-full"
      >
        {uploading
          ? "Processing..."
          : `Analyze Selected Images (${selectedSamples.length})`}
      </Button>

      {/* Image Inspect Modal */}
      {inspectImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setInspectImage(null);
            }
          }}
        >
          <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl max-w-5xl max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setInspectImage(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Use This Image Button - Floating */}
            <button
              onClick={() => {
                toggleSampleSelection(inspectImage.id);
                setInspectImage(null);
              }}
              className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl z-10 flex items-center gap-2 ${
                selectedSamples.includes(inspectImage.id)
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {selectedSamples.includes(inspectImage.id) ? (
                <>
                  <X className="w-4 h-4" />
                  Remove from Selection
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Use This Image
                </>
              )}
            </button>

            {/* Image Container */}
            <div className="flex items-center justify-center p-8 min-h-[500px]">
              <Image
                src={inspectImage.src || "/placeholder.svg"}
                alt={inspectImage.alt}
                width={800}
                height={600}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
