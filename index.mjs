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
  console.log("🔥 MEMULAI RUNTIME V11 - CORRECT TELEGRAM ID (8965095104)...");

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

    const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || "openclaw-railway-secret-token";
    process.env.OPENCLAW_GATEWAY_TOKEN = gatewayToken;

    // 4. Padam konfigurasi lama dan buat konfigurasi baru dengan ID Telegram yang betul
    const openclawDir = path.join(os.homedir(), '.openclaw');
    if (!fs.existsSync(openclawDir)) {
      fs.mkdirSync(openclawDir, { recursive: true });
    }

    const configPath = path.join(openclawDir, 'config.json');
    
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }

    const initialConfig = {
      onboarded: true,
      acceptRisk: true,
      gateway: {
        mode: "local"
      },
      channels: {
        telegram: {
          enabled: true,
          botToken: process.env.TELEGRAM_BOT_TOKEN || "",
          allowFrom: ["8965095104"] // ID Telegram yang betul
        }
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(initialConfig, null, 2));
    console.log("📝 CONFIG UPDATED: Telegram Owner ID set to 8965095104.");

    // 5. Eksekusi Biner CLI Gateway
    const command = `npx openclaw gateway run --allow-unconfigured --token ${gatewayToken}`;
    console.log(`⚡ Executing command: npx openclaw gateway run --allow-unconfigured --token [PROTECTED]`);
    
    execSync(command, {
      stdio: 'inherit',
      env: process.env
    });

  } catch (error) {
    console.error("❌ Error eksekusi agent:", error);
  }
}

main();
