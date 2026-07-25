/**
 * Compress / resize an image File before upload to avoid proxy 413s
 * and stay within the cover-image size guidance (~500KB).
 *
 * @param {File} file
 * @param {{ maxBytes?: number, maxWidth?: number, mimeType?: string, quality?: number }} [opts]
 * @returns {Promise<File>}
 */
export async function compressImageForUpload(file, opts = {}) {
  const {
    maxBytes = 500 * 1024,
    maxWidth = 1600,
    mimeType = 'image/jpeg',
    quality = 0.82,
  } = opts;

  if (!file || !(file instanceof File) || !file.type.startsWith('image/')) {
    return file;
  }

  // Already small enough — skip canvas work
  if (file.size <= maxBytes && file.type !== 'image/png') {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  try {
    let { width, height } = bitmap;
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    let q = quality;
    let blob = await canvasToBlob(canvas, mimeType, q);

    // Step quality down until under maxBytes (or quality floor)
    while (blob && blob.size > maxBytes && q > 0.45) {
      q = Math.round((q - 0.1) * 100) / 100;
      blob = await canvasToBlob(canvas, mimeType, q);
    }

    // Still too large — scale dimensions further
    if (blob && blob.size > maxBytes) {
      const scale = Math.sqrt(maxBytes / blob.size) * 0.95;
      const w2 = Math.max(500, Math.round(width * scale));
      const h2 = Math.max(1, Math.round((height * w2) / width));
      canvas.width = w2;
      canvas.height = h2;
      ctx.drawImage(bitmap, 0, 0, w2, h2);
      blob = await canvasToBlob(canvas, mimeType, 0.75);
    }

    if (!blob) return file;

    const base = file.name.replace(/\.[^.]+$/, '') || 'cover';
    return new File([blob], `${base}.jpg`, { type: mimeType, lastModified: Date.now() });
  } finally {
    bitmap.close?.();
  }
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}
