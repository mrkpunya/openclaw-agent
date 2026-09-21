import { OAuth2Client } from 'google-auth-library';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function main() {
  console.log("🔥 MEMULAI RUNTIME V13 - EXPLICIT CONFIG BINDING...");

  try {
    const { token } = await oauth2Client.getAccessToken();

    if (!token) {
      throw new Error("Gagal mengambil Access Token dari Google OAuth 2.0");
    }

    console.log("✅ Google OAuth 2.0 Authenticated!");

    process.env.GOOGLE_GENERATIVE_AI_API_KEY = token;
    process.env.GEMINI_API_KEY = token;

    const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || "openclaw-railway-secret-token";
    process.env.OPENCLAW_GATEWAY_TOKEN = gatewayToken;

    const fullConfig = {
      onboarded: true,
      acceptRisk: true,
      gateway: {
        mode: "local"
      },
      channels: {
        telegram: {
          enabled: true,
          botToken: process.env.TELEGRAM_BOT_TOKEN || "",
          allowFrom: ["8965095104"]
        }
      }
    };

    const configContent = JSON.stringify(fullConfig, null, 2);

    // Tulis ke ~/.openclaw/config.json
    const homeOpenclawDir = path.join(os.homedir(), '.openclaw');
    if (!fs.existsSync(homeOpenclawDir)) {
      fs.mkdirSync(homeOpenclawDir, { recursive: true });
    }
    fs.writeFileSync(path.join(homeOpenclawDir, 'config.json'), configContent);

    // Tulis juga ke /app/config.json
    const localConfigPath = path.join(process.cwd(), 'config.json');
    fs.writeFileSync(localConfigPath, configContent);

    console.log("📝 CONFIG BIND: Successfully written with Telegram Owner ID 8965095104.");

    // Paksa biner CLI membaca file konfigurasi secara spesifik
    const command = `npx openclaw gateway run --config ${localConfigPath} --token ${gatewayToken}`;
    console.log(`⚡ Executing command: npx openclaw gateway run --config /app/config.json --token [PROTECTED]`);
    
    execSync(command, {
      stdio: 'inherit',
      env: process.env
    });

  } catch (error) {
    console.error("❌ Error eksekusi agent:", error);
  }
}

main();
