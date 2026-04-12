'use client';

type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  en: {
    // General
    launch_engine: "Launch Engine",
    access_engine: "Access Engine",
    view_architecture: "View Architecture",
    ai_asistan: "Assistant",
    user_profile: "Profile",
    copy: "Copy",
    copied: "Copied!",
    verify: "Verify Syntax",
    verifying: "Verifying...",
    sign_in: "Sign In",
    sign_out: "Sign Out",
    
    // Chat
    terminal_header: "Terminal / Chat",
    status_ready: "Status: Ready",
    status_compiling: "Status: Compiling Response...",
    input_required: "Input Required",
    input_desc: "Explain your requirements to start generating the script.",
    placeholder: "Describe the logic you want to create...",
    kernel_info: "Kernel: Paper 1.21.1 · Version: Skript 2.14.3",
    script_editor: "Script Editor",
    waiting_generation: "Generating code...",
    appear_here: "Generated code will appear here",
    thinking_process: "Thinking Process",
    
    // Hero
    hero_title_1: "Imagine,",
    hero_title_2: "AI Builds.",
    hero_desc: "The world's most advanced AI-powered Minecraft Skript IDE. Write, audit, and publish your code in seconds with 120B parameter models.",
    explore_gallery: "Explore Gallery",
    
    // Features
    feature1_title: "AI AUDITOR",
    feature1_desc: "Your code isn't just written; it's audited for logic errors by 120B parameter models via AI Judge.",
    feature2_title: "HYBRID CLOUD STORAGE",
    feature2_desc: "Unlimited script capacity. Your code is stored encrypted in our secure hybrid cloud system (Postgres + Storage).",
    feature3_title: "UNIVERSAL ADDON SUPPORT",
    feature3_desc: "Automatic syntax and optimization support for all popular addons from TuSKe to SkQuantum.",
    
    // Gallery & Social
    translate: "Translate",
    original: "Original",
    comments: "Comments",
    write_comment: "Write a comment...",
    post: "Post",
    likes: "Likes",
    downloads: "Downloads",
    author: "Author",
    category: "Category",
    tags: "Tags",
    
    // Status
    admin_tools: "Admin Tools",
    system_status_ok: "Supabase MCP: Database Deployed | Sidebar: Connected | Security: RLS Active",
    code_verified: "✅ Verified by Skripted Engine",
    legal_disclaimer: "© 2026 Skripted IDE. All rights reserved. Not affiliated with Mojang AB or Microsoft.",
  },
  tr: {
    // Genel
    launch_engine: "Motoru Başlat",
    access_engine: "Motora Eriş",
    view_architecture: "Mimariyi Görüntüle",
    ai_asistan: "Asistan",
    user_profile: "Profil",
    copy: "Kopyala",
    copied: "Kopyalandı!",
    verify: "Sentaksı Doğrula",
    verifying: "Doğrulanıyor...",
    sign_in: "Giriş Yap",
    sign_out: "Çıkış Yap",

    // Sohbet
    terminal_header: "Terminal / Sohbet",
    status_ready: "Durum: Hazır",
    status_compiling: "Durum: Cevap Hazırlanıyor...",
    input_required: "Girdi Gerekli",
    input_desc: "Gereksinimlerinizi açıklayarak script oluşturmayı başlatın.",
    placeholder: "Oluşturulacak mantığı tarif edin...",
    kernel_info: "Çekirdek: Paper 1.21.1 · Sürüm: Skript 2.14.3",
    script_editor: "Script Editörü",
    waiting_generation: "Kod oluşturuluyor...",
    appear_here: "Oluşturulan kod burada görünecek",
    thinking_process: "Düşünme Süreci",

    // Hero
    hero_title_1: "Hayal Edin,",
    hero_title_2: "AI Yazsın.",
    hero_desc: "Dünyanın en gelişmiş AI destekli Minecraft Skript IDE'si. 120 Milyar parametreli modellerle kodunuzu saniyeler içinde yazın, denetleyin ve yayınlayın.",
    explore_gallery: "Galeriyi Keşfet",

    // Özellikler
    feature1_title: "YAPAY ZEKA DENETLEYİCİSİ",
    feature1_desc: "Kodunuz sadece yazılmaz; AI Judge tarafından mantık hatalarına karşı 120B parametreli modellerle denetlenir.",
    feature2_title: "HİBRİT BULUT DEPOLAMA",
    feature2_desc: "Sınırsız script kapasitesi. Kodlarınız en güvenli hibrit bulut sisteminde (Postgres + Storage) şifrelenmiş olarak saklanır.",
    feature3_title: "EVRENSEL ADDON DESTEĞİ",
    feature3_desc: "TuSKe'den SkQuantum'a kadar tüm popüler addonlar için otomatik sentaks ve optimizasyon desteği.",

    // Galeri & Sosyal
    translate: "Çevir",
    original: "Orijinal",
    comments: "Yorumlar",
    write_comment: "Bir yorum yaz...",
    post: "Paylaş",
    likes: "Beğeni",
    downloads: "İndirme",
    author: "Yazar",
    category: "Kategori",
    tags: "Etiketler",

    // Durum
    admin_tools: "Yönetici Araçları",
    system_status_ok: "Supabase MCP: Database Deployed | Sidebar: Connected | Security: RLS Active",
    code_verified: "✅ Skripted Engine Tarafından Doğrulandı",
    legal_disclaimer: "© 2026 Skripted IDE. Tüm hakları saklıdır. Bu platform Mojang AB veya Microsoft ile bağlantılı değildir.",
  }
};

export const getTranslation = (key: string, lang: string = 'en') => {
  const dictionary = translations[lang] || translations['en'];
  return dictionary[key] || key;
};
