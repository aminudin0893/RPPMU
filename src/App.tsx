/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { RPPForm } from "./components/RPPForm";
import { PrintView } from "./components/PrintView";
import { LessonPlan } from "./types";
import { LogIn, Key, Eye, EyeOff } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem("GEMINI_API_KEY") || "");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"dashboard" | "form" | "print">("dashboard");
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("asisguru_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "085227") {
      const newUser = { 
        uid: "user_aminudin", 
        displayName: "Aminudin, S.Pd.", 
        email: "aminudin0893@gmail.com",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher"
      };
      setUser(newUser);
      localStorage.setItem("asisguru_user", JSON.stringify(newUser));
    } else {
      alert("PIN Salah!");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("asisguru_user");
  };

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem("GEMINI_API_KEY", val);
    alert("API Key Gemini berhasil disimpan!");
  };

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
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-sm font-semibold text-gray-700 ml-1">Masukkan PIN Login Aplikasi</label>
              <div className="relative">
                <input 
                  type={showPin ? "text" : "password"}
                  placeholder="******"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center text-xl tracking-[0.5em] font-mono"
                  maxLength={6}
                />
                <button 
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              Masuk
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-3">Versi 2.0 - AsisGuru Pro</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} logout={logout} currentView={view} setView={setView} apiKey={apiKey} onApiKeyChange={handleApiKeyChange}>
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
          apiKey={apiKey}
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
