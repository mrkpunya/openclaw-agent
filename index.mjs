import { OAuth2Client } from 'google-auth-library';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// 1. Inisialisasi Google OAuth
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function main() {
  console.log("🔥 RUNTIME V16 CLEAN - ASYNC GATEWAY RUNNING...");

  try {
    // 2. Auth Google
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error("Gagal OAuth Token");
    console.log("✅ Google OAuth 2.0 Authenticated!");

    process.env.GOOGLE_GENERATIVE_AI_API_KEY = token;
    process.env.GEMINI_API_KEY = token;

    const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || "openclaw-railway-secret-token";
    process.env.OPENCLAW_GATEWAY_TOKEN = gatewayToken;

    // 3. File Config Dasar
    const openclawDir = path.join(os.homedir(), '.openclaw');
    if (!fs.existsSync(openclawDir)) {
      fs.mkdirSync(openclawDir, { recursive: true });
    }
    fs.writeFileSync(path.join(openclawDir, 'config.json'), JSON.stringify({ onboarded: true, acceptRisk: true, gateway: { mode: "local" } }, null, 2));

    // 4. Jalankan Gateway (Tanpa flag --config)
    console.log("⚡ Starting OpenClaw Gateway Service...");
    const gatewayProcess = spawn('npx', ['openclaw', 'gateway', 'run', '--allow-unconfigured', '--token', gatewayToken], {
      stdio: 'inherit',
      env: process.env,
      shell: true
    });

    // 5. Auto Approval Telegram ID
    setTimeout(() => {
      console.log("🔓 Executing pairing approval for 8965095104...");
      try {
        const approveResult = execSync(`npx openclaw pairing approve telegram 8965095104`, { encoding: 'utf-8' });
        console.log("✅ Pairing Result:", approveResult);
      } catch (e) {
        console.log("ℹ️ Pairing status updated.");
      }
    }, 8000);

    gatewayProcess.on('exit', (code) => {
      console.log(`⚠️ Gateway exited with code ${code}`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
