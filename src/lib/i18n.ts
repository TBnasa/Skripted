type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  en: {
    terminal_header: "Terminal / Chat",
    status_ready: "Status: Ready",
    status_compiling: "Status: Compiling Response...",
    input_required: "Input Required",
    input_desc: "Initialize script generation by describing your requirements.",
    placeholder: "Describe logic to generate...",
    kernel_info: "Kernel: Paper 1.21.1 · Build: Skript 2.14.3",
    launch_engine: "Launch Engine",
    access_engine: "Access Engine",
    view_architecture: "View Architecture",
    ai_asistan: "Assistant",
    user_profile: "Profile",
    copy: "Copy",
    copied: "Copied!",
    verify: "Verify Syntax",
    verifying: "Verifying...",
    ai_expert_insight: "AI Expert Insight",
    scanning_code: "Scanning Code...",
    safe: "Safe",
    warning: "Warning",
    critical_error: "Critical Error",
    required_addons: "Required Addons",
    performance_analysis: "Performance Analysis",
    syntax_analysis: "Syntax Analysis",
    analysis_details: "Analysis Details",
    legal_disclaimer: "© 2026 Skripted IDE. All rights reserved. This platform is not affiliated with Mojang AB or Microsoft.",
    sign_in: "Sign In",
    sign_out: "Sign Out",
    script_editor: "Script Editor",
    waiting_generation: "Waiting for generation...",
    appear_here: "Generated script will appear here",
    thinking_process: "Thinking Process",
  },
  tr: {
    terminal_header: "Terminal / Sohbet",
    status_ready: "Durum: Hazır",
    status_compiling: "Durum: Cevap Hazırlanıyor...",
    input_required: "Girdi Gerekli",
    input_desc: "Gereksinimlerinizi açıklayarak script oluşturmayı başlatın.",
    placeholder: "Oluşturulacak mantığı tarif edin...",
    kernel_info: "Çekirdek: Paper 1.21.1 · Sürüm: Skript 2.14.3",
    launch_engine: "Motoru Başlat",
    access_engine: "Motora Eriş",
    view_architecture: "Mimariyi Görüntüle",
    ai_asistan: "Asistan",
    user_profile: "Profil",
    copy: "Kopyala",
    copied: "Kopyalandı!",
    verify: "Sentaksı Doğrula",
    verifying: "Doğrulanıyor...",
    ai_expert_insight: "Yapay Zeka Uzman Görüşü",
    scanning_code: "Kod Taranıyor...",
    safe: "Güvenli",
    warning: "Uyarı",
    critical_error: "Kritik Hata",
    required_addons: "Gerekli Addonlar",
    performance_analysis: "Performans Analizi",
    syntax_analysis: "Sözdizimi Analizi",
    analysis_details: "Analiz Detayları",
    legal_disclaimer: "© 2026 Skripted IDE. Tüm hakları saklıdır. Bu platform Mojang AB veya Microsoft ile bağlantılı değildir.",
    sign_in: "Giriş Yap",
    sign_out: "Çıkış Yap",
    script_editor: "Script Editörü",
    waiting_generation: "Oluşturulma bekleniyor...",
    appear_here: "Oluşturulan kod burada görünecek",
    thinking_process: "Düşünme Süreci",
  }
};

export const getTranslation = (key: string, lang: string = 'en') => {
  const dictionary = translations[lang.startsWith('tr') ? 'tr' : 'en'];
  return dictionary[key] || translations['en'][key] || key;
};
