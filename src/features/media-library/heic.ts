/**
 * iPhones default to HEIC for photos, which no browser can decode into a
 * <canvas> (needed for the crop tool) or reliably preview in an <img>. We
 * convert HEIC/HEIF to JPEG client-side, before the file ever reaches the
 * crop UI or the upload request, so the rest of the upload flow never has to
 * know the original file wasn't already a JPEG.
 */
export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === 'image/heic' || type === 'image/heif') {
    return true;
  }

  // Many browsers/OSes report an empty or generic type for HEIC files picked
  // from a Photos library, so fall back to the extension.
  const name = file.name.toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

export async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import('heic2any')).default;

  const result = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.92
  });

  const blob = Array.isArray(result) ? result[0] : result;
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';

  return new File([blob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now()
  });
}
