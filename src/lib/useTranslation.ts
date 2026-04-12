'use client';

import { useTranslation as useI18nextTranslation } from 'react-i18next';
import './i18n-config'; // Ensure i18n is initialized

export function useTranslation() {
  const { t, i18n } = useI18nextTranslation('common');

  const lang = i18n.language;

  const switchLanguage = (newLang: string) => {
    i18n.changeLanguage(newLang);
  };

  return { t, lang, switchLanguage };
}
