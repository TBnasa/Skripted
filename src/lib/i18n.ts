type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
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
    waiting_generation: "Kod oluşturuluyor...",
    appear_here: "Oluşturulan kod burada görünecek",
    thinking_process: "Düşünme Süreci",
    admin_tools: "Yönetici Araçları",
    system_status_ok: "Database: Connected | Auth: GitHub Active | UX: Enhanced",
    code_verified: "✅ Skripted Engine Tarafından Doğrulandı",
    hero_title: "Daha İyi Minecraft Scriptleri Yazın",
    hero_desc: "Deep Context Engine tarafından desteklenen elit bulut tabanlı script IDE'si. Evrensel Uyumluluk ile Skript kodunu oluşturun, analiz edin ve optimize edin.",
    feature1_title: "Deep Context Engine",
    feature1_desc: "250+ seçkin mimari örnekle beslenen derin bağlam motoru.",
    feature2_title: "Live Logic Guard",
    feature2_desc: "Siz yazarken hataları yakalayan canlı mantık koruması.",
    feature3_title: "Evrensel Uyumluluk",
    feature3_desc: "Tüm Minecraft sürümleri ve Skript addonları ile tam uyum.",
  }
};

export const getTranslation = (key: string, _lang: string = 'tr') => {
  const dictionary = translations['tr'];
  return dictionary[key] || key;
};
