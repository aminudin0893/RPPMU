import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.post("/api/generate", async (req, res) => {
  try {
    const { section, subject, grade, topic, context } = req.body;
    const customKey = req.headers['x-api-key'] as string;
    
    let keyToUse = process.env.GEMINI_API_KEY;
    if (customKey && customKey.trim() && customKey !== "MY_GEMINI_API_KEY") {
      keyToUse = customKey;
    }

    if (!keyToUse || keyToUse === "MY_GEMINI_API_KEY") {
      return res.status(400).json({ error: "API Key Gemini tidak ditemukan. Harap masukkan API Key Anda di sidebar (icon kunci)." });
    }
    
    const activeAi = new GoogleGenAI({ 
      apiKey: keyToUse,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
    
    const prompts: Record<string, string> = {
      pesertaDidik: `Identifikasi karakteristik peserta didik kelas ${grade} untuk mata pelajaran ${subject} dengan topik "${topic}". Berikan ringkasan dalam poin-poin (bullet points) yang sangat detail dan membantu guru menyesuaikan pengajaran.`,
      analisisMateri: `Lakukan analisis materi untuk topik "${topic}" pada mata pelajaran ${subject} kelas ${grade}. Sebutkan konsep kunci, prasyarat, dan potensi kesulitan siswa dalam poin-poin (bullet points).`,
      capaian: `Berikan Capaian Pembelajaran (CP) yang relevan untuk topik "${topic}" pada mata pelajaran ${subject} kelas ${grade} sesuai Kurikulum Merdeka terbaru. Sajikan dalam poin-poin (bullet points).`,
      lintasDisiplin: `Sebutkan keterkaitan topik "${topic}" (${subject} kelas ${grade}) dengan disiplin ilmu lain atau kehidupan nyata dan Profil Pelajar Pancasila dalam poin-poin (bullet points).`,
      tujuan: `Rumuskan 5 Tujuan Pembelajaran (TP) yang ABCD (Audience, Behavior, Condition, Degree) untuk topik "${topic}" pada mata pelajaran ${subject} kelas ${grade}. Tuliskan dalam poin-poin (bullet points).`,
      praktik: `Rekomendasikan praktik pedagogis atau model pembelajaran aktif (misal: PBL, Discovery Learning, PjBL) yang paling cocok untuk mengajarkan "${topic}" pada kelas ${grade}. Jelaskan langkah-langkahnya dalam poin-poin (bullet points).`,
      lingkungan: `Saran pengaturan lingkungan belajar (fisik/sosial) untuk mendukung pembelajaran topik "${topic}" secara inklusif. Sajikan dalam poin-poin (bullet points).`,
      teknologi: `Saran pemanfaatan teknologi digital (aplikasi, AI, alat peraga digital) yang relevan untuk memperkuat pembelajaran "${topic}". Sajikan dalam poin-poin (bullet points).`,
      awal: `Tuliskan langkah-langkah kegiatan awal/pembukaan (sekitar 10-15 menit) yang menarik untuk memulai pelajaran tentang "${topic}". Sertakan apersepsi dan motivasi dalam poin-poin (bullet points).`,
      inti: `Tuliskan langkah-langkah kegiatan inti pembelajaran yang aktif, berdiferensiasi, dan berpusat pada siswa untuk topik "${topic}". Gunakan sinta-sintaks model pembelajaran yang disarankan. Sajikan dalam poin-poin (bullet points) yang sangat detail.`,
      penutup: `Tuliskan langkah-langkah kegiatan penutup (refleksi, kesimpulan, dan umpan balik) untuk mengakhiri sesi pembelajaran "${topic}". Sajikan dalam poin-poin (bullet points).`,
      asesmenAwal: `Rancang instrumen atau teknik asesmen awal (diagnostik) untuk mengukur kesiapan dan pengetahuan awal siswa sebelum mempelajari "${topic}". Sajikan dalam poin-poin (bullet points).`,
      asesmenProses: `Rancang teknik asesmen formatif (observasi, penilaian diri, dll) selama proses pembelajaran "${topic}" untuk memantau kemajuan siswa. Sajikan dalam poin-poin (bullet points).`,
      asesmenAkhir: `Rancang instrumen asesmen sumatif (tes tulis/produk/performa) di akhir pembelajaran topik "${topic}" untuk mengukur ketercapaian tujuan pembelajaran. Sajikan dalam poin-poin (bullet points).`,
    };

    const prompt = prompts[section] || `Berikan konten untuk bagian "${section}" pada modul ajar "${topic}" (${subject} kelas ${grade}). Gunakan poin-poin. Context: ${context || ''}`;

    const response = await activeAi.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "Unknown error occurred on server" });
  }
});

// API 404 handler
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "Endpoint API tidak ditemukan" });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Express Error:", err);
  res.status(500).json({ error: "Server crashed", details: err.message });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
