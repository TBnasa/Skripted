'use client';

import { useState, useEffect } from 'react';
import { getTranslation } from './i18n';

export function useTranslation() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    setLang('tr');
  }, []);

  const t = (key: string) => getTranslation(key, lang);

  return { t, lang };
}
