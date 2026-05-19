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
      pesertaDidik: `Identifikasi karakteristik peserta didik kelas ${grade} untuk mata pelajaran ${subject} dengan topik "${topic}". Susun dalam Bahasa Indonesia yang sangat formal, profesional, dan sistematis. Sajikan dalam poin-poin (bullet points) detail yang mencakup gaya belajar, minat, dan tingkat kesiapan untuk mendukung pembelajaran berdiferensiasi.`,
      analisisMateri: `Lakukan analisis materi mendalam untuk topik "${topic}" pada mata pelajaran ${subject} kelas ${grade}. Gunakan Bahasa Indonesia formal (beku/resmi). Uraikan fakta, konsep, prinsip, dan prosedur secara terstruktur dalam poin-poin (bullet points), serta identifikasi potensi kesulitan pemahaman siswa.`,
      capaian: `Rumuskan Capaian Pembelajaran (CP) yang selaras dengan Kurikulum Merdeka terbaru untuk topik "${topic}" pada mata pelajaran ${subject} kelas ${grade}. Gunakan kalimat formal dan baku sesuai standar Kemendikbudristek.`,
      lintasDisiplin: `Uraikan keterkaitan topik "${topic}" (${subject} kelas ${grade}) dengan Profil Pelajar Pancasila dan disiplin ilmu lainnya secara formal dan akademis. Sajikan dalam poin-poin (bullet points).`,
      tujuan: `Susun minimal 5 Tujuan Pembelajaran (TP) yang memenuhi unsur ABCD (Audience, Behavior, Condition, Degree) secara sangat spesifik dan menggunakan kata kerja operasional (KKO) Taksonomi Bloom yang baku untuk topik "${topic}" pada mata pelajaran ${subject} kelas ${grade}. Gunakan Bahasa Indonesia resmi.`,
      praktik: `Rancang strategi atau model pembelajaran aktif (seperti PBL, PjBL, atau Discovery Learning) yang paling relevan untuk topik "${topic}" pada kelas ${grade}. Jabarkan sintaks atau langkah-langkahnya secara sistematis dan formal.`,
      lingkungan: `Berikan rekomendasi pengaturan lingkungan belajar yang inklusif, kondusif, dan mendukung student agency untuk topik "${topic}". Gunakan gaya bahasa profesional dan teknis kependidikan.`,
      teknologi: `Saran pemanfaatan teknologi digital (media interaktif, AI, atau platform pembelajaran) yang efektif untuk memperkuat kompetensi siswa pada topik "${topic}". Gunakan istilah teknologi yang akurat dan formal.`,
      awal: `Susun skenario kegiatan pendahuluan (apersepsi) selama 15 menit yang profesional untuk topik "${topic}". Mencakup pembukaan, pengecekan kesiapan, motivasi, dan penyampaian tujuan pembelajaran secara terstruktur.`,
      inti: `Jabarkan langkah-langkah kegiatan inti pembelajaran yang rinci, berdiferensiasi, dan berpusat pada peserta didik untuk topik "${topic}". Gunakan sintaks model pembelajaran yang tepat dengan bahasa operasional yang formal dan mudah dipahami guru.`,
      penutup: `Rancang kegiatan penutup yang mencakup kesimpulan sistematis, tugas tindak lanjut, dan refleksi bermakna bagi peserta didik untuk topik "${topic}". Gunakan Bahasa Indonesia baku.`,
      asesmenAwal: `Rancang instrumen asesmen diagnostik formal (kognitif dan non-kognitif) untuk mengetahui kompetensi prasyarat peserta didik sebelum memulai materi "${topic}".`,
      asesmenProses: `Rancang teknik asesmen formatif yang profesional (seperti rubrik observasi atau penilaian sebaya) untuk memantau perkembangan kompetensi peserta didik selama proses pembelajaran "${topic}".`,
      asesmenAkhir: `Rancang instrumen asesmen sumatif yang valid dan reliabel untuk mengukur ketercapaian tujuan pembelajaran pada topik "${topic}", lengkap dengan kriteria ketercapaian (KKTP) dalam format resmi.`,
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
