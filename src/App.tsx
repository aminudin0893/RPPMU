/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { RPPForm } from "./components/RPPForm";
import { PrintView } from "./components/PrintView";
import { LessonPlan } from "./types";
import { LogIn } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"dashboard" | "form" | "print">("dashboard");
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <LogIn className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">AsisGuru</h1>
            <p className="text-gray-500">Asisten Pintar Guru untuk menyusun Modul Ajar AI</p>
          </div>
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            Masuk dengan Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} logout={logout} currentView={view} setView={setView}>
      {view === "dashboard" && (
        <Dashboard 
          user={user} 
          onEdit={(plan) => {
            setSelectedPlan(plan);
            setView("form");
          }} 
          onPrint={(plan) => {
            setSelectedPlan(plan);
            setView("print");
          }}
          onCreateNew={() => {
            setSelectedPlan(null);
            setView("form");
          }}
        />
      )}
      {view === "form" && (
        <RPPForm 
          user={user} 
          initialData={selectedPlan} 
          onBack={() => setView("dashboard")} 
          onSave={() => setView("dashboard")}
        />
      )}
      {view === "print" && selectedPlan && (
        <PrintView 
          plan={selectedPlan} 
          onBack={() => setView("dashboard")} 
        />
      )}
    </Layout>
  );
}
