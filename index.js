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
  console.log("Menjalankan OpenClaw Agent di Railway...");

  try {
    // Memuat paket ESM secara dinamis untuk menangani top-level await internal
    const openclawModule = await import('openclaw');
    console.log("Modul OpenClaw berhasil dimuat!");

    // Mengambil kelas/konstruktor dari modul
    const OpenClawAgent = openclawModule.OpenClaw || openclawModule.default || openclawModule.Agent;

    if (typeof OpenClawAgent === 'function') {
      const agent = new OpenClawAgent({ authClient: auth });
      console.log("OpenClaw Agent berhasil diinisialisasi via OAuth 2.0!");
    } else {
      console.log("Modul berhasil dimuat. Komponen:", Object.keys(openclawModule));
    }
  } catch (error) {
    console.error("Error eksekusi agent:", error);
  }
}

main();
