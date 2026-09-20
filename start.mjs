import { GoogleAuth } from 'google-auth-library';

// Inisialisasi Auth Client Google OAuth 2.0
const auth = new GoogleAuth({
  credentials: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

async function main() {
  console.log("🚀 Memulai OpenClaw Agent dengan Integrasi Telegram...");

  try {
    const openclaw = await import('openclaw');
    
    // Verifikasi Token Google
    const client = await auth.getClient();
    await client.getAccessToken();
    console.log("✅ Google OAuth 2.0 Authenticated!");

    // Cek ketersediaan Token Telegram
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.warn("⚠️ TELEGRAM_BOT_TOKEN belum diset di Railway Variables!");
    } else {
      console.log("🤖 Menghubungkan ke Bot Telegram...");
    }

    // Jalankan entry point OpenClaw
    if (typeof openclaw.runLegacyCliEntry === 'function') {
      await openclaw.runLegacyCliEntry();
    } else if (typeof openclaw.waitForever === 'function') {
      await openclaw.waitForever();
    }
  } catch (error) {
    console.error("❌ Error saat menjalankan agent:", error);
  }
}

main();
