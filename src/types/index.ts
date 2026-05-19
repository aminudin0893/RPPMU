export interface LessonPlan {
  id?: string;
  userId: string;
  subject: string;
  grade: string;
  topic: string;
  date: string;
  pancasilaProfiles: string[];
  identifikasi: {
    pesertaDidik: string;
    analisisMateri: string;
  };
  desain: {
    capaian: string;
    lintasDisiplin: string;
    tujuan: string;
    praktik: string;
    lingkungan: string;
    teknologi: string;
  };
  pengalaman: {
    awal: string;
    inti: string;
    penutup: string;
  };
  asesmen: {
    awal: string;
    proses: string;
    akhir: string;
  };
}

export type Step = 'identifikasi' | 'desain' | 'pengalaman' | 'asesmen';
