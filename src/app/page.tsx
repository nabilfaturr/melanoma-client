import { PhotoUploadForm } from "@/components/photo-upload-form";

export default function Home() {
  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center">
      <div className="flex flex-col justify-center items-center max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Image Analyzer</h1>
        <p className="text-center text-gray-600 mb-10">
          Upload your own image or choose from our samples for analysis
        </p>
        <PhotoUploadForm />
      </div>
    </main>
  );
}
