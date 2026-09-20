import { GoogleAuth } from 'google-auth-library';

// Inisialisasi Auth Client OAuth 2.0
const auth = new GoogleAuth({
  credentials: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

async function main() {
  console.log("🚀 Menjalankan OpenClaw Agent di Railway...");

  try {
    const openclaw = await import('openclaw');
    
    // Verifikasi token OAuth sebelum menjalankan CLI/gateway
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log("✅ Authenticated via Google OAuth 2.0 successfully!");

    // Eksekusi entry point utama OpenClaw
    if (typeof openclaw.runLegacyCliEntry === 'function') {
      console.log("🤖 Starting OpenClaw Service...");
      await openclaw.runLegacyCliEntry();
    } else if (typeof openclaw.waitForever === 'function') {
      console.log("🤖 OpenClaw running in background mode...");
      await openclaw.waitForever();
    } else {
      console.log(" Ready.");
    }
  } catch (error) {
    console.error("❌ Error running OpenClaw Agent:", error);
  }
}

main();
