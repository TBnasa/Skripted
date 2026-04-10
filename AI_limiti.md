# AI Limitlerini Hızla Tüketebilecek Sistemler Analizi

Proje içerisinde LLM (OpenRouter) ve Vektör Veritabanı (Pinecone) limitlerini hızla bitirebilecek ve maliyet artışına sebep olabilecek kritik mekanizmalar aşağıdadır:

## 1. Otonom Self-Healing (Kendi Kendine İyileştirme) Motoru 🚨
`src/app/chat/page.tsx` içerisindeki bu mekanizma, AI limitleri için en büyük "sessiz" tüketicidir:
- **Çift İstek:** Her kod üretiminden sonra önce `/api/verify` (LLM tabanlı analiz) çalışır.
- **Düzeltme İstekleri:** Eğer hata bulunursa, kullanıcı hiçbir şey yapmadan arka planda **ikinci bir tam LLM isteği** atılarak kod düzeltilmeye çalışılır.
- **Sonuç:** Tek bir kullanıcı sorusu, arka planda 3 farklı LLM çağrısına (Üretim + Analiz + Düzeltme) dönüşebilir. Bu da limitlerin 3 kat hızlı bitmesi demektir.

## 2. Kimlik Doğrulaması Olmayan API Rotaları 🔓
`/api/chat` ve `/api/verify` rotalarında Clerk `auth()` kontrolü bulunmamaktadır:
- **Bot Saldırıları:** Herhangi bir bot veya kötü niyetli kullanıcı, sisteme giriş yapmadan bu API uçlarını milyonlarca kez çağırabilir.
- **Maliyet:** Giriş zorunluluğu olmadığı için API anahtarlarınız (OpenRouter/Pinecone) halka açık bir kaynak gibi tüketilebilir.

## 3. RAG Bağlam (Context) Yoğunluğu 📚
`src/lib/pinecone.ts` ve `src/app/api/chat/route.ts` içerisindeki RAG yapısı:
- **Top-K Örnekler:** Her soruda Pinecone'dan gelen çok sayıda kod örneği sistem promptuna eklenir.
- **Token Şişmesi:** Eğer gelen örnekler uzunsa, her istekte LLM'e gönderilen "Input Token" miktarı çok yüksek olur. Bu da hem gecikmeye hem de kotanın hızla dolmasına neden olur.

## 4. Uzun Sohbet Geçmişi (Chat History) 💬
Sistem her istekte son 10 mesajı LLM'e göndermektedir:
- Sohbet uzadıkça her yeni soruda gönderilen veri miktarı (context) artar. 
- Özellikle büyük kod blokları içeren geçmiş mesajlar, her seferinde tekrar tekrar LLM'e gönderildiği için token tüketimi katlanarak artar.

## 5. Hız Sınırlaması (Rate Limiting) Eksikliği ⏳
Sunucu tarafında (Edge/Node.js) istek başına bir sınırlama yoktur:
- Bir kullanıcı saniyeler içinde onlarca "Ağır" (heavy) istek atarak API limitlerini dakikalar içinde sıfırlayabilir.

---

### Öneri:
Bu limitlerin korunması için **Self-Healing** mekanizmasının sadece kullanıcı onayladığında çalışması ve tüm AI rotalarına **Clerk Auth + Rate Limit** eklenmesi kritik önem taşımaktadır.
