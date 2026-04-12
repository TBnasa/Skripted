'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// JSON dosyalarını doğrudan import ediyoruz (Build sırasında hata almamak için)
import enCommon from '../../public/locales/en/common.json';
import trCommon from '../../public/locales/tr/common.json';

const resources = {
  en: { common: enCommon },
  tr: { common: trCommon },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;
