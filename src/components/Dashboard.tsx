import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc,
  orderBy
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { LessonPlan } from "../types";
import { 
  Printer, 
  Edit2, 
  Trash2, 
  Plus, 
  Search,
  BookOpen,
  Calendar,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  user: any;
  onEdit: (plan: LessonPlan) => void;
  onPrint: (plan: LessonPlan) => void;
  onCreateNew: () => void;
}

export function Dashboard({ user, onEdit, onPrint, onCreateNew }: DashboardProps) {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "lessonPlans"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LessonPlan[];
      setPlans(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus RPP ini?")) {
      try {
        await deleteDoc(doc(db, "lessonPlans", id));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const filteredPlans = plans.filter(p => 
    p.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Modul Ajar Saya</h1>
          <p className="text-gray-500">Kumpulan RPP yang telah Anda susun dengan bantuan AI.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>Buat RPP Baru</span>
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari Mata Pelajaran atau Topik..."
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 h-48 animate-pulse border border-gray-100 shadow-sm" />
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 flex flex-col items-center gap-4">
          <div className="p-4 bg-gray-50 rounded-full">
            <BookOpen className="w-12 h-12 text-gray-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Belum Ada RPP</h3>
            <p className="text-gray-500 max-w-xs mx-auto">Mulai susun modul ajar pertama Anda dengan menekan tombol Buat RPP Baru.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredPlans.map((plan) => (
              <motion.div
                key={plan.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {plan.subject}
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-xs font-medium bg-gray-50 px-2 py-1 rounded-md">
                    <Layers className="w-3 h-3" />
                    Kelas {plan.grade}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                  {plan.topic}
                </h3>

                <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                  <Calendar className="w-4 h-4" />
                  {new Date(plan.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>

                <div className="mt-auto grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onPrint(plan)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all font-semibold text-sm text-gray-600 shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak</span>
                  </button>
                  <button
                    onClick={() => onEdit(plan)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-gray-100 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-100 transition-all font-semibold text-sm text-gray-600 shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => plan.id && handleDelete(plan.id)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-semibold text-sm text-gray-600 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
