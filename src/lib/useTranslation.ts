'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import en from '../../public/locales/en/common.json';
import tr from '../../public/locales/tr/common.json';

const dictionaries = { en, tr };

export function useTranslation() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  
  const lang = (params?.lang as 'en' | 'tr') || 'en';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLanguage = (newLang: string) => {
    if (!pathname) return;
    
    // Geçerli dili yol üzerinden değiştiriyoruz
    let newPathname = pathname;
    if (pathname.startsWith('/en/') || pathname === '/en') {
      newPathname = pathname.replace(/^\/en/, `/${newLang}`);
    } else if (pathname.startsWith('/tr/') || pathname === '/tr') {
      newPathname = pathname.replace(/^\/tr/, `/${newLang}`);
    } else {
      newPathname = `/${newLang}${pathname}`;
    }
    
    router.push(newPathname);
  };

  const t = (key: string, options?: { defaultValue?: string; [key: string]: any }) => {
    // İç içe geçmiş anahtarları destekle (örn: "hero.title")
    const keys = key.split('.');
    let result: any = dictionaries[lang];

    for (const k of keys) {
      result = result?.[k];
    }

    if (result === undefined && options?.defaultValue) {
      return options.defaultValue;
    }

    // Basit değişken yerleştirme (interpolation) desteği eklenebilir
    if (typeof result === 'string' && options) {
      Object.keys(options).forEach(optKey => {
        if (optKey !== 'defaultValue') {
          result = result.replace(new RegExp(`{{${optKey}}}`, 'g'), options[optKey]);
        }
      });
    }

    return result || key;
  };

  return {
    t,
    lang,
    mounted,
    switchLanguage
  };
}
