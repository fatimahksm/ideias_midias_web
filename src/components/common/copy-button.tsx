import type {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  onClick: () => void;
};

/** Small utility action next to a bilingual field pair (Copy PT → EN, Copy EN → PT). */
export function CopyButton({children, onClick}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[var(--color-accent)] hover:bg-[color-mix(in_srgb,var(--color-accent)_10%,white)] hover:text-[var(--color-accent)]"
    >
      {children}
    </button>
  );
}
