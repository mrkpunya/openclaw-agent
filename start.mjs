import { OAuth2Client } from 'google-auth-library';
import { execSync } from 'child_process';

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

    // 3. Inject Token ke Environment Variable
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = token;
    process.env.GEMINI_API_KEY = token;

    if (process.env.TELEGRAM_BOT_TOKEN) {
      console.log("🤖 Menghubungkan Gateway ke Telegram Bot...");
    }

    // 4. Bypassing TTY Onboarding via CLI Executable
    try {
      console.log("⚡ Eksekusi headless onboarding...");
      execSync('npx openclaw onboard --non-interactive --accept-risk', {
        stdio: 'inherit',
        env: process.env,
      });
    } catch (e) {
      console.log("ℹ️ Onboarding step bypassed/completed.");
    }

    // 5. Load OpenClaw
    const openclaw = await import('openclaw');

    // 6. Jalankan Service Utama / Background Mode
    if (typeof openclaw.monitorWebChannel === 'function') {
      await openclaw.monitorWebChannel();
    } else if (typeof openclaw.waitForever === 'function') {
      await openclaw.waitForever();
    } else if (typeof openclaw.runLegacyCliEntry === 'function') {
      process.argv = ['node', 'start.mjs', 'gateway', 'run'];
      await openclaw.runLegacyCliEntry();
    }
  } catch (error) {
    console.error("❌ Error eksekusi agent:", error);
  }
}

main();
