import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
      console.warn("⚠️ TELEGRAM_BOT_TOKEN belum diset di Railway Variables!");
    }

    // 4. Buat folder & file konfigurasi minimal untuk bypass onboarding TTY
    const openclawDir = path.join(os.homedir(), '.openclaw');
    if (!fs.existsSync(openclawDir)) {
      fs.mkdirSync(openclawDir, { recursive: true });
    }

    const configPath = path.join(openclawDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      const initialConfig = {
        onboarded: true,
        acceptRisk: true,
        channels: {
          telegram: {
            enabled: true,
            botToken: process.env.TELEGRAM_BOT_TOKEN || ""
          }
        }
      };
      fs.writeFileSync(configPath, JSON.stringify(initialConfig, null, 2));
      console.log("📝 Configuration file created automatically.");
    }

    // 5. Override process.argv untuk memaksa eksekusi Telegram Gateway
    process.argv = [
      process.argv[0],
      process.argv[1],
      'gateway',
      'run',
      '--non-interactive',
      '--accept-risk'
    ];

    // 6. Import OpenClaw
    const openclaw = await import('openclaw');

    // 7. Panggil CLI entry point langsung (TANPA memanggil monitorWebChannel)
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
