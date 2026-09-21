import { OAuth2Client } from 'google-auth-library';
import { spawn, execSync } from 'child_process';
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
  console.log("🔥 MEMULAI RUNTIME V15 - ASYNC GATEWAY & AUTO-PAIRING...");

  try {
    // 2. Refresh Access Token Google OAuth 2.0
    const { token } = await oauth2Client.getAccessToken();

    if (!token) {
      throw new Error("Gagal mengambil Access Token dari Google OAuth 2.0");
    }

    console.log("✅ Google OAuth 2.0 Authenticated!");

    // 3. Set Environment Variable
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = token;
    process.env.GEMINI_API_KEY = token;

    const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || "openclaw-railway-secret-token";
    process.env.OPENCLAW_GATEWAY_TOKEN = gatewayToken;

    // 4. Inisialisasi config.json dasar
    const openclawDir = path.join(os.homedir(), '.openclaw');
    if (!fs.existsSync(openclawDir)) {
      fs.mkdirSync(openclawDir, { recursive: true });
    }

    const configPath = path.join(openclawDir, 'config.json');
    const initialConfig = {
      onboarded: true,
      acceptRisk: true,
      gateway: { mode: "local" }
    };
    fs.writeFileSync(configPath, JSON.stringify(initialConfig, null, 2));

    // 5. Jalankan Gateway Service di background (Asinkron)
    console.log("⚡ Starting OpenClaw Gateway Service...");
    const gatewayProcess = spawn('npx', ['openclaw', 'gateway', 'run', '--allow-unconfigured', '--token', gatewayToken], {
      stdio: 'inherit',
      env: process.env,
      shell: true
    });

    // 6. Tunggu 8 detik hingga Gateway siap, lalu jalankan pairing approve
    setTimeout(() => {
      console.log("🔓 Executing automatic pairing approval for Telegram ID 8965095104...");
      try {
        const approveResult = execSync(`npx openclaw pairing approve telegram 8965095104`, { encoding: 'utf-8' });
        console.log("✅ Auto-Pairing Status:", approveResult);
      } catch (e) {
        console.log("ℹ️ Pairing check:", e.message || "Already paired or in progress.");
      }
    }, 8000);

    gatewayProcess.on('exit', (code) => {
      console.log(`⚠️ Gateway process exited with code ${code}`);
    });

  } catch (error) {
    console.error("❌ Error eksekusi agent:", error);
  }
}

main();
