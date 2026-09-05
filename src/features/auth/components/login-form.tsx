'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useQuery} from '@tanstack/react-query';
import {useTranslations, useLocale} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useEffect, useMemo, useState} from 'react';
import {useForm} from 'react-hook-form';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {useToast} from '@/components/common/toast-provider';
import {
  clearAdminSession,
  getAdminToken,
  setAdminToken
} from '@/lib/auth/token';
import {adminLoginSchema, type AdminLoginFormValues} from '../schema';
import {adminLogin, getCurrentAdmin} from '../api';

function SessionStateCard({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm shadow-sm">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-slate-600">{description}</p>
    </div>
  );
}

export default function LoginForm() {
  const t = useTranslations('AdminLoginPage');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const locale = useLocale();
  const router = useRouter();

  const {showSuccess, showError} = useToast();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const storedToken = useMemo(() => {
    if (!isHydrated) return null;
    return getAdminToken();
  }, [isHydrated]);

  const sessionQuery = useQuery({
    queryKey: ['admin-login-session', storedToken],
    queryFn: () => getCurrentAdmin(storedToken),
    enabled: Boolean(storedToken),
    retry: false,
    staleTime: 300_000
  });

  useEffect(() => {
    if (sessionQuery.isSuccess) {
      router.replace(`/${locale}/admin`);
    }
  }, [sessionQuery.isSuccess, locale, router]);

  useEffect(() => {
    if (sessionQuery.isError) {
      clearAdminSession();
    }
  }, [sessionQuery.isError]);

  const {
    register,
    handleSubmit,
    formState: {errors, isSubmitting}
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  async function onSubmit(values: AdminLoginFormValues) {
    try {
      const result = await adminLogin(values);

      setAdminToken(result.token);
      showSuccess(t('loginSuccess'));

      router.replace(`/${locale}/admin`);
    } catch (error) {
      const appError = toAppError(error);
      showError(getErrorMessage(appError, (key) => errorT(key)));
    }
  }

  if (storedToken && (sessionQuery.isPending || sessionQuery.isSuccess)) {
    return (
      <SessionStateCard
        title={t('existingSessionTitle')}
        description={t('redirectingToDashboard')}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="email"
        type="email"
        label={t('email')}
        placeholder={t('emailPlaceholder')}
        error={
          errors.email?.message
            ? errors.email.message === 'invalidEmail'
              ? t('invalidEmail')
              : t('emailRequired')
            : undefined
        }
        autoComplete="email"
        {...register('email')}
      />

      <Input
        id="password"
        type="password"
        label={t('password')}
        placeholder={t('passwordPlaceholder')}
        error={errors.password?.message ? t('passwordRequired') : undefined}
        autoComplete="current-password"
        {...register('password')}
      />

      <Button
        type="submit"
        className="w-full"
        isLoading={isSubmitting}
        loadingText={common('loading')}
      >
        {t('submit')}
      </Button>
    </form>
  );
}