import React, { useState } from "react";
import { LessonPlan, Step } from "../types";
import { 
  Plus, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { cn } from "../lib/utils";

interface RPPFormProps {
  user: any;
  initialData?: LessonPlan | null;
  onBack: () => void;
  onSave: () => void;
  apiKey?: string;
}

export function RPPForm({ user, initialData, onBack, onSave, apiKey }: RPPFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>('identifikasi');
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState<string | null>(null);

  const [formData, setFormData] = useState<LessonPlan>(initialData || {
    userId: user.uid,
    subject: "Pendidikan Agama Islam",
    grade: "8",
    topic: "",
    academicYear: "2024/2025",
    semester: "Ganjil",
    schoolName: "SMP Muhammadiyah 1 Probolinggo",
    teacherName: "Aminudin, S.Pd.",
    teacherId: "1640634",
    principalName: "Rachmawati Fitriyah, S.H., S.Pd.",
    principalId: "1083916",
    logoUrl: "",
    date: new Date().toISOString(),
    pancasilaProfiles: [],
    identifikasi: { pesertaDidik: "", analisisMateri: "" },
    desain: { capaian: "", lintasDisiplin: "", tujuan: "", praktik: "", lingkungan: "", teknologi: "" },
    pengalaman: { awal: "", inti: "", penutup: "" },
    asesmen: { awal: "", proses: "", akhir: "" }
  });

  const steps: { id: Step; label: string }[] = [
    { id: 'identifikasi', label: '1. Identifikasi' },
    { id: 'desain', label: '2. Desain' },
    { id: 'pengalaman', label: '3. Pengalaman' },
    { id: 'asesmen', label: '4. Asesmen' }
  ];

  const generateAI = async (section: string) => {
    if (!formData.topic) {
      alert("Harap isi Topik Pembelajaran terlebih dahulu!");
      return;
    }
    setGenLoading(section);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {})
        },
        body: JSON.stringify({ 
          section, 
          subject: formData.subject, 
          grade: formData.grade, 
          topic: formData.topic 
        }),
      });
      const data = await response.json();
      
      const newFormData = { ...formData };
      if (['pesertaDidik', 'analisisMateri'].includes(section)) {
        (newFormData.identifikasi as any)[section] = data.content;
      } else if (['capaian', 'lintasDisiplin', 'tujuan', 'praktik', 'lingkungan', 'teknologi'].includes(section)) {
        (newFormData.desain as any)[section] = data.content;
      } else if (['awal', 'inti', 'penutup'].includes(section)) {
        (newFormData.pengalaman as any)[section] = data.content;
      } else if (['asesmenAwal', 'asesmenProses', 'asesmenAkhir'].includes(section)) {
        const key = section.replace('asesmen', '').toLowerCase();
        (newFormData.asesmen as any)[key] = data.content;
      }
      setFormData(newFormData);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setGenLoading(null);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (formData.id) {
        await updateDoc(doc(db, "lessonPlans", formData.id), { ...formData, date: new Date().toISOString() });
      } else {
        await addDoc(collection(db, "lessonPlans"), { ...formData, date: new Date().toISOString() });
      }
      onSave();
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const pannels = {
    identifikasi: (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold text-gray-700">Mata Pelajaran</label>
                <button 
                  type="button"
                  onClick={() => {
                    const current = formData.subject;
                    const isCommon = ["Pendidikan Agama Islam", "Bahasa Indonesia", "Matematika", "IPA", "IPS", "Pendidikan Pancasila", "Bahasa Inggris", "Seni Budaya", "PJOK"].includes(current);
                    if (isCommon) {
                      setFormData({...formData, subject: ""});
                    } else {
                      setFormData({...formData, subject: "Pendidikan Agama Islam"});
                    }
                  }}
                  className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 hover:bg-gray-200"
                >
                  {["Pendidikan Agama Islam", "Bahasa Indonesia", "Matematika", "IPA", "IPS", "Pendidikan Pancasila", "Bahasa Inggris", "Seni Budaya", "PJOK"].includes(formData.subject) ? "Ketik Manual" : "Pilih Daftar"}
                </button>
              </div>
              {["Pendidikan Agama Islam", "Bahasa Indonesia", "Matematika", "IPA", "IPS", "Pendidikan Pancasila", "Bahasa Inggris", "Seni Budaya", "PJOK"].includes(formData.subject) ? (
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                >
                  <option>Pendidikan Agama Islam</option>
                  <option>Bahasa Indonesia</option>
                  <option>Matematika</option>
                  <option>IPA</option>
                  <option>IPS</option>
                  <option>Pendidikan Pancasila</option>
                  <option>Bahasa Inggris</option>
                  <option>Seni Budaya</option>
                  <option>PJOK</option>
                </select>
              ) : (
                <input 
                  placeholder="Ketik Mata Pelajaran..."
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Kelas</label>
                <select 
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Semester</label>
                <select 
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                >
                  <option>Ganjil</option>
                  <option>Genap</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Tahun Ajaran</label>
              <input 
                placeholder="Contoh: 2024/2025"
                value={formData.academicYear}
                onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-4">
             <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Topik Pembelajaran</label>
              <input 
                placeholder="Contoh: Ekosistem / Puasa Ramadhan"
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Nama Sekolah</label>
              <input 
                value={formData.schoolName}
                onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 ml-1">Logo Sekolah</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden" 
                  id="logo-upload" 
                />
                <label 
                  htmlFor="logo-upload"
                  className="flex-1 cursor-pointer bg-white border-2 border-dashed border-gray-200 rounded-xl px-4 py-2 text-xs text-gray-500 text-center hover:bg-gray-50 transition-all"
                >
                  {formData.logoUrl ? "Ganti Logo" : "Upload Logo"}
                </label>
                {formData.logoUrl && (
                  <img src={formData.logoUrl} className="h-10 w-10 object-contain rounded border p-1" alt="Logo" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Nama Guru</label>
                <input 
                  value={formData.teacherName}
                  onChange={(e) => setFormData({...formData, teacherName: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">NBM / NIP</label>
                <input 
                  value={formData.teacherId}
                  onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm"
                />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Kepala Sekolah</label>
                <input 
                  value={formData.principalName}
                  onChange={(e) => setFormData({...formData, principalName: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">NBM / NIP Kepala</label>
                <input 
                  value={formData.principalId}
                  onChange={(e) => setFormData({...formData, principalId: e.target.value})}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm"
                />
              </div>
           </div>
        </div>

        <div className="space-y-8">
          <SectionArea 
            label="Identifikasi Peserta Didik" 
            value={formData.identifikasi.pesertaDidik} 
            onChange={(val) => setFormData({...formData, identifikasi: {...formData.identifikasi, pesertaDidik: val}})}
            onGenerate={() => generateAI('pesertaDidik')}
            loading={genLoading === 'pesertaDidik'}
          />
          <SectionArea 
            label="Analisis Materi" 
            value={formData.identifikasi.analisisMateri} 
            onChange={(val) => setFormData({...formData, identifikasi: {...formData.identifikasi, analisisMateri: val}})}
            onGenerate={() => generateAI('analisisMateri')}
            loading={genLoading === 'analisisMateri'}
          />
          
          <div className="space-y-4">
            <label className="text-lg font-bold text-gray-900 block tracking-tight">Dimensi Profil Lulusan (Pancasila)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["Keimanan", "Kewargaan", "Bernalar Kritis", "Kreatif", "Gotong Royong", "Mandiri"].map(p => (
                <label key={p} className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none",
                  formData.pancasilaProfiles.includes(p) ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm" : "bg-white border-gray-100 hover:border-gray-200"
                )}>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.pancasilaProfiles.includes(p)}
                    onChange={(e) => {
                      const profiles = e.target.checked 
                        ? [...formData.pancasilaProfiles, p]
                        : formData.pancasilaProfiles.filter(x => x !== p);
                      setFormData({...formData, pancasilaProfiles: profiles});
                    }}
                  />
                  <span className="font-medium text-sm">{p}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    desain: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionArea label="Capaian Pembelajaran" value={formData.desain.capaian} onChange={(v) => setFormData({...formData, desain: {...formData.desain, capaian: v}})} onGenerate={() => generateAI('capaian')} loading={genLoading === 'capaian'} />
        <SectionArea label="Lintas Disiplin" value={formData.desain.lintasDisiplin} onChange={(v) => setFormData({...formData, desain: {...formData.desain, lintasDisiplin: v}})} onGenerate={() => generateAI('lintasDisiplin')} loading={genLoading === 'lintasDisiplin'} />
        <SectionArea label="Tujuan Pembelajaran" value={formData.desain.tujuan} onChange={(v) => setFormData({...formData, desain: {...formData.desain, tujuan: v}})} onGenerate={() => generateAI('tujuan')} loading={genLoading === 'tujuan'} rows={6} className="md:col-span-2" />
        <SectionArea label="Praktik Pedagogis" value={formData.desain.praktik} onChange={(v) => setFormData({...formData, desain: {...formData.desain, praktik: v}})} onGenerate={() => generateAI('praktik')} loading={genLoading === 'praktik'} />
        <SectionArea label="Kemitraan/Konteks" value={formData.desain.lintasDisiplin} onChange={(v) => setFormData({...formData, desain: {...formData.desain, lintasDisiplin: v}})} onGenerate={() => generateAI('lintasDisiplin')} loading={genLoading === 'lintasDisiplin'} />
        <SectionArea label="Lingkungan Belajar" value={formData.desain.lingkungan} onChange={(v) => setFormData({...formData, desain: {...formData.desain, lingkungan: v}})} onGenerate={() => generateAI('lingkungan')} loading={genLoading === 'lingkungan'} />
        <SectionArea label="Teknologi Digital" value={formData.desain.teknologi} onChange={(v) => setFormData({...formData, desain: {...formData.desain, teknologi: v}})} onGenerate={() => generateAI('teknologi')} loading={genLoading === 'teknologi'} />
      </div>
    ),
    pengalaman: (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionArea label="Langkah Awal" value={formData.pengalaman.awal} onChange={(v) => setFormData({...formData, pengalaman: {...formData.pengalaman, awal: v}})} onGenerate={() => generateAI('awal')} loading={genLoading === 'awal'} color="green" />
        <SectionArea label="Langkah Inti" value={formData.pengalaman.inti} onChange={(v) => setFormData({...formData, pengalaman: {...formData.pengalaman, inti: v}})} onGenerate={() => generateAI('inti')} loading={genLoading === 'inti'} color="blue" rows={8} />
        <SectionArea label="Langkah Penutup" value={formData.pengalaman.penutup} onChange={(v) => setFormData({...formData, pengalaman: {...formData.pengalaman, penutup: v}})} onGenerate={() => generateAI('penutup')} loading={genLoading === 'penutup'} color="red" />
      </div>
    ),
    asesmen: (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionArea label="Asesmen Awal" value={formData.asesmen.awal} onChange={(v) => setFormData({...formData, asesmen: {...formData.asesmen, awal: v}})} onGenerate={() => generateAI('asesmenAwal')} loading={genLoading === 'asesmenAwal'} />
        <SectionArea label="Asesmen Proses" value={formData.asesmen.proses} onChange={(v) => setFormData({...formData, asesmen: {...formData.asesmen, proses: v}})} onGenerate={() => generateAI('asesmenProses')} loading={genLoading === 'asesmenProses'} />
        <SectionArea label="Asesmen Akhir" value={formData.asesmen.akhir} onChange={(v) => setFormData({...formData, asesmen: {...formData.asesmen, akhir: v}})} onGenerate={() => generateAI('asesmenAkhir')} loading={genLoading === 'asesmenAkhir'} />
      </div>
    )
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Form */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Penyusunan Modul Ajar</h2>
          <p className="text-gray-500 text-sm">Lengkapi detail di bawah ini atau gunakan AI untuk membantu merumuskan.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          AI Powered
        </div>
      </div>

      {/* Progress Tabs */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-1 overflow-x-auto">
        {steps.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(s.id)}
            className={cn(
              "flex-1 min-w-[120px] flex items-center justify-center gap-3 py-3 px-4 rounded-xl transition-all font-semibold",
              currentStep === s.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            )}
          >
            <span className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs",
              currentStep === s.id ? "bg-white/20" : "bg-gray-100"
            )}>
              {idx + 1}
            </span>
            <span className="truncate">{s.label.split('.')[1].trim()}</span>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-20 min-h-[500px]">
        {pannels[currentStep]}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 inset-x-0 md:left-64 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 font-semibold px-6 py-3 hover:bg-gray-50 rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali
          </button>

          <div className="flex items-center gap-4">
            {currentStep !== 'asesmen' ? (
              <button
                onClick={() => {
                  const idx = steps.findIndex(s => s.id === currentStep);
                  setCurrentStep(steps[idx+1].id);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <span>Lanjut</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Simpan RPP</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionArea({ 
  label, 
  value, 
  onChange, 
  onGenerate, 
  loading, 
  rows = 4, 
  className,
  color = "blue"
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  onGenerate: () => void; 
  loading: boolean;
  rows?: number;
  className?: string;
  color?: "blue" | "green" | "red";
}) {
  const colorMap = {
    blue: "focus:ring-blue-500 text-blue-800",
    green: "focus:ring-green-500 text-green-800",
    red: "focus:ring-red-500 text-red-800"
  };

  const labelColorMap = {
    blue: "text-blue-900 border-l-4 border-blue-600 pl-3",
    green: "text-green-900 border-l-4 border-green-600 pl-3",
    red: "text-red-900 border-l-4 border-red-600 pl-3"
  };

  return (
    <div className={cn("space-y-3 relative group", className)}>
      <div className="flex items-center justify-between">
        <label className={cn("text-lg font-bold tracking-tight", labelColorMap[color])}>{label}</label>
        <button
          onClick={(e) => { e.preventDefault(); onGenerate(); }}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all border shadow-sm",
            loading 
              ? "bg-gray-100 text-gray-400 border-gray-200" 
              : "bg-white text-purple-600 border-purple-100 hover:bg-purple-50 hover:border-purple-200"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Generate</span>
            </>
          )}
        </button>
      </div>
      <div className="relative">
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Isi bagian ${label.toLowerCase()}...`}
          className={cn(
            "w-full bg-white border border-gray-200 rounded-2xl p-5 text-sm leading-relaxed focus:ring-4 outline-none transition-all shadow-inner",
            colorMap[color]
          )}
        />
        {value && !loading && (
          <div className="absolute top-4 right-4 text-green-500 animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
