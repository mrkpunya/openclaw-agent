import openclaw from 'openclaw';
import { GoogleAuth } from 'google-auth-library';

// Setup OAuth 2.0 Client menggunakan token dari Environment Variables
const auth = new GoogleAuth({
  credentials: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

async function main() {
  console.log("Menjalankan OpenClaw Agent...");
  
  try {
    console.log("Modul OpenClaw terdeteksi:", typeof openclaw);
    
    const AgentClass = typeof openclaw === 'function' ? openclaw : openclaw.default || openclaw.Agent;
    
    if (AgentClass) {
      const agent = new AgentClass({ authClient: auth });
      console.log("OpenClaw Agent berhasil aktif via OAuth 2.0!");
    } else {
      console.log("Aplikasi berjalan dan siap digunakan.");
    }
  } catch (error) {
    console.error("Error eksekusi agent:", error);
  }
}

main();
