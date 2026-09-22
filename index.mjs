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
  console.log("🔥 RUNTIME V17 - DYNAMIC AUTO-CAPTURE PAIRING CODE...");

  try {
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error("Gagal mengambil Access Token Google");
    console.log("✅ Google OAuth 2.0 Authenticated!");

    process.env.GOOGLE_GENERATIVE_AI_API_KEY = token;
    process.env.GEMINI_API_KEY = token;

    const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || "openclaw-railway-secret-token";
    process.env.OPENCLAW_GATEWAY_TOKEN = gatewayToken;

    const openclawDir = path.join(os.homedir(), '.openclaw');
    if (!fs.existsSync(openclawDir)) {
      fs.mkdirSync(openclawDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(openclawDir, 'config.json'),
      JSON.stringify({ onboarded: true, acceptRisk: true, gateway: { mode: "local" } }, null, 2)
    );

    console.log("⚡ Starting OpenClaw Gateway Service...");
    const gatewayProcess = spawn('npx', ['openclaw', 'gateway', 'run', '--allow-unconfigured', '--token', gatewayToken], {
      env: process.env,
      shell: true
    });

    let approved = false;

    // Menangkap stdout dan mengekstrak kode pairing secara dinamis
    gatewayProcess.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);

      // Cari pola perintah 'openclaw pairing approve telegram CODE'
      const match = output.match(/openclaw pairing approve telegram ([A-Z0-9]+)/i);
      
      if (match && match[1] && !approved) {
        approved = true;
        const pairingCode = match[1];
        console.log(`\n🔓 DETECTED PAIRING CODE: ${pairingCode}. Approving automatically...`);
        
        setTimeout(() => {
          try {
            const res = execSync(`npx openclaw pairing approve telegram ${pairingCode}`, { encoding: 'utf-8' });
            console.log("✅ AUTO-PAIRING SUCCESSFUL:", res);
          } catch (e) {
            console.log("ℹ️ Auto-pairing execution result:", e.message || e);
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
