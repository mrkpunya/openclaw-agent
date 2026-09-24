import { OAuth2Client } from 'google-auth-library';
import { spawn } from 'child_process';
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
  console.log("🔥 RUNTIME V19 - DIRECT CREDENTIALS INJECTION...");

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

    // 1. SAPU BERSIH SEMUA FILE LOCK & LEASE
    try {
      const deleteLocksRecursively = (dirPath) => {
        if (!fs.existsSync(dirPath)) return;
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          if (entry.isDirectory()) {
            deleteLocksRecursively(fullPath);
          } else if (entry.name.endsWith('.lock') || entry.name.includes('lease') || entry.name.includes('pid')) {
            fs.unlinkSync(fullPath);
            console.log(`🧹 Removed lock file: ${entry.name}`);
          }
        }
      };
      deleteLocksRecursively(openclawDir);
    } catch (e) {
      console.log("ℹ️ Lock cleanup note:", e.message);
    }

    // 2. INJEKSI PERMANEN TELEGRAM ID 8965095104 KE FILE PAIRING INTERNAL
    const telegramPairDir = path.join(openclawDir, 'telegram');
    if (!fs.existsSync(telegramPairDir)) {
      fs.mkdirSync(telegramPairDir, { recursive: true });
    }

    const pairedFile = path.join(telegramPairDir, 'paired.json');
    const allowData = {
      approved: ["8965095104"],
      allowFrom: ["8965095104"],
      users: {
        "8965095104": {
          role: "owner",
          approvedAt: new Date().toISOString()
        }
      }
    };

    fs.writeFileSync(pairedFile, JSON.stringify(allowData, null, 2));
    console.log("📝 DIRECT INJECTION COMPLETE: Telegram ID 8965095104 registered as permanent owner.");

    // 3. Jalankan Gateway Service
    console.log("⚡ Starting OpenClaw Gateway Service...");
    const gatewayProcess = spawn('npx', ['openclaw', 'gateway', 'run', '--allow-unconfigured', '--token', gatewayToken], {
      stdio: 'inherit',
      env: process.env,
      shell: true
    });

    gatewayProcess.on('exit', (code) => {
      console.log(`⚠️ Gateway process exited with code ${code}`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
