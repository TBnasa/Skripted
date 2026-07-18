'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

async function loadResources(lng: string) {
  const common = await import(`../../public/locales/${lng}/common.json`);
  return { common: common.default };
}

const detectedLng = typeof window !== 'undefined'
  ? localStorage.getItem('i18nextLng') || navigator.language.split('-')[0] || 'en'
  : 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {},
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

loadResources(detectedLng).then((res) => {
  i18n.addResourceBundle(detectedLng, 'common', res.common);
});

i18n.on('languageChanged', async (lng) => {
  if (!i18n.hasResourceBundle(lng, 'common')) {
    const res = await loadResources(lng);
    i18n.addResourceBundle(lng, 'common', res.common);
  }
});

export default i18n;
