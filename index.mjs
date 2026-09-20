import * as openclaw from 'openclaw';
import { GoogleAuth } from 'google-auth-library';

// Inisialisasi OAuth 2.0 Auth Client
const auth = new GoogleAuth({
  credentials: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

async function main() {
  console.log("Menjalankan OpenClaw Agent di Railway...");

  try {
    // Cetak ekspor yang tersedia di log untuk pemeriksaan
    console.log("Ekspor OpenClaw yang tersedia:", Object.keys(openclaw));

    // Mencari konstruktor atau fungsi utama dari namespace
    const AgentConstructor = openclaw.default || openclaw.OpenClaw || openclaw.Agent || openclaw;

    if (typeof AgentConstructor === 'function') {
      const agent = new AgentConstructor({ authClient: auth });
      console.log("OpenClaw Agent berhasil diinisialisasi via OAuth 2.0!");
    } else {
      console.log("Modul OpenClaw berhasil dimuat:", AgentConstructor);
    }
  } catch (error) {
    console.error("Error saat menjalankan agent:", error);
  }
}

main();
