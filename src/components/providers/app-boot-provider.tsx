'use client';

import {useEffect, useState} from 'react';
import AppBootScreen from '@/components/common/app-boot-screen';

type Props = {
  children: React.ReactNode;
};

export default function AppBootProvider({children}: Props) {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsBooting(false);
    }, 900);

    return () => window.clearTimeout(timer);
  }, []);

  if (isBooting) {
    return <AppBootScreen />;
  }

  return <>{children}</>;
}