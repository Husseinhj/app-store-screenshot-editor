/**
 * Compress an image data URL to reduce localStorage footprint.
 * Re-encodes as JPEG (for photos) at reduced quality and max dimensions.
 */
export function compressImageDataUrl(
  dataUrl: string,
  maxDimension = 1200,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    // Skip non-image or already small data URLs
    if (!dataUrl.startsWith('data:image/')) {
      resolve(dataUrl);
      return;
    }
    // Skip SVGs — they're already compact
    if (dataUrl.startsWith('data:image/svg')) {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      // Only resize if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      // Use JPEG for smaller size (photos), keep PNG for small images
      const compressed = canvas.toDataURL('image/jpeg', quality);
      // Only use compressed version if it's actually smaller
      resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Read a File as a compressed data URL suitable for localStorage.
 * Falls back to URL.createObjectURL → canvas re-encoding if FileReader fails.
 */
export function readFileAsCompressedDataUrl(
  file: File,
  maxDimension = 1200,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const compressed = await compressImageDataUrl(dataUrl, maxDimension, quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    reader.onerror = () => {
      // Fallback: use object URL → canvas to produce a data URL
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(objectUrl);
        }
        URL.revokeObjectURL(objectUrl);
      };
      img.onerror = () => {
        // Last resort: return the object URL directly
        resolve(objectUrl);
      };
      img.src = objectUrl;
    };
    reader.readAsDataURL(file);
  });
}
