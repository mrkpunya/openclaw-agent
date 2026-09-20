import { OAuth2Client } from 'google-auth-library';

// 1. Inisialisasi OAuth 2.0 Client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function main() {
  console.log("🚀 Memulai OpenClaw Agent Service...");

  try {
    // 2. Dapatkan Access Token OAuth 2.0
    const tokenResponse = await oauth2Client.getAccessToken();
    const accessToken = tokenResponse.token;

    if (!accessToken) {
      throw new Error("Gagal mendapatkan Access Token dari Google OAuth 2.0");
    }

    console.log("✅ OAuth 2.0 Access Token berhasil didapatkan!");

    // 3. Injeksikan token ke environment variable agar dibaca OpenClaw
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = accessToken;
    process.env.GEMINI_API_KEY = accessToken;
    
    // Pastikan Telegram Token tersedia
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.warn("⚠️ TELEGRAM_BOT_TOKEN belum diset di Railway Variables!");
    } else {
      console.log("🤖 Menghubungkan Gateway ke Bot Telegram...");
    }

    // 4. Load OpenClaw setelah environment siap
    const openclaw = await import('openclaw');

    // 5. Jalankan Service Utama
    if (typeof openclaw.runLegacyCliEntry === 'function') {
      await openclaw.runLegacyCliEntry();
    } else if (typeof openclaw.waitForever === 'function') {
      await openclaw.waitForever();
    }
  } catch (error) {
    console.error("❌ Error eksekusi agent:", error);
  }
}

main();
