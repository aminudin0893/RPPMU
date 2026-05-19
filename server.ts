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
    console.log(`[Generate] Request for section: ${section}. Custom Key Present: ${!!customKey}`);
    
    if (customKey && customKey.trim() && customKey !== "MY_GEMINI_API_KEY" && customKey.length > 5) {
      keyToUse = customKey;
      console.log(`[Generate] Using custom user API key (ends with ...${customKey.slice(-4)})`);
    } else {
      console.log(`[Generate] Using server/default API key`);
    }

    if (!keyToUse || keyToUse === "MY_GEMINI_API_KEY") {
      return res.status(400).json({ error: "API Key Gemini belum diset. Silakan masukkan API Key Anda di menu sidebar (icon kunci)." });
    }
    
    const activeAi = new GoogleGenAI({ 
      apiKey: keyToUse,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
    
    const prompts: Record<string, string> = {
      pesertaDidik: `Berikan analisis karakteristik kognitif dan non-kognitif peserta didik kelas ${grade} untuk mata pelajaran ${subject} pada topik "${topic}". Susun dalam Bahasa Indonesia yang sangat formal, akademis, dan profesional. Sertakan poin-poin detail mengenai gaya belajar, minat, dan tingkat kesiapan untuk mendukung implementasi pembelajaran berdiferensiasi.`,
      analisisMateri: `Lakukan analisis materi secara mendalam untuk topik "${topic}" pada mata pelajaran ${subject} kelas ${grade}. Gunakan ragam Bahasa Indonesia resmi (formal). Paparkan fakta, konsep, prinsip, dan prosedur secara sistematis dalam poin-poin, serta petakan potensi hambatan belajar atau miskonsepsi yang mungkin dihadapi siswa.`,
      capaian: `Rumuskan Capaian Pembelajaran (CP) yang akurat dan selaras dengan standar Kurikulum Merdeka terbaru untuk topik "${topic}" pada mata pelajaran ${subject} kelas ${grade}. Gunakan kalimat formal dan baku sesuai standar Kemendikbudristek.`,
      lintasDisiplin: `Uraikan keterkaitan antara topik "${topic}" (${subject} kelas ${grade}) dengan Projek Penguatan Profil Pelajar Pancasila (P5) serta integrasi dengan disiplin ilmu lainnya secara formal dan akademis. Sajikan dalam format poin-poin profesional.`,
      tujuan: `Susun minimal 5 Tujuan Pembelajaran (TP) yang memenuhi kriteria ABCD (Audience, Behavior, Condition, Degree) secara eksplisit dan menggunakan kata kerja operasional (KKO) yang terukur. Gunakan Bahasa Indonesia formal dan sesuaikan dengan tingkat kompetensi siswa kelas ${grade} pada materi "${topic}".`,
      praktik: `Rekomendasikan model/pendekatan pembelajaran inovatif (seperti Problem Based Learning, Project Based Learning, atau Discovery Learning) yang paling efektif untuk mengajarkan "${topic}" pada siswa kelas ${grade}. Jabarkan langkah-langkah implementasinya secara formal dan prosedural.`,
      lingkungan: `Rancang strategi pengelolaan lingkungan belajar yang inklusif, kondusif, dan aman untuk mendukung optimalisasi pembelajaran topik "${topic}". Gunakan gaya bahasa profesional dan teknis kependidikan.`,
      teknologi: `Saran integrasi teknologi digital (seperti media interaktif, kecerdasan buatan, atau platform LMS) yang relevan untuk memperkaya pengalaman belajar pada materi "${topic}". Gunakan istilah teknologi yang akurat dan formal.`,
      awal: `Susun skenario kegiatan pendahuluan pembelajaran selama 15-20 menit yang mencakup pembukaan resmi, apersepsi yang kontekstual, motivasi ekstrinsik, dan penyampaian tujuan pembelajaran secara terstruktur untuk materi "${topic}".`,
      inti: `Jabarkan langkah-langkah kegiatan inti pembelajaran yang rinci, berpusat pada siswa (student-centered), dan mengakomodasi keberagaman siswa untuk topik "${topic}". Deskripsikan aktivitas sesuai tahapan model pembelajaran yang dipilih dalam Bahasa Indonesia resmi yang operasional bagi guru.`,
      penutup: `Tuliskan skenario kegiatan penutup yang mencakup penguatan materi, refleksi metakognitif, umpan balik konstruktif, dan informasi rencana tindak lanjut secara formal untuk mengakhiri sesi pembelajaran "${topic}".`,
      asesmenAwal: `Rancang instrumen asesmen diagnostik (baik kognitif maupun non-kognitif) secara formal dan profesional untuk memetakan kemampuan awal siswa terkait materi "${topic}".`,
      asesmenProses: `Rancang instrumen asesmen formatif (seperti lembar observasi, penilaian diri, atau rubrik performa) secara sistematis untuk memantau kemajuan kompetensi siswa selama proses pembelajaran "${topic}".`,
      asesmenAkhir: `Rancang instrumen asesmen sumatif yang valid dan reliabel untuk mengukur ketercapaian semua tujuan pembelajaran pada materi "${topic}", dilengkapi dengan kriteria ketercapaian tujuan pembelajaran (KKTP) dalam format resmi.`,
    };

    const prompt = prompts[section] || `Berikan konten untuk bagian "${section}" pada modul ajar "${topic}" (${subject} kelas ${grade}). Gunakan poin-poin. Context: ${context || ''}`;

    const response = await activeAi.models.generateContent({
      model: "gemini-1.5-flash",
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
