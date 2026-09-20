import { createRequire } from 'module';
import { GoogleAuth } from 'google-auth-library';

const require = createRequire(import.meta.url);
const openclaw = require('openclaw');

// Setup OAuth 2.0 Client dari Environment Variables
const auth = new GoogleAuth({
  credentials: {
    client_id: process.process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

async function main() {
  console.log("Menjalankan OpenClaw Agent di Railway...");

  try {
    console.log("Tipe modul OpenClaw:", typeof openclaw);
    
    // Mengecek apakah modul berupa konstruktor/fungsi
    const AgentConstructor = typeof openclaw === 'function' ? openclaw : openclaw.OpenClaw || openclaw.default || openclaw;

    if (typeof AgentConstructor === 'function') {
      const agent = new AgentConstructor({ authClient: auth });
      console.log("OpenClaw Agent berhasil diinisialisasi via OAuth 2.0!");
    } else {
      console.log("OpenClaw berhasil dimuat:", AgentConstructor);
    }
  } catch (error) {
    console.error("Error eksekusi agent:", error);
  }
}

main();
