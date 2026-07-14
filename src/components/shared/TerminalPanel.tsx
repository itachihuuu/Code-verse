import React, { useState, useRef, useEffect } from 'react';
import { useIDEStore, TerminalLine } from '../../store/ideStore';
import { Terminal, Shield, Play, HelpCircle, RefreshCw } from 'lucide-react';

export default function TerminalPanel() {
  const { terminalLines, currentDir, executeTerminalCommand, clearTerminal } = useIDEStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeTerminalCommand(input);
    setInput('');
  };

  const getLineStyles = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-indigo-400 font-semibold';
      case 'error': return 'text-red-400 font-medium';
      case 'success': return 'text-emerald-400 font-semibold';
      case 'system': return 'text-indigo-300 opacity-80';
      default: return 'text-zinc-300';
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const presetChips = [
    { label: 'help', cmd: 'help' },
    { label: 'ls', cmd: 'ls' },
    { label: 'node script.js', cmd: 'node script.js' },
    { label: 'python app.py', cmd: 'python app.py' },
    { label: 'git status', cmd: 'git status' },
  ];

  return (
    <div 
      className="flex flex-col h-full bg-slate-950 font-mono text-xs text-zinc-300 p-3 select-text select-none cursor-text select-all"
      onClick={handleContainerClick}
      id="terminal-panel"
    >
      {/* Upper bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 shrink-0 select-none">
        <div className="flex items-center gap-2 text-indigo-400">
          <Terminal className="w-4 h-4" />
          <span className="font-semibold text-xs tracking-wide">SANDBOXED VIRTUAL TERMINAL</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/40">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-indigo-500" /> Secure Environment</span>
          <button 
            onClick={(e) => { e.stopPropagation(); clearTerminal(); }} 
            className="text-indigo-400 hover:underline cursor-pointer"
          >
            Clear Screen
          </button>
        </div>
      </div>

      {/* Suggested Quick command chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5 select-none shrink-0">
        <span className="text-[10px] text-white/30 mr-1 flex items-center gap-0.5">
          <HelpCircle className="w-3 h-3" /> Quick Commands:
        </span>
        {presetChips.map(chip => (
          <button
            key={chip.label}
            onClick={(e) => { e.stopPropagation(); executeTerminalCommand(chip.cmd); }}
            className="px-2 py-0.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 text-[10px] text-zinc-400 hover:text-white transition cursor-pointer font-mono"
            id={`chip-terminal-${chip.label.replace(/\s+/g, '-')}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Logs print area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin select-all">
        {terminalLines.map((line, idx) => (
          <div 
            key={idx} 
            className={`whitespace-pre-wrap leading-relaxed ${getLineStyles(line.type)}`}
            id={`term-line-${idx}`}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Inputs box line footer */}
      <form onSubmit={handleSubmit} className="flex items-center gap-1 pt-2 border-t border-white/5 mt-2 shrink-0 select-none">
        <span className="text-emerald-400 font-bold shrink-0">codeverse@vps:{currentDir}$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs focus:ring-0 p-0"
          autoFocus
          placeholder="Type command here..."
          id="terminal-interactive-input"
        />
      </form>
    </div>
  );
}
