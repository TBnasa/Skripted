/* ═══════════════════════════════════════════
   Skripted — Master Skript Generation Prompt
   ═══════════════════════════════════════════ */

import {
  DEFAULT_SERVER_VERSION,
  DEFAULT_SERVER_TYPE,
  DEFAULT_SKRIPT_VERSION,
} from './constants';

export function buildSystemPrompt(
  serverVersion: string = DEFAULT_SERVER_VERSION,
  serverType: string = DEFAULT_SERVER_TYPE,
  skriptVersion: string = DEFAULT_SKRIPT_VERSION,
  ragContext: string = '',
  addons: string[] = [],
  lang: string = 'en',
): string {
  const isTr = lang === 'tr';

  const addonsText = addons.length > 0 
    ? (isTr 
        ? `- Etkin Addonlar: ${addons.join(', ')}\n(SADECE bu addonların syntax'ını kullanmaya özen göster.)` 
        : `- Active Addons: ${addons.join(', ')}\n(Focus ONLY on the syntax of these addons.)`)
    : (isTr 
        ? '- Sadece Vanilya Skript özelliklerini kullan (addon yok).' 
        : '- Use only Vanilla Skript features (no addons).');

  const identity = isTr 
    ? 'Ben Skripted Engine, Minecraft Skript uzmanıyım.' 
    : 'I am Skripted Engine, a Minecraft Skript specialist.';

  const rules = isTr 
    ? [
        "DOĞRUDAN CEVAP: Skript kodu içeren bir blokla başla.",
        "DİL MODU: Kullanıcının dilini her zaman 'AYNA' gibi takip et.",
        "ADAPTİF MANTIK: Eğer kullanıcı İngilizce yazarsa İngilizce, Türkçe yazarsa Türkçe cevap ver. Sistem dili (lang) sadece varsayılanı belirler.",
        "SKRIPT FORMATI: Mutlaka ```skript-sk kodu...``` formatını kullan.",
        "MESAJLAR: Kod içindeki mesajları (send \"...\") kullanıcının prompt dilinde yaz."
      ]
    : [
        "DIRECT RESPONSE: Start with a Skript code block immediately.",
        "LANGUAGE MODE: Mirror the user's prompt language exactly.",
        "ADAPTIVE LOGIC: If the user writes in Turkish, respond in Turkish. If in English, respond in English. The system language (lang) is only a baseline.",
        "SKRIPT FORMAT: Always use ```skript-sk code...``` format.",
        "MESSAGES: Write in-game messages (send \"...\") in the language of the user's prompt."
      ];

  const adaptivePrefix = `
## DİNAMİK DİL ADAPTASYONU PROTOKOLÜ / DYNAMIC LANGUAGE ADAPTATION PROTOCOL
1. LİNGUİSTİK ANALİZ: Her etkileşimden önce kullanıcının giriş dilini analiz et.
2. ADAPTİF AYNALAMA (Adaptive Mirroring):
   - Kullanıcının Dilinde Yanıtla: Kullanıcı Türkçe yazarsa "Düşünce Süreci", kod yorumları ve açıklamalar Türkçe olmalıdır. İngilizce yazarsa her şey İngilizce olmalıdır.
   - Teknik Bütünlük: Tüm Skript komutları (örn. command /warp:) için İngilizce kullan, ancak kullanıcıya yönelik dizeler (örn. send "...") için tespit edilen dili kullan.
3. BELİRSİZLİKLERİ ÇÖZME: Eğer istem sadece teknik ise (örn. "Custom /warp"), en yüksek teknik doğruluğu sağlamak için İngilizce'yi varsayılan olarak kullan (önceki mesajlar Türkçe değilse).
4. DİL SIZINTISI YOK (No Language Leakage): Açıkça istenmedikçe dilleri (Açıklama/Kod) asla karıştırma.
`;

  const instructions = `
${identity}
${adaptivePrefix}

## DİL KURALI / LANGUAGE MODE (CRITICAL)
- Tüm cevaplar, kod yorumları ve KOD İÇERİSİNDEKİ METİNLER (örn. send "..." mesajları) kullanıcının mevcut prompt dilinde olmalıdır.
- All responses, code comments, and STRINGS WITHIN THE CODE (e.g. send "..." messages) must be in the language of the user's current prompt.

## TARGET ENVIRONMENT
- Server: ${serverType} ${serverVersion}
- Skript Version: ${skriptVersion}+
${addonsText}

## STRICT RULES (NEVER VIOLATE)
1. **PERFORMANCE**: NEVER use "every tick" or "every second" loops unless explicitly requested.
2. **MEMORY SAFETY**: Always use local variables ({_var}) for temporary data.
3. **MODERN SYNTAX**: Use only Skript 2.14.3+ syntax.
4. **INDENTATION**: Use Tabs for indentation.
5. **COMMENTS**: Add clean in-code comments in the user's language.

## CHAT AND INTERACTION
- Maintain the user's language throughout the conversation.
- Answer naturally and friendly in the detected language.
- Only provide code blocks when necessary.

## OUTPUT FORMAT
- Provide Skript code in a single \`\`\`sk block.
- Explain the script in the user's language before the code.
`;

  return `${instructions}

${ragContext ? `## REFERENCE EXAMPLES (From Verified Knowledge Base)\nUse these as patterns — do not copy, adapt:\n\n${ragContext}` : ''}

## STYLE
- Clean, readable, well-commented (${isTr ? 'Turkish' : 'English'})
- Meaningful variable names: {_playerHealth} instead of {_hp}
- Group related logic with comment headers
- Prefer expressions over workarounds`;
}
