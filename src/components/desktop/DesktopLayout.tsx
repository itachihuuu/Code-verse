import { useState } from 'react';
import { useIDEStore, VFSFile } from '../../store/ideStore';
import Editor from '@monaco-editor/react';
import { 
  Folder, Search, GitBranch, Puzzle, Sparkles, Settings,
  Terminal, AlertTriangle, Eye, TerminalSquare, RefreshCw, ChevronDown, ChevronUp, X, Cpu, CheckCircle2, Play
} from 'lucide-react';

import FileTree from '../shared/FileTree';
import SearchPanel from '../shared/SearchPanel';
import GitPanel from '../shared/GitPanel';
import ExtensionPanel from '../shared/ExtensionPanel';
import AICopilot from '../shared/AICopilot';
import SettingsPanel from '../shared/SettingsPanel';
import TerminalPanel from '../shared/TerminalPanel';
import LivePreview from '../shared/LivePreview';

type ActivePanel = 'explorer' | 'search' | 'git' | 'extensions' | 'copilot' | 'settings' | null;
type BottomTab = 'terminal' | 'output' | 'problems';

export default function DesktopLayout() {
  const { 
    files, 
    activeFilePath, 
    setActiveFilePath, 
    tabs, 
    closeTab, 
    theme, 
    settings, 
    updateFileContent,
    git,
    problems,
    executeTerminalCommand
  } = useIDEStore();

  const [activePanel, setActivePanel] = useState<ActivePanel>('explorer');
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('terminal');
  const [isBottomOpen, setIsBottomOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [previewWidth, setPreviewWidth] = useState(450);

  const activeFile = files.find(f => f.path === activeFilePath && !f.isFolder);

  const runActiveFile = () => {
    if (!activeFile) return;
    
    let command = '';
    if (activeFile.language === 'javascript' || activeFile.path.endsWith('.js')) {
      command = `node ${activeFile.name}`;
    } else if (activeFile.language === 'python' || activeFile.path.endsWith('.py')) {
      command = `python ${activeFile.name}`;
    } else if (activeFile.language === 'html' || activeFile.path.endsWith('.html')) {
      setIsPreviewOpen(true);
      return;
    } else {
      command = `cat ${activeFile.name}`;
    }

    setActiveBottomTab('terminal');
    setIsBottomOpen(true);
    executeTerminalCommand(command);
  };

  const handleSidebarToggle = (panel: ActivePanel) => {
    if (activePanel === panel) {
      setActivePanel(null); // Collapse
    } else {
      setActivePanel(panel);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (activeFilePath && value !== undefined) {
      updateFileContent(activeFilePath, value);
    }
  };

  // Maps theme states to specific CSS classes for styling
  const getThemeColors = () => {
    switch (theme) {
      case 'light': return { bg: 'bg-[#f8fafc]', text: 'text-[#0f172a]', border: 'border-[#cbd5e1]', sidebar: 'bg-[#f1f5f9]' };
      case 'amoled': return { bg: 'bg-[#000000]', text: 'text-[#e4e4e7]', border: 'border-[#18181b]', sidebar: 'bg-[#0a0a0a]' };
      case 'nord': return { bg: 'bg-[#2e3440]', text: 'text-[#d8dee9]', border: 'border-[#4c566a]', sidebar: 'bg-[#242933]' };
      case 'dracula': return { bg: 'bg-[#282a36]', text: 'text-[#f8f8f2]', border: 'border-[#44475a]', sidebar: 'bg-[#21222c]' };
      case 'monokai': return { bg: 'bg-[#272822]', text: 'text-[#f8f8f2]', border: 'border-[#49483e]', sidebar: 'bg-[#1e1f1c]' };
      case 'cyberpunk': return { bg: 'bg-[#0f051d]', text: 'text-[#00ffcc]', border: 'border-[#3f007f]', sidebar: 'bg-[#090212]' };
      case 'ocean': return { bg: 'bg-[#0b132b]', text: 'text-[#ffffff]', border: 'border-[#1c2541]', sidebar: 'bg-[#080d1e]' };
      case 'midnight': return { bg: 'bg-[#02010a]', text: 'text-indigo-200', border: 'border-indigo-950/40', sidebar: 'bg-[#040212]' };
      default: return { bg: 'bg-[#0f172a]', text: 'text-[#e2e8f0]', border: 'border-[#1e293b]', sidebar: 'bg-[#0f172a]' }; // Dark default
    }
  };

  const colors = getThemeColors();

  return (
    <div className={`flex flex-col h-full ${colors.bg} ${colors.text} overflow-hidden select-none`} id="desktop-workspace-shell">
      
      {/* Central workspace main row */}
      <div className="flex-grow flex min-h-0 overflow-hidden">
        
        {/* Leftmost Activity Bar */}
        <div className={`w-14 shrink-0 flex flex-col justify-between items-center py-4 border-r ${colors.border} bg-black/20 select-none`}>
          <div className="flex flex-col gap-5 items-center w-full text-slate-400">
            <button
              onClick={() => handleSidebarToggle('explorer')}
              className={`p-2 rounded-xl transition hover:bg-white/5 cursor-pointer relative ${activePanel === 'explorer' ? 'text-indigo-400 bg-white/5 border-l-2 border-indigo-500 rounded-l-none' : ''}`}
              title="File Explorer"
              id="activity-explorer"
            >
              <Folder className="w-5.5 h-5.5" />
            </button>
            <button
              onClick={() => handleSidebarToggle('search')}
              className={`p-2 rounded-xl transition hover:bg-white/5 cursor-pointer ${activePanel === 'search' ? 'text-indigo-400 bg-white/5 border-l-2 border-indigo-500 rounded-l-none' : ''}`}
              title="Search & Replace"
              id="activity-search"
            >
              <Search className="w-5.5 h-5.5" />
            </button>
            <button
              onClick={() => handleSidebarToggle('git')}
              className={`p-2 rounded-xl transition hover:bg-white/5 cursor-pointer relative ${activePanel === 'git' ? 'text-indigo-400 bg-white/5 border-l-2 border-indigo-500 rounded-l-none' : ''}`}
              title="Source Control"
              id="activity-git"
            >
              <GitBranch className="w-5.5 h-5.5" />
              {git.isRepo && (git.staged.length > 0 || git.modified.length > 0) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              )}
            </button>
            <button
              onClick={() => handleSidebarToggle('extensions')}
              className={`p-2 rounded-xl transition hover:bg-white/5 cursor-pointer ${activePanel === 'extensions' ? 'text-indigo-400 bg-white/5 border-l-2 border-indigo-500 rounded-l-none' : ''}`}
              title="Extension Marketplace"
              id="activity-extensions"
            >
              <Puzzle className="w-5.5 h-5.5" />
            </button>
            <button
              onClick={() => handleSidebarToggle('copilot')}
              className={`p-2 rounded-xl transition hover:bg-white/5 cursor-pointer ${activePanel === 'copilot' ? 'text-indigo-400 bg-white/5 border-l-2 border-indigo-500 rounded-l-none' : ''}`}
              title="Gemini AI Companion"
              id="activity-copilot"
            >
              <Sparkles className="w-5.5 h-5.5" />
            </button>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={() => handleSidebarToggle('settings')}
              className={`p-2 rounded-xl transition hover:bg-white/5 text-slate-400 cursor-pointer ${activePanel === 'settings' ? 'text-indigo-400 bg-white/5 border-l-2 border-indigo-500 rounded-l-none' : ''}`}
              title="Settings"
              id="activity-settings"
            >
              <Settings className="w-5.5 h-5.5" />
            </button>
          </div>
        </div>

        {/* Resizable Sidebar */}
        {activePanel && (
          <div 
            style={{ width: `${sidebarWidth}px` }} 
            className={`h-full shrink-0 flex flex-col border-r ${colors.border} ${colors.sidebar} relative`}
            id="desktop-sidebar-container"
          >
            <div className="flex-grow min-h-0">
              {activePanel === 'explorer' && <FileTree />}
              {activePanel === 'search' && <SearchPanel />}
              {activePanel === 'git' && <GitPanel />}
              {activePanel === 'extensions' && <ExtensionPanel />}
              {activePanel === 'copilot' && <AICopilot />}
              {activePanel === 'settings' && <SettingsPanel />}
            </div>

            {/* Sidebar resize handler */}
            <div 
              onMouseDown={(e) => {
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const newWidth = Math.max(180, Math.min(500, moveEvent.clientX - 56));
                  setSidebarWidth(newWidth);
                };
                const handleMouseUp = () => {
                  window.removeEventListener('mousemove', handleMouseMove);
                  window.removeEventListener('mouseup', handleMouseUp);
                };
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
              }}
              className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-indigo-500/40 transition select-none z-10"
            />
          </div>
        )}

        {/* Central Editor and Drawer Split Row */}
        <div className="flex-grow flex flex-col min-w-0">
          
          {/* Editor and Preview Split Container */}
          <div className="flex-1 flex min-h-0 relative">
            
            {/* Editor Container with Tabs */}
            <div className="flex-1 flex flex-col min-h-0 relative bg-black/10">
              
              {/* Tabs Header bar */}
              <div className={`flex items-center justify-between border-b ${colors.border} bg-black/15 select-none shrink-0 h-10`}>
                <div className="flex items-center overflow-x-auto scrollbar-none h-full flex-grow">
                  {tabs.map(tabPath => {
                    const isSelected = activeFilePath === tabPath;
                    return (
                      <div
                        key={tabPath}
                        onClick={() => setActiveFilePath(tabPath)}
                        className={`flex items-center gap-2 px-4 h-full border-r ${colors.border} text-xs font-mono transition cursor-pointer shrink-0 ${
                          isSelected 
                            ? 'bg-slate-900/40 text-indigo-400 font-semibold border-b-2 border-b-indigo-500' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                        id={`tab-desktop-${tabPath.replace(/[^a-zA-Z0-9]/g, '-')}`}
                      >
                        <span>{tabPath.split('/').pop() || tabPath}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); closeTab(tabPath); }}
                          className="p-0.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-red-400 cursor-pointer"
                          id={`btn-close-tab-${tabPath.replace(/[^a-zA-Z0-9]/g, '-')}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}

                  {tabs.length === 0 && (
                    <div className="text-xs text-white/30 px-5 italic">
                      Select a file from the explorer to open in editor
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mr-2 shrink-0">
                  {/* Run Code Action */}
                  {activeFile && (
                    <button
                      onClick={runActiveFile}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/35 transition cursor-pointer"
                      title={`Run ${activeFile.name} in virtual bash terminal`}
                      id="btn-run-code-desktop"
                    >
                      <Play className="w-3.5 h-3.5 fill-emerald-500/10" />
                      <span>Run Code</span>
                    </button>
                  )}

                  {/* Live Preview Toggle Action */}
                  <button
                    onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                    className={`flex items-center gap-1 px-3 py-1 text-xs rounded transition cursor-pointer ${
                      isPreviewOpen 
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                        : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                    }`}
                    title="Toggle Live Preview Pane"
                    id="btn-toggle-live-preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isPreviewOpen ? 'Hide Preview' : 'Show Preview'}</span>
                  </button>
                </div>
              </div>

              {/* Code editor wrapper or Empty greeting layout */}
              <div className="flex-grow min-h-0 relative">
                {activeFile ? (
                  <Editor
                    height="100%"
                    language={activeFile.language}
                    value={activeFile.content}
                    theme={theme === 'light' ? 'light' : 'vs-dark'}
                    onChange={handleEditorChange}
                    options={{
                      fontSize: settings.fontSize,
                      lineHeight: settings.lineHeight * settings.fontSize,
                      fontFamily: settings.fontFamily,
                      wordWrap: settings.wordWrap,
                      minimap: { enabled: true },
                      automaticLayout: true,
                      tabSize: 2,
                      scrollbar: {
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10
                      }
                    }}
                    loading={
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-[#121214]">
                        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                        <span className="text-xs text-white/40 uppercase tracking-widest font-mono">Initializing Monaco...</span>
                      </div>
                    }
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3.5 select-none">
                    <Cpu className="w-16 h-16 text-indigo-500/40 animate-pulse" />
                    <div>
                      <h3 className="font-bold text-lg text-white">No Open Files</h3>
                      <p className="text-xs text-white/40 max-w-sm mt-1 leading-relaxed">
                        Select any asset file from the Workspace sidebar explorer to view, edit, and audit source code syntax.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Preview Pane on the Right */}
            {isPreviewOpen && (
              <div 
                style={{ width: `${previewWidth}px` }}
                className="shrink-0 h-full border-l border-white/10 relative flex flex-col min-w-[250px]"
                id="right-live-preview-container"
              >
                <LivePreview />
                {/* Horizontal Resizer handle */}
                <div 
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const newWidth = Math.max(250, Math.min(800, window.innerWidth - moveEvent.clientX));
                      setPreviewWidth(newWidth);
                    };
                    const handleMouseUp = () => {
                      window.removeEventListener('mousemove', handleMouseMove);
                      window.removeEventListener('mouseup', handleMouseUp);
                    };
                    window.addEventListener('mousemove', handleMouseMove);
                    window.addEventListener('mouseup', handleMouseUp);
                  }}
                  className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize hover:bg-indigo-500/40 transition select-none z-10"
                />
              </div>
            )}

          </div>

          {/* Collapsible Bottom Drawer */}
          <div className={`shrink-0 flex flex-col border-t ${colors.border} bg-slate-950/60 ${isBottomOpen ? 'h-[280px]' : 'h-10'} overflow-hidden transition-all duration-300`}>
            
            {/* Drawer Tabs Header */}
            <div className="flex items-center justify-between px-4 h-10 border-b border-white/5 select-none shrink-0">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-semibold">
                <button
                  onClick={() => { setActiveBottomTab('terminal'); setIsBottomOpen(true); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${activeBottomTab === 'terminal' && isBottomOpen ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
                  id="tab-bottom-terminal"
                >
                  <Terminal className="w-4 h-4" />
                  Terminal
                </button>
                <button
                  onClick={() => { setActiveBottomTab('output'); setIsBottomOpen(true); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${activeBottomTab === 'output' && isBottomOpen ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
                  id="tab-bottom-output"
                >
                  <TerminalSquare className="w-4 h-4" />
                  Console Output
                </button>
                <button
                  onClick={() => { setActiveBottomTab('problems'); setIsBottomOpen(true); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer ${activeBottomTab === 'problems' && isBottomOpen ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:text-white'}`}
                  id="tab-bottom-problems"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Problems ({problems.length})
                </button>
              </div>

              {/* Toggle Minimize Button */}
              <button
                onClick={() => setIsBottomOpen(!isBottomOpen)}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                id="btn-toggle-bottom-drawer"
              >
                {isBottomOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>

            {/* Active Bottom Tab Body */}
            {isBottomOpen && (
              <div className="flex-1 min-h-0 bg-slate-950/80 p-3">
                {activeBottomTab === 'terminal' && <TerminalPanel />}
                {activeBottomTab === 'output' && (
                  <div className="font-mono text-xs text-white/70 h-full overflow-y-auto space-y-1.5 p-1 select-text scrollbar-thin" id="output-view">
                    <span className="text-white/30 block">[System Initialization Log] CodeVerse runtime listening on port 3000...</span>
                    <span>[Success] Loaded environment bindings from .env.example.</span>
                    <span>[Ready] Integrated Gemini models ready for AI sidechat proxy requests.</span>
                    <span className="text-emerald-400">[Ready] Virtual compiler listening on workspace events.</span>
                  </div>
                )}
                {activeBottomTab === 'problems' && (
                  <div className="space-y-2 h-full overflow-y-auto p-1 scrollbar-thin" id="problems-view">
                    {problems.map((prob, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-2 bg-white/5 border border-white/5 rounded-lg text-xs">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 text-white/90">
                            <span className="font-semibold">{prob.message}</span>
                            <span className="text-[10px] text-white/30 font-mono">({prob.file} : Line {prob.line})</span>
                          </div>
                          <span className="text-[10px] text-white/40 block mt-0.5 uppercase tracking-wide">Category: Accessibility Lint</span>
                        </div>
                      </div>
                    ))}
                    {problems.length === 0 && (
                      <div className="flex items-center justify-center h-full gap-2 text-emerald-400 select-none">
                        <CheckCircle2 className="w-5 h-5 animate-pulse" />
                        <span className="text-xs font-semibold uppercase tracking-wider">No problems detected! Source code is error-free.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
