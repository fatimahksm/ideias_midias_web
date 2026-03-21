'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {toAppError} from '@/lib/api/client';
import {adminLoginSchema, type AdminLoginFormValues} from '../schema';
import {adminLogin} from '../api';

export default function LoginForm() {
  const t = useTranslations('AdminLoginPage');
  const common = useTranslations('Common');

  const [serverError, setServerError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

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
    setServerError('');
    setSuccessMessage('');

    try {
      const result = await adminLogin(values);

      const token = result.accessToken || result.token || '';

      if (!token) {
        setSuccessMessage(t('loginSuccessNoToken'));
        return;
      }

      localStorage.setItem('admin_token', token);
      setSuccessMessage(t('loginSuccess'));
    } catch (error) {
      const appError = toAppError(error);
      setServerError(appError.message || t('genericError'));
    }
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
        error={
          errors.password?.message
            ? t('passwordRequired')
            : undefined
        }
        autoComplete="current-password"
        {...register('password')}
      />

      {serverError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

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