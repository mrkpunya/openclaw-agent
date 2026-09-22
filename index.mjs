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
  console.log("🔥 EXECUTING FINAL PAIRING APPROVAL (27KM3FQT)...");

  try {
    const { token } = await oauth2Client.getAccessToken();
    if (!token) throw new Error("Gagal OAuth Token");
    console.log("✅ Google OAuth 2.0 Authenticated!");

    process.env.GOOGLE_GENERATIVE_AI_API_KEY = token;
    process.env.GEMINI_API_KEY = token;

    const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN || "openclaw-railway-secret-token";
    process.env.OPENCLAW_GATEWAY_TOKEN = gatewayToken;

    // 1. Jalankan Gateway Service di Background
    console.log("⚡ Starting OpenClaw Gateway Service...");
    const gatewayProcess = spawn('npx', ['openclaw', 'gateway', 'run', '--allow-unconfigured', '--token', gatewayToken], {
      env: process.env,
      shell: true
    });

    let approved = false;

    gatewayProcess.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);

      // Eksekusi approval untuk kode 27KM3FQT begitu gateway ready
      if (!approved && (output.includes('ready') || output.includes('isolated polling ingress started'))) {
        approved = true;
        console.log("🔓 Gateway is ready! Approving code 27KM3FQT to persistent volume...");
        setTimeout(() => {
          try {
            const res = execSync(`npx openclaw pairing approve telegram 27KM3FQT`, { encoding: 'utf-8' });
            console.log("✅ PERMANENT PAIRING SUCCESSFUL:", res);
          } catch (e) {
            console.log("ℹ️ Pairing execution note:", e.message || e);
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
