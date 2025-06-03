"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { ResponseObject } from "@/types/response";
import { UploadImageTab } from "./upload-image-tab";
import { SampleImageTab } from "./sample-image-tab";

export type FileWithPreview = {
  file: File;
  preview: string;
  id: string;
  error?: string;
};

export type PhotoUploadFormProps = {
  onUploadComplete?: (results: ResponseObject[]) => void;
};

export function PhotoUploadForm({ onUploadComplete }: PhotoUploadFormProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "samples">("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  return (
    <Card className="w-full max-w-2xl">
      <CardContent>
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "upload"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Upload Your Images
            </button>
            <button
              onClick={() => setActiveTab("samples")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "samples"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Choose from Samples
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "upload" && (
            <UploadImageTab
              uploading={uploading}
              setUploading={setUploading}
              uploadProgress={uploadProgress}
              setUploadProgress={setUploadProgress}
              uploadError={uploadError}
              setUploadError={setUploadError}
              onUploadComplete={onUploadComplete}
            />
          )}

          {activeTab === "samples" && (
            <SampleImageTab
              uploading={uploading}
              setUploading={setUploading}
              uploadProgress={uploadProgress}
              setUploadProgress={setUploadProgress}
              uploadError={uploadError}
              setUploadError={setUploadError}
              onUploadComplete={onUploadComplete}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
