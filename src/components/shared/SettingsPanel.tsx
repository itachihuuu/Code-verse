import { useIDEStore } from '../../store/ideStore';
import { Settings, Sliders, Type, FileJson, Palette, User, Key, RefreshCcw } from 'lucide-react';

export default function SettingsPanel() {
  const { theme, setTheme, settings, updateSettings, user, logoutUser } = useIDEStore();

  const handleFontSizeChange = (val: number) => {
    updateSettings({ fontSize: val });
  };

  const handleWordWrapChange = (val: 'on' | 'off') => {
    updateSettings({ wordWrap: val });
  };

  const handleAutosaveChange = (val: boolean) => {
    updateSettings({ autosave: val });
  };

  const themes = [
    { id: 'dark', name: 'Charcoal Dark', bg: 'bg-slate-900 border-slate-700' },
    { id: 'light', name: 'Alabaster Light', bg: 'bg-white border-slate-300' },
    { id: 'amoled', name: 'AMOLED Black', bg: 'bg-black border-zinc-800' },
    { id: 'nord', name: 'Nordic Slate', bg: 'bg-slate-800 border-slate-600' },
    { id: 'dracula', name: 'Dracula Dark', bg: 'bg-[#282a36] border-[#44475a]' },
    { id: 'monokai', name: 'Monokai Retro', bg: 'bg-[#272822] border-[#49483e]' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', bg: 'bg-[#0f051d] border-fuchsia-900' },
    { id: 'ocean', name: 'Ocean Deep', bg: 'bg-[#0b132b] border-[#1c2541]' },
    { id: 'midnight', name: 'Cosmic Midnight', bg: 'bg-[#02010a] border-indigo-950' },
  ];

  const handleResetWorkspace = () => {
    if (confirm("Are you sure you want to reset your CodeVerse workspace? This will restore original seed files and clear cached settings.")) {
      localStorage.removeItem('codeverse-ide-storage');
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full bg-inherit text-sm select-none" id="settings-panel">
      {/* Header */}
      <div className="p-3 border-b border-white/10 bg-white/5">
        <span className="font-semibold uppercase text-xs tracking-wider opacity-60">EDITOR SETTINGS</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        
        {/* Profile Card */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
            <User className="w-3 h-3" />
            User Account
          </span>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3">
            <img 
              src={user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=CodeVerse"} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full bg-indigo-500/10 border border-white/20"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-xs text-white truncate">{user?.name || "Guest Developer"}</h4>
              <p className="text-[10px] text-white/40 truncate">{user?.email || "guest@codeverse.io"}</p>
            </div>
            {user && (
              <button
                onClick={logoutUser}
                className="text-[10px] bg-red-950/40 text-red-400 hover:bg-red-900/50 hover:text-white px-2 py-1 rounded cursor-pointer transition"
                id="btn-logout"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Visual Themes Grid */}
        <div className="space-y-2.5">
          <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1">
            <Palette className="w-3.5 h-3.5" />
            Visual Themes
          </span>
          <div className="grid grid-cols-2 gap-2">
            {themes.map(t => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/70'
                  }`}
                  id={`theme-select-${t.id}`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${t.bg} border shrink-0`}></span>
                  <span className="text-xs truncate">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor Settings sliders / toggle form */}
        <div className="space-y-4 border-t border-white/5 pt-4">
          <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            Editor Options
          </span>

          {/* Font size */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-white/80">
              <span className="flex items-center gap-1"><Type className="w-3.5 h-3.5 text-indigo-400" /> Font Size</span>
              <span className="font-mono text-indigo-300 font-semibold">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min="10"
              max="24"
              value={settings.fontSize}
              onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-black/40 rounded-lg outline-none"
              id="slider-font-size"
            />
          </div>

          {/* Word Wrap */}
          <div className="flex items-center justify-between py-1 text-xs text-white/80">
            <span>Word Wrap</span>
            <div className="flex rounded-md bg-black/30 p-0.5 border border-white/10">
              <button
                onClick={() => handleWordWrapChange('on')}
                className={`px-3 py-1 text-[10px] font-semibold rounded cursor-pointer transition ${
                  settings.wordWrap === 'on' ? 'bg-indigo-600 text-white shadow-sm' : 'text-white/40 hover:text-white'
                }`}
                id="btn-wrap-on"
              >
                ON
              </button>
              <button
                onClick={() => handleWordWrapChange('off')}
                className={`px-3 py-1 text-[10px] font-semibold rounded cursor-pointer transition ${
                  settings.wordWrap === 'off' ? 'bg-indigo-600 text-white shadow-sm' : 'text-white/40 hover:text-white'
                }`}
                id="btn-wrap-off"
              >
                OFF
              </button>
            </div>
          </div>

          {/* Autosave */}
          <div className="flex items-center justify-between py-1 text-xs text-white/80">
            <span>Autosave (Simulated)</span>
            <div className="flex rounded-md bg-black/30 p-0.5 border border-white/10">
              <button
                onClick={() => handleAutosaveChange(true)}
                className={`px-3 py-1 text-[10px] font-semibold rounded cursor-pointer transition ${
                  settings.autosave ? 'bg-indigo-600 text-white shadow-sm' : 'text-white/40 hover:text-white'
                }`}
                id="btn-autosave-on"
              >
                ON
              </button>
              <button
                onClick={() => handleAutosaveChange(false)}
                className={`px-3 py-1 text-[10px] font-semibold rounded cursor-pointer transition ${
                  !settings.autosave ? 'bg-indigo-600 text-white shadow-sm' : 'text-white/40 hover:text-white'
                }`}
                id="btn-autosave-off"
              >
                OFF
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Operations */}
        <div className="border-t border-white/5 pt-4">
          <button
            onClick={handleResetWorkspace}
            className="w-full bg-red-950/25 border border-red-900/30 text-red-400 hover:bg-red-900/40 text-xs font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            id="btn-reset-workspace"
          >
            <RefreshCcw className="w-4 h-4" />
            Reset Workspace Cache
          </button>
        </div>
      </div>
    </div>
  );
}
