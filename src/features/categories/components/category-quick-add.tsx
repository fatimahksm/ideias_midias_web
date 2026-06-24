'use client';

import {useState, type FormEvent} from 'react';
import {useTranslations} from 'next-intl';
import {Plus} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {createCategory} from '../api';

type Props = {
  sectionId: number;
  startSortOrder: number;
  onAdded: () => void;
  onError: (message: string) => void;
};

/**
 * Inline "add a category" row shown inside the section workspace, so the owner
 * can create categories on the spot without opening the full form page. If only
 * one language is filled in, it's reused for the other.
 */
export function CategoryQuickAdd({
  sectionId,
  startSortOrder,
  onAdded,
  onError
}: Props) {
  const t = useTranslations('CategoriesManager');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');

  const [namePt, setNamePt] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const pt = namePt.trim();
    const en = nameEn.trim();

    if (!pt && !en) return;

    setBusy(true);

    try {
      await createCategory({
        sectionId,
        namePt: pt || en,
        nameEn: en || pt,
        descriptionPt: null,
        descriptionEn: null,
        isActive: true,
        sortOrder: startSortOrder
      });

      setNamePt('');
      setNameEn('');
      onAdded();
    } catch (error) {
      onError(getErrorMessage(toAppError(error), (key) => errorT(key)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5"
    >
      <p className="text-sm font-semibold text-emerald-900">
        {t('quickAddTitle')}
      </p>
      <p className="mt-1 text-xs text-emerald-700">{t('quickAddHint')}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Input
          id="quickAddNamePt"
          label={t('quickAddNamePt')}
          value={namePt}
          onChange={(event) => setNamePt(event.target.value)}
          placeholder={t('quickAddPlaceholder')}
        />
        <Input
          id="quickAddNameEn"
          label={t('quickAddNameEn')}
          value={nameEn}
          onChange={(event) => setNameEn(event.target.value)}
          placeholder={t('quickAddPlaceholder')}
        />
        <Button type="submit" isLoading={busy} loadingText={common('loading')}>
          <Plus className="mr-1.5 h-4 w-4" />
          {t('quickAddButton')}
        </Button>
      </div>
    </form>
  );
}
