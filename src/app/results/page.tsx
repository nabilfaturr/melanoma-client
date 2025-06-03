"use client";

import { useResultsStore } from "@/store/results-store";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Home, RotateCcw, Search, X } from "lucide-react";

export default function ResultsPage() {
  const { results, isLoading, error, summary, clearResults } =
    useResultsStore();
  const router = useRouter();
  const [inspectImage, setInspectImage] = useState<{
    id: number | string;
    src: string;
    alt: string;
    filename: string;
  } | null>(null);

  // Pastikan results adalah array
  const safeResults = Array.isArray(results) ? results : [];

  useEffect(() => {
    // Redirect jika tidak ada hasil
    if (!isLoading && safeResults.length === 0) {
      router.push("/");
    }
  }, [safeResults, isLoading, router]);

  // Fungsi helper untuk mengubah base64 menjadi data URL
  const createImageSrc = (
    base64String: string,
    imageFormat: string = "png"
  ) => {
    if (!base64String) return "";

    if (base64String.startsWith("data:image/")) {
      return base64String;
    }

    return `data:image/${imageFormat};base64,${base64String}`;
  };

  // Fungsi download image
  const downloadImage = (base64Image: string, filename: string) => {
    try {
      const link = document.createElement("a");
      link.href = createImageSrc(base64Image);
      link.download = filename || "processed-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-lg">Processing images...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
        <div className="text-red-500 text-lg text-center">
          <strong>Error:</strong> {error}
        </div>
        <Button onClick={() => router.push("/")} variant="outline">
          <Home className="w-4 h-4 mr-2" />
          Go Back Home
        </Button>
      </div>
    );
  }

  if (safeResults.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen space-y-4">
        <div className="text-gray-500 text-lg">No results to display</div>
        <Button onClick={() => router.push("/")} variant="default">
          <Home className="w-4 h-4 mr-2" />
          Upload New Images
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with Summary */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Processing Results
          </h1>
          <p className="text-gray-600 mt-1">
            Convert to grayscale and crop to 20x20 pixels
          </p>
        </div>

        {/* Summary Card */}
        {summary && (
          <Card className="w-full lg:w-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg text-blue-600">
                    {summary.total_requested}
                  </div>
                  <div className="text-gray-600">Requested</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-green-600">
                    {summary.processed_successfully}
                  </div>
                  <div className="text-gray-600">Success</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-red-600">
                    {summary.failed}
                  </div>
                  <div className="text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-gray-600">
                    {safeResults.length}
                  </div>
                  <div className="text-gray-600">Displayed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeResults.map((result, index) => (
          <Card key={result.id || index} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-semibold truncate">
                  {result.original_filename || `Image ${index + 1}`}
                </CardTitle>
                <Badge
                  variant={
                    result.status === "success" ? "default" : "destructive"
                  }
                >
                  {result.status || "unknown"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Processed Image with Inspect Button */}
              {result.processed_image && (
                <div className="relative h-48 w-full bg-gray-50 rounded-lg overflow-hidden group">
                  <Image
                    src={createImageSrc(result.processed_image)}
                    alt={`Processed ${result.original_filename || "image"}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                    onError={(e) => {
                      console.error(
                        "Failed to load image for:",
                        result.original_filename
                      );
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  {/* Inspect Button - Only shows on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectImage({
                        id: result.id || index,
                        src: createImageSrc(result.processed_image),
                        alt: `Processed ${result.original_filename || "image"}`,
                        filename:
                          result.original_filename || `Image ${index + 1}`,
                      });
                    }}
                    className="absolute bottom-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Inspect image"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Image Info */}
              <div className="space-y-2 text-sm text-gray-600">
                {result.processed_filename && (
                  <div>
                    <strong>Processed:</strong> {result.processed_filename}
                  </div>
                )}
                {result.id && (
                  <div>
                    <strong>ID:</strong> {result.id}
                  </div>
                )}
              </div>

              {/* Download Button */}
              {result.processed_image && (
                <Button
                  onClick={() =>
                    downloadImage(
                      result.processed_image,
                      result.processed_filename || `processed-${index + 1}.png`
                    )
                  }
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={clearResults} variant="destructive">
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear Results
        </Button>
        <Button onClick={() => router.push("/")} variant="outline">
          <Home className="w-4 h-4 mr-2" />
          Process More Images
        </Button>
      </div>

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

            {/* Download Button - Floating */}
            <button
              onClick={() => {
                const result = safeResults.find(
                  (r) => (r.id || safeResults.indexOf(r)) === inspectImage.id
                );
                if (result?.processed_image) {
                  downloadImage(
                    result.processed_image,
                    result.processed_filename ||
                      `processed-${inspectImage.filename}.png`
                  );
                }
              }}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl z-10 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Image
            </button>

            {/* Image Header */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {inspectImage.filename}
              </h3>
              <p className="text-sm text-gray-600">
                Processed Result - Click outside to close
              </p>
            </div>

            {/* Large Image Display */}
            <div className="flex items-center justify-center p-8 min-h-[500px]">
              <Image
                src={inspectImage.src}
                alt={inspectImage.alt}
                width={800}
                height={600}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
