import React, { useEffect } from 'react';
import { useIDEStore } from './store/ideStore';
import DesktopLayout from './components/desktop/DesktopLayout';
import MobileLayout from './components/mobile/MobileLayout';
import AuthPanel from './components/shared/AuthPanel';
import { Laptop, Smartphone, FileArchive, Download, Shield, User, LogOut } from 'lucide-react';

export default function App() {
  const { 
    activeWorkspaceMode, 
    setWorkspaceMode, 
    theme, 
    token, 
    user, 
    logoutUser, 
    exportZip,
    importZip
  } = useIDEStore();

  // Dynamically attach theme properties onto body class list
  useEffect(() => {
    const body = document.body;
    // Clear previous themes
    body.className = '';
    
    // Add specific styles
    switch (theme) {
      case 'light':
        body.classList.add('bg-slate-50', 'text-slate-900');
        break;
      case 'amoled':
        body.classList.add('bg-black', 'text-zinc-200');
        break;
      case 'nord':
        body.classList.add('bg-[#2e3440]', 'text-[#d8dee9]');
        break;
      case 'dracula':
        body.classList.add('bg-[#282a36]', 'text-[#f8f8f2]');
        break;
      case 'monokai':
        body.classList.add('bg-[#272822]', 'text-[#f8f8f2]');
        break;
      case 'cyberpunk':
        body.classList.add('bg-[#0f051d]', 'text-[#00ffcc]');
        break;
      case 'ocean':
        body.classList.add('bg-[#0b132b]', 'text-[#ffffff]');
        break;
      case 'midnight':
        body.classList.add('bg-[#02010a]', 'text-indigo-200');
        break;
      default:
        body.classList.add('bg-slate-900', 'text-slate-100'); // dark
    }
  }, [theme]);

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importZip(file);
        alert("Project ZIP imported successfully! Enjoy CodeVerse.");
      } catch (err) {
        alert("Failed to parse zip template. Check standard schemas.");
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" id="codeverse-root-container">
      {/* Top Main Toolbar */}
      <header className="h-14 shrink-0 bg-slate-950/95 border-b border-white/10 px-4 md:px-6 flex items-center justify-between z-10 select-none">
        {/* Brand details */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow shadow-indigo-500/20">
            <span className="font-black text-white text-base font-mono">C</span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-extrabold text-sm tracking-wider text-white uppercase font-sans">
              CodeVerse <span className="text-[10px] text-indigo-400 font-semibold px-1 rounded bg-indigo-500/10 border border-indigo-500/20 ml-1.5">IDE</span>
            </h1>
            <p className="text-[9px] text-white/40 font-medium hidden sm:block">Modern cloud IDE platform</p>
          </div>
        </div>

        {/* Workspace switches (Prominent Desktop / Mobile Selector) */}
        <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
          <button
            onClick={() => setWorkspaceMode('desktop')}
            className={`p-1.5 px-3 rounded-md transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeWorkspaceMode === 'desktop' 
                ? 'bg-indigo-600 text-white shadow shadow-indigo-600/10 font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
            id="workspace-desktop-selector"
          >
            <Laptop className="w-4 h-4" />
            <span className="hidden xs:inline">Desktop</span>
          </button>
          <button
            onClick={() => setWorkspaceMode('mobile')}
            className={`p-1.5 px-3 rounded-md transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              activeWorkspaceMode === 'mobile' 
                ? 'bg-indigo-600 text-white shadow shadow-indigo-600/10 font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
            id="workspace-mobile-selector"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden xs:inline">Mobile</span>
          </button>
        </div>

        {/* Global actions: Import, Export, Profile avatar dropdown */}
        <div className="flex items-center gap-3">
          
          {/* Quick ZIP operations */}
          <div className="hidden md:flex items-center gap-2">
            <label 
              className="flex items-center gap-1.5 p-1.5 px-3 border border-white/10 rounded-lg hover:bg-white/5 text-xs text-slate-300 transition cursor-pointer"
              title="Import ZIP Project Archive"
              id="toolbar-import-zip"
            >
              <FileArchive className="w-4 h-4 text-indigo-400" />
              <span>Import ZIP</span>
              <input 
                type="file" 
                accept=".zip" 
                onChange={handleZipUpload} 
                className="hidden" 
              />
            </label>
            <button
              onClick={exportZip}
              className="flex items-center gap-1.5 p-1.5 px-3 border border-white/10 rounded-lg hover:bg-white/5 text-xs text-slate-300 transition cursor-pointer"
              title="Export Full ZIP Archive"
              id="toolbar-export-zip"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Export ZIP</span>
            </button>
          </div>

          {/* Profile indicators */}
          {token && (
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <img 
                src={user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=CodeVerse"} 
                alt="Profile Avatar" 
                className="w-7 h-7 rounded-full bg-indigo-500/20 border border-white/20 shadow-sm"
              />
              <span className="text-xs font-medium text-slate-300 hidden lg:inline max-w-[120px] truncate">
                {user?.name || "Guest"}
              </span>
              <button
                onClick={logoutUser}
                className="p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-red-400 transition cursor-pointer"
                title="Logout session"
                id="toolbar-logout-session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Primary Layout switcher based on mode */}
      <main className="flex-grow min-h-0 relative">
        {activeWorkspaceMode === 'mobile' ? <MobileLayout /> : <DesktopLayout />}
      </main>

      {/* If token is null, require the user to login/register or proceed as guest */}
      {!token && <AuthPanel />}
    </div>
  );
}
