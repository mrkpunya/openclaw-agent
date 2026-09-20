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
    // 2. Refresh Access Token
    const { token } = await oauth2Client.getAccessToken();

    if (!token) {
      throw new Error("Gagal mengambil Access Token dari Google OAuth 2.0");
    }

    console.log("✅ Google OAuth 2.0 Authenticated!");

    // 3. Set Environment Variable
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = token;
    process.env.GEMINI_API_KEY = token;

    if (process.env.TELEGRAM_BOT_TOKEN) {
      console.log("🤖 Menghubungkan Gateway ke Telegram Bot...");
    }

    // 4. Load OpenClaw
    const openclaw = await import('openclaw');

    // 5. Jalankan onboarding otomatis tanpa TTY interaktif jika fungsi eksekusi perintah tersedia
    if (typeof openclaw.runExec === 'function') {
      console.log("⚡ Menjalankan Onboarding Non-Interactive...");
      await openclaw.runExec('openclaw', ['onboard', '--non-interactive', '--accept-risk']);
    } else if (typeof openclaw.runCommandWithTimeout === 'function') {
      console.log("⚡ Menjalankan Onboarding Non-Interactive...");
      await openclaw.runCommandWithTimeout(['onboard', '--non-interactive', '--accept-risk']);
    }

    // 6. Jalankan Service Utama / Listening Mode
    if (typeof openclaw.waitForever === 'function') {
      await openclaw.waitForever();
    } else if (typeof openclaw.runLegacyCliEntry === 'function') {
      // Mengoper argumen non-interaktif ke CLI entry
      process.argv = ['node', 'start.mjs', 'onboard', '--non-interactive', '--accept-risk'];
      await openclaw.runLegacyCliEntry();
    }
  } catch (error) {
    console.error("❌ Error eksekusi agent:", error);
  }
}

main();
