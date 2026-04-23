'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import en from '../../public/locales/en/common.json';
import tr from '../../public/locales/tr/common.json';

const dictionaries = { en, tr };

export function useTranslation() {
  const params = useParams();
  const lang = (params?.lang as 'en' | 'tr') || 'en';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const t = (key: string) => {
    // İç içe geçmiş anahtarları destekle (örn: "hero.title")
    const keys = key.split('.');
    let result: any = dictionaries[lang];

    for (const k of keys) {
      result = result?.[k];
    }

    return result || key;
  };

  return {
    t,
    lang,
    isLoaded: mounted
  };
}
