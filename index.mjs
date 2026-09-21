import { OAuth2Client } from 'google-auth-library';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 1. Inisialisasi OAuth 2.0 Client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function main() {
  console.log("🔥 MEMULAI RUNTIME V13 - LOCAL DIRECTORY CONFIG BINDING...");

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

    // 4. Buat config.json LANGSUNG di root direktori kerja aplikasi (/app/config.json)
    const localConfigPath = path.join(process.cwd(), 'config.json');
    
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
          allowFrom: ["8965095104"]
        }
      }
    };

    fs.writeFileSync(localConfigPath, JSON.stringify(initialConfig, null, 2));
    console.log("📝 LOCAL CONFIG CREATED: Written to /app/config.json with Owner ID 8965095104.");

    // 5. Eksekusi Biner CLI Gateway
    const command = `npx openclaw gateway run --token ${gatewayToken}`;
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
