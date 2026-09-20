import { OAuth2Client } from 'google-auth-library';
import { execSync } from 'child_process';
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
  console.log("🔥 MEMULAI RUNTIME V7 (server.mjs) - ALLOW UNCONFIGURED GATEWAY...");

  try {
    // 2. Refresh Access Token dari Google OAuth 2.0
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
      gateway: {
        mode: "local"
      },
      channels: {
        telegram: {
          enabled: true,
          botToken: process.env.TELEGRAM_BOT_TOKEN || ""
        }
      }
    };
    fs.writeFileSync(configPath, JSON.stringify(initialConfig, null, 2));
    console.log("📝 Configuration file initialized.");

    // 5. Eksekusi Biner CLI Gateway dengan flag --allow-unconfigured
    const command = 'npx openclaw gateway run --allow-unconfigured';
    console.log(`⚡ Executing command: ${command}`);
    
    execSync(command, {
      stdio: 'inherit',
      env: process.env
    });

  } catch (error) {
    console.error("❌ Error eksekusi agent:", error);
  }
}

main();
