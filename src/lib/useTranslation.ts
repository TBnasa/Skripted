'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTranslation } from './i18n';

export function useTranslation() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'en';
    setLang(savedLang);
  }, []);

  const t = useCallback((key: string) => getTranslation(key, lang), [lang]);

  const switchLanguage = useCallback((newLang: string) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  }, []);

  return { t, lang, switchLanguage };
}
