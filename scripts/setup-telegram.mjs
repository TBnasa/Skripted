/**
 * Telegram Webhook Setup Script
 * Usage: node scripts/setup-telegram.mjs
 */

import 'dotenv/config';

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!botToken || !siteUrl) {
  console.error('❌ Missing environment variables: TELEGRAM_BOT_TOKEN or NEXT_PUBLIC_SITE_URL');
  process.exit(1);
}

const webhookUrl = `${siteUrl}/api/telegram-webhook`;
const telegramApiUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;

console.log(`🚀 Setting webhook to: ${webhookUrl}`);

try {
  const response = await fetch(telegramApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: botToken, // Using botToken as secret for simplicity, or any other env var
    }),
  });
  const data = await response.json();

  if (data.ok) {
    console.log('✅ Telegram Webhook set successfully!');
    console.log(data.description);
  } else {
    console.error('❌ Failed to set Telegram Webhook:', data.description);
  }
} catch (error) {
  console.error('❌ Error setting Telegram Webhook:', error.message);
}
