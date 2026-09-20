import { OpenClaw } from 'openclaw';

// Inisialisasi OpenClaw Agent
const agent = new OpenClaw({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  console.log("OpenClaw Agent sedang berjalan di Railway...");
  
  // Contoh testing respons agen
  try {
    const response = await agent.chat("Halo OpenClaw, sistem sudah siap!");
    console.log("Response Agent:", response);
  } catch (error) {
    console.error("Gagal menjalankan agent:", error);
  }
}

main();
