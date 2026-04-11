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
    system_status_ok: "Supabase MCP: Database Deployed | Sidebar: Connected | Security: RLS Active",
    code_verified: "✅ Skripted Engine Tarafından Doğrulandı",
    hero_title: "Skript Yazmanın En Akılcı Hali",
    hero_desc: "Türkiye'nin ilk AI destekli Minecraft Skript IDE'si. 120 Milyar parametreli modellerle kodunuzu yazın, denetleyin ve saniyeler içinde yayına alın.",
    feature1_title: "Yapay Zeka Denetleyicisi",
    feature1_desc: "Kodunuz sadece yazılmaz; AI Judge tarafından mantık hatalarına karşı 120B parametreli modellerle denetlenir.",
    feature2_title: "Hibrit Bulut Depolama",
    feature2_desc: "Sınırsız script kapasitesi. Kodlarınız en güvenli hibrit bulut sisteminde (Postgres + Storage) şifrelenmiş olarak saklanır.",
    feature3_title: "Evrensel Addon Desteği",
    feature3_desc: "TuSKe'den SkQuantum'a kadar tüm popüler addonlar için otomatik sentaks ve optimizasyon desteği.",
  }
};

export const getTranslation = (key: string, _lang: string = 'tr') => {
  const dictionary = translations['tr'];
  return dictionary[key] || key;
};
