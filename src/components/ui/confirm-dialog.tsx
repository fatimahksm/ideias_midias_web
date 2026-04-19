'use client';

import {Button} from '@/components/ui/button';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
  tone?: 'danger' | 'primary';
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
  isLoading = false,
  tone = 'danger'
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[140] bg-black/45 backdrop-blur-sm"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div
        className="flex min-h-full items-center justify-center p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="w-full max-w-md overflow-hidden rounded-[28px] border shadow-2xl"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)'
          }}
        >
          <div
            className="border-b px-6 py-5"
            style={{borderColor: 'var(--color-border)'}}
          >
            <h3 className="text-xl font-black">{title}</h3>
            {description ? (
              <p
                className="mt-2 text-sm leading-6"
                style={{color: 'var(--color-text-muted)'}}
              >
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="sm:min-w-28"
            >
              {cancelLabel}
            </Button>

            <Button
              type="button"
              variant={tone === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
              isLoading={isLoading}
              className="sm:min-w-32"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}