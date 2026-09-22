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
  console.log("🔥 RUNTIME AUTO-PAIRING PM78LSUS...");

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
    fs.writeFileSync(path.join(openclawDir, 'config.json'), JSON.stringify({ onboarded: true, acceptRisk: true, gateway: { mode: "local" } }, null, 2));

    console.log("⚡ Starting OpenClaw Gateway Service...");
    const gatewayProcess = spawn('npx', ['openclaw', 'gateway', 'run', '--allow-unconfigured', '--token', gatewayToken], {
      env: process.env,
      shell: true
    });

    let approved = false;

    // Pipe stdout & stderr agar tetap terlihat di log Railway
    gatewayProcess.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);

      // Eksekusi approval begitu gateway menyatakan "ready"
      if (!approved && (output.includes('ready') || output.includes('isolated polling ingress started'))) {
        approved = true;
        console.log("🔓 Gateway is ready! Approving Telegram Pairing Code PM78LSUS...");
        try {
          const res = execSync(`npx openclaw pairing approve telegram PM78LSUS`, { encoding: 'utf-8' });
          console.log("✅ Pairing Approved Successfully:", res);
        } catch (e) {
          console.log("ℹ️ Pairing attempt note:", e.message || e);
        }
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
