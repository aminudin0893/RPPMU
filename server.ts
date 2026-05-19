import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.post("/api/generate", async (req, res) => {
  try {
    const { section, subject, grade, topic, context } = req.body;
    const customKey = req.headers['x-api-key'] as string;
    
    let activeAi = ai;
    if (customKey && customKey.trim() && customKey !== "MY_GEMINI_API_KEY") {
      activeAi = new GoogleGenAI({ 
        apiKey: customKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
    }
    
    const prompts: Record<string, string> = {
      pesertaDidik: `Identifikasi karakteristik peserta didik kelas ${grade} untuk mata pelajaran ${subject} dengan topik "${topic}". Berikan ringkasan yang membantu guru menyesuaikan pengajaran.`,
      analisisMateri: `Lakukan analisis materi untuk topik "${topic}" pada mata pelajaran ${subject} kelas ${grade}. Sebutkan konsep kunci dan potensi kesulitan siswa.`,
      capaian: `Berikan Capaian Pembelajaran (CP) yang relevan untuk topik "${topic}" pada mata pelajaran ${subject} kelas ${grade} sesuai Kurikulum Merdeka.`,
      lintasDisiplin: `Sebutkan keterkaitan topik "${topic}" (${subject} kelas ${grade}) dengan disiplin ilmu lain atau kehidupan nyata.`,
      tujuan: `Rumuskan 3-5 Tujuan Pembelajaran (TP) yang ABCD (Audience, Behavior, Condition, Degree) untuk topik "${topic}" pada mata pelajaran ${subject} kelas ${grade}.`,
      praktik: `Rekomendasikan praktik pedagogis atau model pembelajaran yang paling cocok untuk mengajarkan "${topic}" pada kelas ${grade}.`,
      lingkungan: `Saran pengaturan lingkungan belajar (fisik/sosial) untuk mendukung pembelajaran topik "${topic}".`,
      teknologi: `Saran pemanfaatan teknologi digital (aplikasi/alat) yang relevan untuk memperkuat pembelajaran "${topic}".`,
      awal: `Tuliskan langkah-langkah kegiatan awal/pembukaan (sekitar 10-15 menit) yang menarik untuk memulai pelajaran tentang "${topic}".`,
      inti: `Tuliskan langkah-langkah kegiatan inti pembelajaran yang aktif dan berpusat pada siswa untuk topik "${topic}". Gunakan pendekatan saintifik atau model yang disarankan.`,
      penutup: `Tuliskan langkah-langkah kegiatan penutup (refleksi dan umpan balik) untuk mengakhiri sesi pembelajaran "${topic}".`,
      asesmenAwal: `Rancang instrumen atau teknik asesmen awal (diagnostik) untuk mengukur kesiapan siswa sebelum mempelajari "${topic}".`,
      asesmenProses: `Rancang teknik asesmen formatif selama proses pembelajaran "${topic}" untuk memantau kemajuan siswa.`,
      asesmenAkhir: `Rancang instrumen asesmen sumatif di akhir pembelajaran topik "${topic}" untuk mengukur ketercapaian tujuan pembelajaran.`,
    };

    const prompt = prompts[section] || `Berikan konten untuk bagian "${section}" pada modul ajar "${topic}" (${subject} kelas ${grade}). Context: ${context || ''}`;

    const response = await activeAi.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
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
