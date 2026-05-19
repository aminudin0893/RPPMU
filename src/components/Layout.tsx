import React from "react";
import { 
  PlusCircle, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  BookOpen,
  Key,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "../lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  logout: () => void;
  currentView: string;
  setView: (view: any) => void;
  apiKey: string;
  onApiKeyChange: (val: string) => void;
}

export function Layout({ children, user, logout, currentView, setView, apiKey, onApiKeyChange }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 768);
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [localApiKey, setLocalApiKey] = React.useState(apiKey);

  // Sync local key when prop changes (e.g. on mount)
  React.useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);

  const handleSaveApiKey = () => {
    onApiKeyChange(localApiKey);
  };

  // Close sidebar on navigation in mobile
  const handleNav = (view: string) => {
    setView(view);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard RPP", icon: LayoutDashboard },
    { id: "form", label: "Buat RPP Baru", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed inset-y-0 z-50",
          isSidebarOpen ? "translate-x-0 w-64 shadow-2xl md:shadow-none" : "-translate-x-full md:translate-x-0 md:w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="min-w-10 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
            <BookOpen className="w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-gray-900 truncate">AsisGuru</span>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                currentView === item.id 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", currentView === item.id ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600")} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
            )}
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {isSidebarOpen && <span className="font-medium">Keluar</span>}
          </button>
        </div>

        {isSidebarOpen && (
          <div className="p-4 border-t border-gray-100 bg-purple-50/50">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-purple-600">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase underline decoration-purple-200 decoration-2 underline-offset-4">Gemini API Key</span>
                </div>
              </div>
              <div className="relative group">
                <input 
                  type={showApiKey ? "text" : "password"}
                  placeholder="Paste your key here..."
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  className="w-full bg-white border border-purple-100 rounded-lg pl-3 pr-9 py-2 text-xs focus:ring-2 focus:ring-purple-400 outline-none shadow-sm transition-all"
                />
                <button 
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 p-1"
                  title={showApiKey ? "Sembunyikan" : "Tampilkan"}
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                onClick={handleSaveApiKey}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold py-1.5 rounded-lg transition-all shadow-sm active:scale-[0.98]"
              >
                Simpan API Key
              </button>
              <p className="text-[10px] text-purple-400 leading-tight">Gunakan API Key sendiri untuk performa lebih baik.</p>
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-gray-600 shadow-sm md:block hidden"
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 min-w-0 h-screen overflow-auto",
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        )}
      >
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-8 py-4 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4 truncate mr-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(!isSidebarOpen); }} 
              className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm md:text-lg font-semibold text-gray-700 truncate">
              {currentView === "dashboard" ? "Dashboard" : "Penyusunan Modul Ajar"}
            </h2>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-none">{user.displayName}</p>
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            </div>
            <img src={user.photoURL} alt="Avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-200 p-0.5 shadow-sm" />
          </div>
        </header>

        <div className="p-4 md:p-8 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}
