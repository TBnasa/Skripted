export const locales = ['en', 'tr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

const dictionaries = {
  en: () => import('../../public/locales/en/common.json').then((module) => module.default),
  tr: () => import('../../public/locales/tr/common.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale] ? dictionaries[locale]() : dictionaries[defaultLocale]();
};
