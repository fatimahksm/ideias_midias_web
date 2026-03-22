'use client';

import {useTranslations} from 'next-intl';
import {CONTACT_ICON_OPTIONS} from '../contact-method-options';

type Props = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  hint?: string;
  error?: string;
};

export function ContactIconPicker({
  value,
  onChange,
  label,
  hint,
  error
}: Props) {
  const t = useTranslations('ContactMethodForm');

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-900">
          {label}
        </label>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {CONTACT_ICON_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                isActive
                  ? 'border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,white)] text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">
                {t(option.labelKey as never)}
              </span>
            </button>
          );
        })}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}