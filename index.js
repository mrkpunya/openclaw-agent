import { GoogleAuth } from 'google-auth-library';
import { OpenClaw } from 'openclaw';

// Inisialisasi Auth via OAuth 2.0 Token
const auth = new GoogleAuth({
  credentials: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

const agent = new OpenClaw({
  authClient: auth,
});

async function main() {
  console.log("OpenClaw Agent berhasil aktif di Railway!");
  
  try {
    const response = await agent.chat("Halo OpenClaw, sistem siap digunakan.");
    console.log("Response Agent:", response);
  } catch (error) {
    console.error("Error eksekusi agent:", error);
  }
}

main();
