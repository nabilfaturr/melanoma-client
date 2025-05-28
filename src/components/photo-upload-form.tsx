"use client";

import type React from "react";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import komponen Image dari Next.js
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Upload, ImageIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResponseObject } from "@/types/response"; // Hapus ResponseObjectArray yang tidak digunakan
import { useResultsStore } from "@/store/results-store";

const URL_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

// Maximum file size in bytes (1 MB)
const MAX_FILE_SIZE = 1 * 1024 * 1024;

const MAX_FILE_QTY = 50; // Maximum number of files allowed

type FileWithPreview = {
  file: File;
  preview: string;
  id: string;
  error?: string;
};

export function PhotoUploadForm() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { addResults, setLoading, setError } = useResultsStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setUploadError(null);

    const newFiles: FileWithPreview[] = [];
    const fileList = Array.from(e.target.files);

    fileList.forEach((file) => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        newFiles.push({
          file,
          preview: URL.createObjectURL(file),
          id: crypto.randomUUID(),
          error: `${file.name} exceeds the 1 MB limit`,
        });
        return;
      }

      // Only accept image files
      if (!file.type.startsWith("image/")) {
        newFiles.push({
          file,
          preview: URL.createObjectURL(file),
          id: crypto.randomUUID(),
          error: `${file.name} is not an image file`,
        });
        return;
      }

      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        id: crypto.randomUUID(),
      });
    });

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.filter((file) => file.id !== id);
      // Revoke the object URL to avoid memory leaks
      const fileToRemove = prevFiles.find((file) => file.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updatedFiles;
    });
  };

  const handleUpload = async () => {
    // Filter out files with errors
    const validFiles = files.filter((file) => !file.error);

    if (validFiles.length === 0) {
      setUploadError("No valid files to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setLoading(true);
    setError(null);

    try {
      const totalFiles = validFiles.length;
      const allResults: ResponseObject[] = [];

      for (let i = 0; i < totalFiles; i++) {
        const file = validFiles[i];
        const formData = new FormData();
        formData.append("file", file.file);
        formData.append("filename", file.file.name);
        formData.append("fileId", file.id);

        const response = await fetch(`${URL_ENDPOINT}/predict`, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data: ResponseObject = await response.json();

        const result: ResponseObject = {
          original_filename: data.original_filename,
          processed_image: data.processed_image,
          processed_filename: data.processed_filename,
        };

        allResults.push(result);
        // Update progress setelah setiap file berhasil diupload
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      // Simpan semua hasil ke store
      addResults(allResults);

      // Reset setelah semua file berhasil diupload
      setFiles([]);

      // Reset progress setelah delay singkat
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);

      router.push("/results");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload files. Please try again.");
      setUploading(false);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = files.some((file) => file.error);

  return (
    <Card className="w-full max-w-2xl">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* File input area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading || files.length >= MAX_FILE_SIZE}
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-10 w-10 text-gray-400" />
              <h3 className="text-lg font-medium">Click to upload photos</h3>
              <p className="text-sm text-gray-500">
                Support for multiple photos (max 1 MB each)
              </p>
              <p className="text-sm font-medium">
                {files.length} of {MAX_FILE_QTY} images selected
              </p>
            </div>
          </div>

          {/* Error message */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* File preview area dengan Image component */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">
                  Selected Photos ({files.length}/{MAX_FILE_QTY})
                </h3>
                {files.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFiles([])}
                    disabled={uploading}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[400px] overflow-y-auto p-1">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`relative group rounded-lg overflow-hidden border ${
                      file.error ? "border-red-300" : "border-gray-200"
                    }`}
                  >
                    <div className="aspect-square relative">
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>

                      {/* Ganti <img> dengan Image component */}
                      <Image
                        src={file.preview || "/placeholder.svg"}
                        alt={file.file.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        onLoad={() => URL.revokeObjectURL(file.preview)}
                        unoptimized // Untuk data URL dari object URL
                      />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove file"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>

                    {file.error && (
                      <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-white text-xs p-1 text-center">
                        Error: {file.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Upload button */}
          <Button
            onClick={handleUpload}
            disabled={uploading || files.length === 0 || hasErrors}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload Photos"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
