import { LessonPlan } from "../types";
import { Printer, ChevronLeft, Download, FileEdit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";

interface PrintViewProps {
  plan: LessonPlan;
  onBack: () => void;
}

export function PrintView({ plan, onBack }: PrintViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-24 z-50">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 font-semibold px-4 py-2 hover:bg-gray-50 rounded-lg transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-all shadow-md shadow-blue-100"
          >
            <Printer className="w-5 h-5" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Document Paper */}
      <div id="print-area" className="bg-white p-6 md:p-[2cm] shadow-2xl rounded-sm min-h-[29.7cm] text-gray-900 font-serif leading-relaxed print:shadow-none print:p-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
            #root > div { margin: 0 !important; padding: 0 !important; }
            #print-area { box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
          }
          .markdown-body h1, .markdown-body h2, .markdown-body h3 { font-family: sans-serif; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; }
          .markdown-body p { margin-bottom: 1em; }
          .markdown-body ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
          .markdown-body ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
        `}} />

        {/* Header (Kop Surat) */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 pb-6 border-b-2 border-black mb-8">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300 text-gray-400 font-sans text-[10px] text-center p-2 shrink-0">
            [LOGO SEKOLAH]
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-sm md:text-2xl font-bold uppercase tracking-widest font-sans">PEMERINTAH KOTA JAKARTA</h1>
            <h2 className="text-xs md:text-xl font-bold font-sans uppercase">DINAS PENDIDIKAN DAN KEBUDAYAAN</h2>
            <h1 className="text-lg md:text-3xl font-black font-sans">SMP NEGERI 32 JAKARTA</h1>
            <p className="text-[10px] md:text-xs italic font-sans mt-1">Jl. Contoh No. 123, Jakarta Selatan, Kode Pos 12345</p>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-xl md:text-2xl font-black uppercase underline decoration-2 font-sans shrink-0">MODUL AJAR / RPP</h2>
          <p className="font-bold text-sm md:text-lg font-sans mt-1">Kurikulum Merdeka - Pendekatan Pembelajaran Mendalam</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-[1fr] sm:grid-cols-[150px_10px_1fr] gap-y-1 sm:gap-y-2 mb-10 text-xs md:text-sm font-sans font-medium border p-4 rounded-xl md:border-none md:p-0">
          <div className="text-gray-500 sm:text-gray-900">Mata Pelajaran</div><div className="hidden sm:block">:</div><div className="font-bold">{plan.subject}</div>
          <div className="text-gray-500 sm:text-gray-900 border-t pt-1 sm:pt-0 sm:border-none">Kelas / Semester</div><div className="hidden sm:block">:</div><div className="font-bold">{plan.grade} / Ganjil</div>
          <div className="text-gray-500 sm:text-gray-900 border-t pt-1 sm:pt-0 sm:border-none">Topik / Materi</div><div className="hidden sm:block">:</div><div className="font-bold">{plan.topic}</div>
          <div className="text-gray-500 sm:text-gray-900 border-t pt-1 sm:pt-0 sm:border-none">Alokasi Waktu</div><div className="hidden sm:block">:</div><div className="font-bold">2 x 45 Menit</div>
          <div className="text-gray-500 sm:text-gray-900 border-t pt-1 sm:pt-0 sm:border-none">Profil Pelajar Pancasila</div><div className="hidden sm:block">:</div><div className="font-bold italic">{plan.pancasilaProfiles.join(", ")}</div>
        </div>

        {/* Sections */}
        <div className="space-y-8 md:space-y-12">
          <DocSection title="A. IDENTIFIKASI" />
          <DocSubSection title="1. Kesiapan Peserta Didik" content={plan.identifikasi.pesertaDidik} />
          <DocSubSection title="2. Analisis Materi Pelajaran" content={plan.identifikasi.analisisMateri} />

          <DocSection title="B. DESAIN PEMBELAJARAN" />
          <DocSubSection title="1. Capaian Pembelajaran" content={plan.desain.capaian} />
          <DocSubSection title="2. Tujuan Pembelajaran" content={plan.desain.tujuan} />
          <DocSubSection title="3. Model / Praktik Pedagogis" content={plan.desain.praktik} />
          <DocSubSection title="4. Lingkungan Belajar & Teknologi" content={`${plan.desain.lingkungan}\n\n**Teknologi:** ${plan.desain.teknologi}`} />

          <DocSection title="C. PENGALAMAN BELAJAR" />
          <DocSubSection title="1. Langkah Pembukaan" content={plan.pengalaman.awal} />
          <DocSubSection title="2. Kegiatan Inti" content={plan.pengalaman.inti} />
          <DocSubSection title="3. Penutup & Refleksi" content={plan.pengalaman.penutup} />

          <DocSection title="D. ASESMEN" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DocSubSection title="Asesmen Awal" content={plan.asesmen.awal} small />
            <DocSubSection title="Asesmen Proses" content={plan.asesmen.proses} small />
            <DocSubSection title="Asesmen Akhir" content={plan.asesmen.akhir} small />
          </div>
        </div>

        {/* Signature */}
        <div className="mt-12 md:mt-20 grid grid-cols-1 sm:grid-cols-2 gap-10 text-center font-sans text-xs md:text-sm">
          <div className="space-y-12 md:space-y-20">
            <p>Mengetahui,<br/>Kepala Sekolah</p>
            <div className="space-y-1">
              <p className="font-bold underline">NAMA KEPALA SEKOLAH, M.Pd.</p>
              <p>NIP. 198001012010011001</p>
            </div>
          </div>
          <div className="space-y-12 md:space-y-20">
            <p className="sm:inline hidden">Jakarta, </p><p>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>Guru Mata Pelajaran</p>
            <div className="space-y-1">
              <p className="font-bold underline">NAMA GURU PENGAMPU, S.Pd.</p>
              <p>NIP. 199012312020122002</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocSection({ title }: { title: string }) {
  return (
    <div className="bg-gray-100 px-4 py-2 border-l-8 border-black font-sans font-black text-lg mb-6">
      {title}
    </div>
  );
}

function DocSubSection({ title, content, small = false }: { title: string; content: string; small?: boolean }) {
  return (
    <div className="mb-6">
      <h3 className={cn("font-bold font-sans mb-3", small ? "text-sm uppercase underline" : "text-md")}>
        {title}
      </h3>
      <div className={cn("markdown-body text-justify", small ? "text-xs" : "text-sm")}>
        <ReactMarkdown>{content || "*Belum diisi*"}</ReactMarkdown>
      </div>
    </div>
  );
}
