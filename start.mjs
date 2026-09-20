import { OAuth2Client } from 'google-auth-library';
import { spawn } from 'child_process';
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
  console.log("🚀 Memulai OpenClaw Agent Service (Mode Direct Subprocess)...");

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
      console.warn("⚠️ TELEGRAM_BOT_TOKEN belum diset di Railway Variables!");
    }

    // 4. Buat folder & file konfigurasi minimal untuk bypass onboarding TTY
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

    // 5. Eksekusi langsung CLI OpenClaw (Memutus total panggilan ke monitorWebChannel)
    console.log("⚡ Executing OpenClaw Gateway Process...");
    
    const openclawProcess = spawn('npx', ['openclaw', 'gateway', 'run', '--non-interactive', '--accept-risk'], {
      stdio: 'inherit',
      env: process.env
    });

    openclawProcess.on('error', (err) => {
      console.error("❌ Failed to start OpenClaw process:", err);
    });

    openclawProcess.on('exit', (code) => {
      console.log(`⚠️ OpenClaw process exited with code ${code}`);
    });

  } catch (error) {
    console.error("❌ Error eksekusi agent:", error);
  }
}

main();
