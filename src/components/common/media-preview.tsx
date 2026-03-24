import {resolveMediaUrl} from '@/lib/media/resolve-media-url';

type MediaPreviewProps = {
  label: string;
  url?: string | null;
  type: 'image' | 'video';
  emptyText: string;
};

export function MediaPreview({
  label,
  url,
  type,
  emptyText
}: MediaPreviewProps) {
  const resolvedUrl = resolveMediaUrl(url);
  const hasUrl = Boolean(resolvedUrl);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>

      <div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
        {hasUrl ? (
          type === 'image' ? (
            <img
              src={resolvedUrl}
              alt={label}
              className="h-52 w-full object-cover"
            />
          ) : (
            <video
              src={resolvedUrl}
              controls
              className="h-52 w-full bg-black object-cover"
            />
          )
        ) : (
          <div className="flex h-52 items-center justify-center px-4 text-center text-sm text-slate-500">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  );
}