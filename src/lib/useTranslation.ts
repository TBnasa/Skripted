'use client';

import { useState, useEffect } from 'react';
import { getTranslation } from './i18n';

export function useTranslation() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const browserLang = navigator.language.split('-')[0];
      setLang(browserLang);
    }
  }, []);

  const t = (key: string) => getTranslation(key, lang);

  return { t, lang };
}
