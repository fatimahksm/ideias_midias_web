'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import Cropper, {type Area, type Point} from 'react-easy-crop';
import {Button} from '@/components/ui/button';

type Props = {
  open: boolean;
  file: File | null;
  title: string;
  description: string;
  zoomLabel: string;
  resetLabel: string;
  cancelLabel: string;
  confirmLabel: string;
  helperText: string;
  loadImageErrorText: string;
  cropCanvasErrorText: string;
  generateBlobErrorText: string;
  cropFailedErrorText: string;
  aspect?: number;
  cropShape?: 'rect' | 'round';
  isApplying?: boolean;
  /** When provided, renders a row of quick aspect-ratio buttons above the zoom slider. */
  aspectPresets?: {label: string; value: number}[];
  onAspectSelect?: (value: number) => void;
  onClose: () => void;
  onApply: (file: File, previewUrl: string) => Promise<void> | void;
};

function createImage(url: string, loadImageErrorText: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(loadImageErrorText));
    image.src = url;
  });
}

function getOutputExtension(mimeType: string) {
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  return 'jpg';
}

async function buildCroppedFile(
  file: File,
  cropArea: Area,
  texts: {
    loadImageErrorText: string;
    cropCanvasErrorText: string;
    generateBlobErrorText: string;
  }
) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await createImage(objectUrl, texts.loadImageErrorText);
    const canvas = document.createElement('canvas');
    const width = Math.max(1, Math.round(cropArea.width));
    const height = Math.max(1, Math.round(cropArea.height));

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error(texts.cropCanvasErrorText);
    }

    context.drawImage(
      image,
      Math.round(cropArea.x),
      Math.round(cropArea.y),
      width,
      height,
      0,
      0,
      width,
      height
    );

    const mimeType = file.type || 'image/jpeg';

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
            return;
          }

          reject(new Error(texts.generateBlobErrorText));
        },
        mimeType,
        0.92
      );
    });

    const originalBaseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    const extension = getOutputExtension(mimeType);

    return new File([blob], `${originalBaseName}-cropped.${extension}`, {
      type: mimeType,
      lastModified: Date.now()
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function ImageCropModal({
  open,
  file,
  title,
  description,
  zoomLabel,
  resetLabel,
  cancelLabel,
  confirmLabel,
  helperText,
  loadImageErrorText,
  cropCanvasErrorText,
  generateBlobErrorText,
  cropFailedErrorText,
  aspect = 4 / 3,
  cropShape = 'rect',
  isApplying = false,
  aspectPresets,
  onAspectSelect,
  onClose,
  onApply
}: Props) {
  const [crop, setCrop] = useState<Point>({x: 0, y: 0});
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [localError, setLocalError] = useState('');

  const previewUrl = useMemo(() => {
    if (!file || !open) return null;
    return URL.createObjectURL(file);
  }, [file, open]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) return;

    setCrop({x: 0, y: 0});
    setZoom(1);
    setCroppedAreaPixels(null);
    setLocalError('');
  }, [open, file]);

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedArea: Area) => {
      setCroppedAreaPixels(croppedArea);
    },
    []
  );

  async function handleApply() {
    if (!file || !croppedAreaPixels) return;

    setLocalError('');

    try {
      const croppedFile = await buildCroppedFile(file, croppedAreaPixels, {
        loadImageErrorText,
        cropCanvasErrorText,
        generateBlobErrorText
      });

      const croppedPreviewUrl = URL.createObjectURL(croppedFile);

      try {
        await onApply(croppedFile, croppedPreviewUrl);
      } catch (error) {
        URL.revokeObjectURL(croppedPreviewUrl);
        throw error;
      }
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : cropFailedErrorText
      );
    }
  }

  function handleReset() {
    setCrop({x: 0, y: 0});
    setZoom(1);
    setLocalError('');
  }

  if (!open || !file || !previewUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm"
      onClick={() => {
        if (!isApplying) {
          onClose();
        }
      }}
    >
      <div
        className="mx-auto mt-6 flex max-h-[calc(100vh-3rem)] w-[min(960px,92vw)] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <h3 className="text-xl font-black text-slate-950">{title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-h-[420px] bg-slate-950 p-4 md:p-6">
            <div className="relative h-full min-h-[360px] overflow-hidden rounded-[28px] bg-black">
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape={cropShape}
                showGrid
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
          </div>

          <div className="flex flex-col border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
            {aspectPresets && aspectPresets.length > 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {aspectPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={isApplying}
                      onClick={() => onAspectSelect?.(preset.value)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        aspect === preset.value
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div
              className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ${
                aspectPresets && aspectPresets.length > 0 ? 'mt-4' : ''
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {zoomLabel}
              </p>

              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="mt-4 w-full accent-[var(--color-primary)]"
              />

              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>1x</span>
                <span>{zoom.toFixed(2)}x</span>
                <span>3x</span>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                {resetLabel}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {helperText}
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full"
                onClick={handleReset}
                disabled={isApplying}
              >
                {resetLabel}
              </Button>
            </div>

            {localError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {localError}
              </div>
            ) : null}

            <div className="mt-auto flex flex-col gap-3 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isApplying}
              >
                {cancelLabel}
              </Button>

              <Button
                type="button"
                onClick={handleApply}
                isLoading={isApplying}
              >
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}