'use client';

import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import './i18n-config'; // Ensure i18n is initialized

export function useTranslation() {
  const { t, i18n } = useI18nextTranslation('common');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lang = i18n.language || 'en';

  const switchLanguage = (newLang: string) => {
    i18n.changeLanguage(newLang);
  };

  // Hydration mismatch'i önlemek için mount olana kadar bekleyebiliriz 
  // veya t fonksiyonunu güvenli bir şekilde dönebiliriz.
  // react-i18next zaten client-side'da çalıştığı için t(key) 
  // server-side render sırasında fallback dilini kullanacaktır.
  
  return { t, lang, switchLanguage, mounted };
}
