import { OAuth2Client } from 'google-auth-library';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Batasi Heap Node.js ke 384MB agar tidak melebihi RAM Railway Free (512MB)
process.env.NODE_OPTIONS = "--max-old-space-size=384";

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Fungsi pembersih lock/lease rekursif
function purgeLocks(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      purgeLocks(fullPath);
    } else if (
      item.name.endsWith('.lock') || 
      item.name.includes('lease') || 
      item.name.includes('pid') ||
      item.name.endsWith('.bak')
    ) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`🧹 Purged stale lock/lease: ${item.name}`);
      } catch (e) {}
    }
  }
}

async function main() {
  console.log("🔥 RUNTIME V22 - PURGE LEASES & DIRECT OWNER BINDING...");

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

    // 1. SAPU BERSIH SELURUH FILE LEASE/LOCK DARI RUNTIME SEBELUMNYA
    console.log("🧼 Cleaning stale gateway locks and active owner leases...");
    purgeLocks(openclawDir);

    // 2. INJEKSI OTORISASI TELEGRAM OWNER ID 8965095104
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
    console.log("📝 TELEGRAM OWNER INJECTED: ID 8965095104 saved to volume.");

    // 3. JALANKAN GATEWAY
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
