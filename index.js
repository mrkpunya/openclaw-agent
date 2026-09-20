const { GoogleAuth } = require('google-auth-library');
const openclaw = require('openclaw');

// Setup OAuth 2.0 Client
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
    console.log("Modul OpenClaw terdeteksi:", typeof openclaw);

    const AgentConstructor = typeof openclaw === 'function' ? openclaw : openclaw.OpenClaw || openclaw.default || openclaw;

    if (typeof AgentConstructor === 'function') {
      const agent = new AgentConstructor({ authClient: auth });
      console.log("OpenClaw Agent berhasil diinisialisasi via OAuth 2.0!");
    } else {
      console.log("Modul berhasil dimuat:", AgentConstructor);
    }
  } catch (error) {
    console.error("Error eksekusi agent:", error);
  }
}

main();
