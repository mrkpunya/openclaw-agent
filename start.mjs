import { OAuth2Client } from 'google-auth-library';

// 1. Setup OAuth 2.0 Client
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
    // 2. Dapatkan Access Token dari OAuth 2.0
    const { token } = await oauth2Client.getAccessToken();

    if (!token) {
      throw new Error("Gagal mengambil Access Token dari Google OAuth 2.0");
    }

    console.log("✅ Google OAuth 2.0 Authenticated!");

    // 3. Inject Token ke Environment Variable
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = token;
    process.env.GEMINI_API_KEY = token;

    if (process.env.TELEGRAM_BOT_TOKEN) {
      console.log("🤖 Menghubungkan Gateway ke Telegram Bot...");
    } else {
      console.warn("⚠️ TELEGRAM_BOT_TOKEN belum terdeteksi di Railway Variables.");
    }

    // 4. Force Process Arguments agar OpenClaw berjalan mode non-interaktif
    process.argv = [
      process.argv[0],
      process.argv[1],
      'onboard',
      '--non-interactive',
      '--accept-risk'
    ];

    // 5. Load OpenClaw
    const openclaw = await import('openclaw');

    // 6. Jalankan Service Utama
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
