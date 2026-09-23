import { OAuth2Client } from 'google-auth-library';
import { spawn, execSync } from 'child_process';
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
  console.log("🔥 RUNTIME V18 - CLEANING LOCKS & AUTO-PAIRING...");

  try {
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error("Gagal OAuth Token");
    console.log("✅ Google OAuth 2.0 Authenticated!");

    process.env.GOOGLE_GENERATIVE_AI_API_KEY = token;
    process.env.GEMINI_API_KEY = token;

    const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || "openclaw-railway-secret-token";
    process.env.OPENCLAW_GATEWAY_TOKEN = gatewayToken;

    const openclawDir = path.join(os.homedir(), '.openclaw');
    if (!fs.existsSync(openclawDir)) {
      fs.mkdirSync(openclawDir, { recursive: true });
    }

    // 1. BERSIHKAN LOCK LEASE FILE DI PERSISTENT VOLUME
    try {
      const files = fs.readdirSync(openclawDir);
      files.forEach(file => {
        if (file.endsWith('.lock') || file.includes('lease') || file.includes('pid')) {
          const lockPath = path.join(openclawDir, file);
          fs.unlinkSync(lockPath);
          console.log(`🧹 Removed lingering lock file: ${file}`);
        }
      });
    } catch (e) {
      console.log("ℹ️ No stale locks found or directory clean.");
    }

    // 2. Tulis Config Dasar jika belum ada
    const configPath = path.join(openclawDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify({ onboarded: true, acceptRisk: true, gateway: { mode: "local" } }, null, 2));
    }

    // 3. Jalankan Gateway
    console.log("⚡ Starting OpenClaw Gateway Service...");
    const gatewayProcess = spawn('npx', ['openclaw', 'gateway', 'run', '--allow-unconfigured', '--token', gatewayToken], {
      env: process.env,
      shell: true
    });

    let approved = false;

    // 4. Deteksi & Auto-Approve Kode Pairing
    gatewayProcess.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);

      const match = output.match(/openclaw pairing approve telegram ([A-Z0-9]+)/i);
      if (match && match[1] && !approved) {
        approved = true;
        const code = match[1];
        console.log(`\n🔓 AUTO-DETECTED CODE: ${code}. Executing approval...`);
        setTimeout(() => {
          try {
            const res = execSync(`npx openclaw pairing approve telegram ${code}`, { encoding: 'utf-8' });
            console.log("✅ PAIRING SUCCESSFUL & SAVED TO VOLUME:", res);
          } catch (e) {
            console.log("ℹ️ Approval note:", e.message || e);
          }
        }, 1000);
      }
    });

    gatewayProcess.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });

    gatewayProcess.on('exit', (code) => {
      console.log(`⚠️ Gateway process exited with code ${code}`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
