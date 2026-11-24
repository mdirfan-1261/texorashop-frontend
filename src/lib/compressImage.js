// Compress any image file in the browser before upload.
// Output: webp data URL, max 1000px, usually 80-150 KB.
export async function compressImage(
  file,
  { maxSize = 1000, targetKB = 150, minQuality = 0.5 } = {}
) {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const toBlob = (quality) =>
    new Promise((resolve) => canvas.toBlob(resolve, "image/webp", quality));

  let quality = 0.82;
  let blob = await toBlob(quality);

  // Lower quality step by step until the image is small enough
  while (blob && blob.size / 1024 > targetKB && quality > minQuality) {
    quality -= 0.08;
    blob = await toBlob(quality);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.toString());
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}