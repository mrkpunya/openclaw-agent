import { OAuth2Client } from 'google-auth-library';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// 1. Inisialisasi Client OAuth 2.0
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function main() {
  console.log("🚀 Memulai OpenClaw Agent Service (Direct CLI Mode)...");

  try {
    // 2. Dapatkan Access Token dari Google OAuth 2.0
    const { token } = await oauth2Client.getAccessToken();

    if (!token) {
      throw new Error("Gagal mengambil Access Token dari Google OAuth 2.0");
    }

    console.log("✅ Google OAuth 2.0 Authenticated!");

    // 3. Inject Token ke Environment Variable OpenClaw
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = token;
    process.env.GEMINI_API_KEY = token;

    if (process.env.TELEGRAM_BOT_TOKEN) {
      console.log("🤖 Menghubungkan Gateway ke Telegram Bot...");
    } else {
      console.warn("⚠️ TELEGRAM_BOT_TOKEN belum diset di Railway Variables!");
    }

    // 4. Inisialisasi folder & file konfigurasi minimal (~/.openclaw/config.json)
    const openclawDir = path.join(os.homedir(), '.openclaw');
    if (!fs.existsSync(openclawDir)) {
      fs.mkdirSync(openclawDir, { recursive: true });
    }

    const configPath = path.join(openclawDir, 'config.json');
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
    console.log("📝 Configuration file initialized.");

    // 5. Eksekusi Biner CLI Secara Synchronous (Bypassing SDK & monitorWebChannel)
    console.log("⚡ Executing OpenClaw Gateway Process...");
    
    execSync('npx openclaw gateway run --non-interactive --accept-risk', {
      stdio: 'inherit',
      env: process.env
    });

  } catch (error) {
    console.error("❌ Error eksekusi agent:", error);
  }
}

main();
