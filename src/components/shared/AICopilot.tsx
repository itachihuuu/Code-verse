import { useState, useRef, useEffect } from 'react';
import { useIDEStore } from '../../store/ideStore';
import { Sparkles, Send, Trash2, Code, Zap, AlertTriangle, ArrowRight } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AICopilot() {
  const { files, activeFilePath } = useIDEStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi! I'm CodeVerse Copilot, your expert AI coding partner. Select any workspace file and click an action card below, or ask me any technical question!" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeFile = files.find(f => f.path === activeFilePath && !f.isFolder);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || userInput;
    if (!textToSend.trim() || isGenerating) return;

    const updatedMessages = [...messages, { role: 'user', content: textToSend } as ChatMessage];
    setMessages(updatedMessages);
    if (!customText) setUserInput('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          contextFile: activeFile ? {
            name: activeFile.name,
            language: activeFile.language,
            content: activeFile.content
          } : null
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error || 'Unable to connect to AI server.'}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error: Failed to communicate with Gemini API on backend." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerQuickAction = (action: 'explain' | 'optimize' | 'bugs' | 'document') => {
    if (!activeFile) {
      alert("Please select a file from the explorer first to provide active context!");
      return;
    }

    let prompt = '';
    switch (action) {
      case 'explain':
        prompt = `Explain how the code in ${activeFile.name} works, what libraries it uses, and its overall architecture.`;
        break;
      case 'optimize':
        prompt = `Refactor the code in ${activeFile.name} to optimize performance, increase readability, and follow modern best practices. Show code snippets.`;
        break;
      case 'bugs':
        prompt = `Audit the code in ${activeFile.name} for any security bugs, memory leaks, unhandled exceptions, or potential fatal errors.`;
        break;
      case 'document':
        prompt = `Generate extensive doc comments and write explanatory documentation for ${activeFile.name}.`;
        break;
    }

    handleSendMessage(prompt);
  };

  const handleClearChat = () => {
    setMessages([
      { role: 'assistant', content: "Chat cleared. I'm ready to assist you with any coding questions or workspace tasks!" }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-inherit text-sm select-none" id="copilot-panel">
      {/* Title Panel */}
      <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">GEMINI AI COPILOT</span>
        </div>
        <button
          onClick={handleClearChat}
          className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-red-400 transition cursor-pointer"
          title="Clear Conversation"
          id="btn-clear-chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main chat window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* Helper Action Shortcuts cards */}
        {messages.length <= 1 && (
          <div className="space-y-2 pb-2">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Contextual Actions</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triggerQuickAction('explain')}
                className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-left hover:bg-white/10 hover:border-indigo-500/50 transition cursor-pointer"
                id="btn-action-explain"
              >
                <Code className="w-4 h-4 text-emerald-400 mb-1" />
                <h5 className="font-semibold text-xs text-white">Explain Code</h5>
                <p className="text-[9px] text-white/40 leading-tight">Deconstruct logic step by step</p>
              </button>

              <button
                onClick={() => triggerQuickAction('optimize')}
                className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-left hover:bg-white/10 hover:border-indigo-500/50 transition cursor-pointer"
                id="btn-action-optimize"
              >
                <Zap className="w-4 h-4 text-yellow-400 mb-1" />
                <h5 className="font-semibold text-xs text-white">Refactor Code</h5>
                <p className="text-[9px] text-white/40 leading-tight">Optimize and clean up bugs</p>
              </button>

              <button
                onClick={() => triggerQuickAction('bugs')}
                className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-left hover:bg-white/10 hover:border-indigo-500/50 transition cursor-pointer"
                id="btn-action-bugs"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 mb-1" />
                <h5 className="font-semibold text-xs text-white">Find Issues</h5>
                <p className="text-[9px] text-white/40 leading-tight">Audit security and variables</p>
              </button>

              <button
                onClick={() => triggerQuickAction('document')}
                className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-left hover:bg-white/10 hover:border-indigo-500/50 transition cursor-pointer"
                id="btn-action-document"
              >
                <ArrowRight className="w-4 h-4 text-indigo-400 mb-1" />
                <h5 className="font-semibold text-xs text-white">Document</h5>
                <p className="text-[9px] text-white/40 leading-tight">Generate inline doc descriptions</p>
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              id={`chat-msg-${index}`}
            >
              <span className="text-[9px] text-white/40 mb-1 font-mono uppercase tracking-wider">
                {isUser ? 'You' : 'Copilot Companion'}
              </span>
              <div
                className={`p-3 rounded-xl max-w-[90%] text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap ${
                  isUser 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none font-sans'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex flex-col items-start" id="chat-generating-indicator">
            <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-widest animate-pulse">
              Gemini Thinking...
            </span>
            <div className="p-3.5 rounded-xl rounded-tl-none bg-white/5 border border-white/10 text-xs text-white/40 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input textbox box footer */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="p-3 border-t border-white/10 bg-slate-950/40 shrink-0"
      >
        <div className="relative">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isGenerating}
            placeholder={activeFile ? `Ask about ${activeFile.name}...` : "Ask a coding question..."}
            className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-3.5 pr-11 text-xs text-white outline-none focus:border-indigo-500"
            id="copilot-input-box"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isGenerating}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md disabled:opacity-40 transition cursor-pointer"
            id="btn-copilot-send"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
