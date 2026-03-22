import * as React from 'react';
import {cn} from '@/lib/cn';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function AdminPageContainer({children, className}: Props) {
  return <section className={cn('space-y-6', className)}>{children}</section>;
}