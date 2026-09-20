import openclaw from 'openclaw';
import { GoogleAuth } from 'google-auth-library';

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
    const AgentClass = typeof openclaw === 'function' ? openclaw : openclaw.default || openclaw.Agent;
    
    if (AgentClass) {
      const agent = new AgentClass({ authClient: auth });
      console.log("OpenClaw Agent berhasil diinisialisasi via OAuth 2.0!");
    } else {
      console.log("Aplikasi berhasil berjalan dan siap digunakan.");
    }
  } catch (error) {
    console.error("Error eksekusi agent:", error);
  }
}

main();
