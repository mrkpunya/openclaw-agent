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
  console.log("Menjalankan OpenClaw Agent via start.mjs...");

  try {
    const openclaw = await import('openclaw');
    console.log("Modul OpenClaw berhasil dimuat!");

    const AgentClass = openclaw.OpenClaw || openclaw.default || openclaw.Agent || openclaw;

    if (typeof AgentClass === 'function') {
      const agent = new AgentClass({ authClient: auth });
      console.log("OpenClaw Agent berhasil diinisialisasi via OAuth 2.0!");
    } else {
      console.log("Komponen OpenClaw terdeteksi:", Object.keys(openclaw));
    }
  } catch (error) {
    console.error("Error eksekusi agent:", error);
  }
}

main();
