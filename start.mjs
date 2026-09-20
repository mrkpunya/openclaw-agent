import { OAuth2Client } from 'google-auth-library';

// Inisialisasi OAuth2 Client murni
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function main() {
  console.log("🚀 Memulai OpenClaw Agent dengan Integrasi Telegram...");

  try {
    const openclaw = await import('openclaw');

    // Mendapatkan access token menggunakan OAuth2Client (tanpa memicu GoogleAuth)
    const { token } = await oauth2Client.getAccessToken();
    if (token) {
      console.log("✅ Google OAuth 2.0 Authenticated successfully!");
    }

    // Peringatan jika token bot Telegram belum diset
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.warn("⚠️ TELEGRAM_BOT_TOKEN belum diset di Railway Variables!");
    } else {
      console.log("🤖 Menghubungkan ke Bot Telegram...");
    }

    // Jalankan service utama OpenClaw
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
