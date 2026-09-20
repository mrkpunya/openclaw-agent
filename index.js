import openclaw from 'openclaw';
import { GoogleAuth } from 'google-auth-library';

// Inisialisasi Auth via OAuth 2.0 Token
const auth = new GoogleAuth({
  credentials: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

async function main() {
  console.log("Mencoba menjalankan OpenClaw Agent...");
  
  try {
    // Memeriksa struktur objek yang diekspor
    console.log("Modul OpenClaw terdeteksi:", openclaw);
    
    // Inisialisasi jika berupa fungsi/klas
    const AgentClass = typeof openclaw === 'function' ? openclaw : openclaw.default || openclaw.Agent;
    
    if (AgentClass) {
      const agent = new AgentClass({ authClient: auth });
      console.log("OpenClaw Agent berhasil diinisialisasi via OAuth 2.0!");
    } else {
      console.log("Aplikasi berjalan, siap menerima instruksi.");
    }
  } catch (error) {
    console.error("Error saat menjalankan agent:", error);
  }
}

main();
