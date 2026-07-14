import { useState, useRef } from 'react';
import { useIDEStore, VFSFile } from '../../store/ideStore';
import Editor from '@monaco-editor/react';
import { 
  Folder, Sparkles, Terminal, GitBranch, Settings, Mic, Camera, X, Menu, Play, RefreshCw, Cpu
} from 'lucide-react';

import FileTree from '../shared/FileTree';
import AICopilot from '../shared/AICopilot';
import TerminalPanel from '../shared/TerminalPanel';
import GitPanel from '../shared/GitPanel';
import SettingsPanel from '../shared/SettingsPanel';
import LivePreview from '../shared/LivePreview';
import CameraOCR from '../shared/CameraOCR';

type MobileTab = 'editor' | 'preview' | 'terminal' | 'git' | 'copilot';

export default function MobileLayout() {
  const { 
    files, 
    activeFilePath, 
    setActiveFilePath, 
    tabs, 
    closeTab, 
    theme, 
    settings, 
    updateFileContent,
    executeTerminalCommand
  } = useIDEStore();

  const [activeTab, setActiveTab] = useState<MobileTab>('editor');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showOcrScanner, setShowOcrScanner] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  
  const editorRef = useRef<any>(null);

  const activeFile = files.find(f => f.path === activeFilePath && !f.isFolder);

  const runActiveFileMobile = () => {
    if (!activeFile) return;

    let command = '';
    if (activeFile.language === 'javascript' || activeFile.path.endsWith('.js')) {
      command = `node ${activeFile.name}`;
    } else if (activeFile.language === 'python' || activeFile.path.endsWith('.py')) {
      command = `python ${activeFile.name}`;
    } else if (activeFile.language === 'html' || activeFile.path.endsWith('.html')) {
      setActiveTab('preview');
      return;
    } else {
      command = `cat ${activeFile.name}`;
    }

    setActiveTab('terminal');
    executeTerminalCommand(command);
  };

  // Helper keyboard shortcut keys for mobile programmers
  const customKeys = ['{', '}', '[', ']', '(', ')', ';', '=', '<', '>', '/', '\\', ':', '"', "'", '+', '-', '*', '%', '_'];

  const handleKeyPress = (char: string) => {
    if (!activeFile) return;
    
    // If Monaco editor instance is available, we can insert text at cursor
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      editor.executeEdits("my-source", [{
        range: selection,
        text: char,
        forceMoveMarkers: true
      }]);
      editor.focus();
    } else {
      // Fallback simple append
      updateFileContent(activeFile.path, activeFile.content + char);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFilePath && value !== undefined) {
      updateFileContent(activeFilePath, value);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  // Simulated Speech-to-code typing flow
  const handleVoiceType = () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    setIsVoiceListening(true);
    // standard web speech synthesis simulation
    setTimeout(() => {
      if (!activeFile) {
        alert("Select a file first to write code using voice input!");
        setIsVoiceListening(false);
        return;
      }

      // Generate a simulated code snippet based on voice instruction
      const simulatedDictatedText = `\n\n// Voice Generated Helper\nfunction handleSum(a, b) {\n  return a + b;\n}\n`;
      updateFileContent(activeFile.path, activeFile.content + simulatedDictatedText);
      
      setIsVoiceListening(false);
      alert("Voice input received: 'function handle sum template' successfully written into editor!");
    }, 2500);
  };

  const getThemeColors = () => {
    switch (theme) {
      case 'light': return { bg: 'bg-[#f8fafc]', border: 'border-[#cbd5e1]', drawer: 'bg-[#f1f5f9]' };
      case 'amoled': return { bg: 'bg-black', border: 'border-zinc-800', drawer: 'bg-[#0a0a0a]' };
      case 'cyberpunk': return { bg: 'bg-[#0f051d]', border: 'border-fuchsia-950/40', drawer: 'bg-[#090212]' };
      default: return { bg: 'bg-[#0f172a]', border: 'border-[#1e293b]', drawer: 'bg-[#151f32]' }; // standard default
    }
  };

  const colors = getThemeColors();

  return (
    <div className={`flex flex-col h-full ${colors.bg} text-slate-100 overflow-hidden relative select-none`} id="mobile-workspace-shell">
      
      {/* Upper sub tab indicators */}
      <div className={`flex items-center justify-between p-2.5 border-b ${colors.border} bg-black/15 shrink-0`}>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setDrawerOpen(true)} 
            className="p-1.5 rounded bg-white/5 border border-white/10 text-white cursor-pointer"
            id="btn-mobile-menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold font-sans tracking-wider uppercase text-white">WORKSPACE</span>
        </div>

        {/* OCR & Voice controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleVoiceType}
            className={`p-1.5 rounded-full border transition cursor-pointer ${isVoiceListening ? 'bg-red-600 border-red-500 animate-pulse text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
            title="Voice Code Input"
            id="btn-voice-input"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowOcrScanner(true)}
            className="p-1.5 rounded-full bg-indigo-600 border border-indigo-500 text-white cursor-pointer transition"
            title="Camera OCR Code Capture"
            id="btn-mobile-ocr"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Touch horizontal tab list */}
      {activeTab === 'editor' && (
        <div className={`flex items-center justify-between border-b ${colors.border} bg-black/5 select-none shrink-0 h-10`}>
          <div className="flex items-center gap-1 overflow-x-auto p-1.5 scrollbar-none flex-grow">
            {tabs.map(tabPath => {
              const isSelected = activeFilePath === tabPath;
              return (
                <div
                  key={tabPath}
                  onClick={() => setActiveFilePath(tabPath)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition cursor-pointer shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  id={`tab-mobile-${tabPath.replace(/[^a-zA-Z0-9]/g, '-')}`}
                >
                  <span>{tabPath.split('/').pop() || tabPath}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); closeTab(tabPath); }}
                    className="p-0.5 rounded-full hover:bg-white/10 text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
            {tabs.length === 0 && (
              <div className="text-[10px] text-white/30 px-3 italic">
                Tap menu drawer to select active workspace file
              </div>
            )}
          </div>
          {activeFile && (
            <button
              onClick={runActiveFileMobile}
              className="flex items-center gap-1 px-2.5 py-1 mr-2 text-[11px] font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer shrink-0"
              title="Run Code"
              id="btn-run-code-mobile"
            >
              <Play className="w-3.5 h-3.5 fill-white/20 shrink-0" />
              <span>Run</span>
            </button>
          )}
        </div>
      )}

      {/* Main active workspace content pane */}
      <div className="flex-1 min-h-0 relative">
        {activeTab === 'editor' && (
          <div className="w-full h-full flex flex-col min-h-0">
            {/* Editor itself */}
            <div className="flex-1 min-h-0 relative">
              {activeFile ? (
                <Editor
                  height="100%"
                  language={activeFile.language}
                  value={activeFile.content}
                  theme={theme === 'light' ? 'light' : 'vs-dark'}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize: 13,
                    wordWrap: 'on',
                    minimap: { enabled: false },
                    automaticLayout: true,
                    scrollbar: {
                      verticalScrollbarSize: 6,
                      horizontalScrollbarSize: 6
                    }
                  }}
                  loading={
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-[#121214]">
                      <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Loading Monaco...</span>
                    </div>
                  }
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3.5 select-none">
                  <Cpu className="w-12 h-12 text-indigo-500/40 animate-pulse" />
                  <div>
                    <h3 className="font-bold text-sm text-white">No Open Files</h3>
                    <p className="text-[11px] text-white/40 max-w-xs mt-1 leading-relaxed">
                      Swipe open the drawer menu on the top-left and select any asset file to start editing.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Programmers Key Accessory Horizontal Toolbar */}
            {activeFile && (
              <div className="h-10 shrink-0 bg-slate-950/60 border-t border-white/5 flex items-center overflow-x-auto px-2 gap-1.5 scrollbar-none select-none">
                {customKeys.map(char => (
                  <button
                    key={char}
                    onClick={() => handleKeyPress(char)}
                    className="h-7 min-w-[32px] px-1.5 rounded bg-white/5 border border-white/5 active:bg-indigo-600 active:text-white text-xs font-mono font-bold text-zinc-300 flex items-center justify-center cursor-pointer select-none shrink-0"
                    id={`key-mobile-${char}`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'preview' && <LivePreview />}
        {activeTab === 'terminal' && <TerminalPanel />}
        {activeTab === 'git' && <GitPanel />}
        {activeTab === 'copilot' && <AICopilot />}
      </div>

      {/* Floating Left Side Sheet Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-filter backdrop-blur-sm flex select-none" id="mobile-sidebar-overlay">
          <div className={`w-64 h-full ${colors.drawer} border-r ${colors.border} flex flex-col relative`} id="mobile-sidebar-panel">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/10 shrink-0">
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-400">SIDEBAR</span>
              <button 
                onClick={() => setDrawerOpen(false)} 
                className="p-1 rounded hover:bg-white/5 text-slate-400"
                id="btn-close-mobile-sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar content (Folder explorer + Settings toggles) */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="border-b border-white/5">
                <FileTree />
              </div>
              <div>
                <SettingsPanel />
              </div>
            </div>
          </div>
          
          {/* Click outside closer */}
          <div className="flex-1" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* Bottom controls tab navigation */}
      <div className="h-14 shrink-0 bg-slate-950/85 border-t border-white/5 grid grid-cols-5 gap-0.5 select-none" id="mobile-bottom-navbar">
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] cursor-pointer ${activeTab === 'editor' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          id="btn-mobile-tab-editor"
        >
          <Folder className="w-5 h-5" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] cursor-pointer ${activeTab === 'preview' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          id="btn-mobile-tab-preview"
        >
          <Play className="w-5 h-5" />
          <span>Preview</span>
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] cursor-pointer ${activeTab === 'terminal' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          id="btn-mobile-tab-terminal"
        >
          <Terminal className="w-5 h-5" />
          <span>Terminal</span>
        </button>
        <button
          onClick={() => setActiveTab('git')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] cursor-pointer ${activeTab === 'git' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          id="btn-mobile-tab-git"
        >
          <GitBranch className="w-5 h-5" />
          <span>Git</span>
        </button>
        <button
          onClick={() => setActiveTab('copilot')}
          className={`flex flex-col items-center justify-center gap-1 text-[10px] cursor-pointer ${activeTab === 'copilot' ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}
          id="btn-mobile-tab-copilot"
        >
          <Sparkles className="w-5 h-5" />
          <span>AI Chat</span>
        </button>
      </div>

      {/* Camera OCR scanning overlay modal */}
      {showOcrScanner && (
        <CameraOCR onClose={() => setShowOcrScanner(false)} />
      )}
    </div>
  );
}
