'use client';

import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import './i18n-config'; // Ensure i18n is initialized

export function useTranslation() {
  const translation = useI18nextTranslation('common');
  const t = translation?.t || ((key: string) => key);
  const i18n = translation?.i18n;
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lang = i18n?.language || 'en';

  const switchLanguage = (newLang: string) => {
    if (i18n) {
      i18n.changeLanguage(newLang);
    }
  };

  return { t, lang, switchLanguage, mounted };
}
