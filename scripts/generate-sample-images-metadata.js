// scripts/generate-sample-images.ts
import * as fs from "fs";
import * as path from "path";

const samplesDir = path.join(process.cwd(), "public", "samples");

try {
  // Baca semua file di folder samples
  const files = fs.readdirSync(samplesDir);

  // Filter hanya file gambar
  const imageFiles = files.filter(
    (file) =>
      file.toLowerCase().endsWith(".jpg") ||
      file.toLowerCase().endsWith(".jpeg") ||
      file.toLowerCase().endsWith(".png")
  );

  // Sort files untuk konsistensi
  imageFiles.sort();

  // Generate array
  const sampleImages = imageFiles.map((filename, index) => {
    // Extract ID dari filename (misal: ISIC_0025234.jpg -> 25234)
    const match = filename.match(/ISIC_(\d+)/);
    const id = match ? parseInt(match[1]) : index + 1;

    return {
      id,
      src: `/samples/${filename}`,
      alt: `Skin lesion sample ${filename.replace(/\.(jpg|jpeg|png)$/i, "")}`,
    };
  });

  // Generate TypeScript file
  const tsContent = `// Auto-generated file - Do not edit manually
// Generated on: ${new Date().toISOString()}

export const sampleImages = ${JSON.stringify(sampleImages, null, 2)} as const;

export type SampleImage = typeof sampleImages[number];
`;

  // Pastikan direktori lib ada
  const libDir = path.join(process.cwd(), "src", "lib");
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  // Write to file
  fs.writeFileSync(path.join(libDir, "sample-images.ts"), tsContent);

  console.log(
    `✅ Generated sample-images.ts with ${sampleImages.length} images`
  );
  console.log("Files found:", imageFiles);
} catch (error) {
  console.error("❌ Error generating sample images:", error);
  process.exit(1);
}
