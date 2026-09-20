const { GoogleAuth } = require('google-auth-library');

// Setup OAuth 2.0 Auth Client
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
    // Memuat modul ESM openclaw secara dinamis (Async Import)
    const openclaw = await import('openclaw');
    console.log("Modul OpenClaw berhasil dimuat secara dinamis!");

    // Mengambil class/konstruktor dari modul yang di-import
    const AgentConstructor = openclaw.OpenClaw || openclaw.default || openclaw.Agent || openclaw;

    if (typeof AgentConstructor === 'function') {
      const agent = new AgentConstructor({ authClient: auth });
      console.log("OpenClaw Agent berhasil diinisialisasi via OAuth 2.0!");
    } else {
      console.log("Daftar komponen openclaw:", Object.keys(openclaw));
    }
  } catch (error) {
    console.error("Error eksekusi agent:", error);
  }
}

main();
