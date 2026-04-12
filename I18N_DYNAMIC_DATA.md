# Proje i18n Dinamik Veri Yapısı Önerisi

Supabase (PostgreSQL) üzerinden gelen dinamik verilerin (Skript başlıkları, açıklamaları, kullanıcı biyografileri vb.) çok dilli desteklenmesi için aşağıdaki yapı önerilmektedir:

## 1. JSONB Kolon Yapısı (Önerilen)

Tablolardaki düz metin kolonları yerine (veya yanına) `translations` adında bir `JSONB` kolonu eklenmelidir.

**Örnek `gallery_posts` tablosu:**
- `id`: uuid
- `title`: text (varsayılan başlık)
- `description`: text (varsayılan açıklama)
- `translations`: jsonb

**`translations` içeriği:**
```json
{
  "en": {
    "title": "Advanced Economy",
    "description": "A very advanced economy script."
  },
  "tr": {
    "title": "Gelişmiş Ekonomi",
    "description": "Çok gelişmiş bir ekonomi skripti."
  }
}
```

## 2. UI Entegrasyonu

Frontend tarafında veriyi çekerken mevcut dile göre eşleşen metni göstermek için bir yardımcı fonksiyon veya doğrudan erişim kullanılabilir:

```typescript
const { lang } = useTranslation();

const title = post.translations?.[lang]?.title || post.title;
const description = post.translations?.[lang]?.description || post.description;
```

## 3. Otomatik Çeviri Akışı (Edge Functions)

Yeni bir içerik eklendiğinde veya güncellendiğinde, Supabase Edge Functions kullanılarak otomatik çeviri tetiklenebilir:

1. Kullanıcı Türkçe bir skript paylaştı.
2. `db` trigger'ı Edge Function'ı tetikledi.
3. Edge Function (OpenAI veya DeepL API kullanarak) metni İngilizceye çevirdi.
4. Çeviri sonucu `translations` kolonuna kaydedildi.

## 4. Filtreleme ve Arama

Dile göre filtreleme yapmak için PostgreSQL'in JSONB sorgu yetenekleri kullanılabilir:

```sql
SELECT * FROM gallery_posts 
WHERE translations->'en'->>'title' ILIKE '%economy%';
```

Bu yapı sayesinde veritabanı şemasını her yeni dil için değiştirmeye gerek kalmaz ve esnek bir yapı sağlanır.
