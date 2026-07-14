import { useState, useEffect } from 'react';
import { useIDEStore } from '../../store/ideStore';
import { RefreshCw, Play, Laptop, Smartphone, RotateCcw } from 'lucide-react';

export default function LivePreview() {
  const { files } = useIDEStore();
  const [srcDoc, setSrcDoc] = useState('');
  const [key, setKey] = useState(0); // For forcing iframe refreshes
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  const bundleCode = () => {
    const htmlFile = files.find(f => f.name === 'index.html' && !f.isFolder);
    const jsFile = files.find(f => f.name === 'script.js' && !f.isFolder);
    const cssFile = files.find(f => (f.name === 'styles.css' || f.name === 'style.css') && !f.isFolder);

    let html = htmlFile?.content || `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { background: #121214; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          div { text-align: center; }
          h2 { color: #818cf8; }
        </style>
      </head>
      <body>
        <div>
          <h2>CodeVerse Live Sandbox</h2>
          <p>Create or select <strong>index.html</strong> to see a live web preview of your page here!</p>
        </div>
      </body>
      </html>
    `;

    // Inject CSS
    if (cssFile && html.includes('</head>')) {
      html = html.replace('</head>', `<style>\n${cssFile.content}\n</style></head>`);
    } else if (cssFile) {
      html = `
        <style>\n${cssFile.content}\n</style>
        ${html}
      `;
    }

    // Inject JS (simulating modular loading or global script appending safely)
    if (jsFile && html.includes('</body>')) {
      html = html.replace('</body>', `<script>\n${jsFile.content}\n</script></body>`);
    } else if (jsFile) {
      html += `
        <script>\n${jsFile.content}\n</script>
      `;
    }

    setSrcDoc(html);
  };

  // Re-bundle when workspace files change
  useEffect(() => {
    bundleCode();
  }, [files]);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
    bundleCode();
  };

  return (
    <div className="flex flex-col h-full bg-[#18181b] border border-white/5 rounded-lg overflow-hidden select-none" id="live-preview-panel">
      
      {/* Upper header */}
      <div className="flex items-center justify-between p-2 bg-black/40 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <Play className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Live Sandbox Preview</span>
        </div>

        {/* View toggle & Refresh */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-white/5 rounded p-0.5 border border-white/10 mr-1 text-[10px]">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-1 px-2 rounded cursor-pointer transition flex items-center gap-1 ${deviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-white/40'}`}
              title="Desktop View"
              id="preview-mode-desktop"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-1 px-2 rounded cursor-pointer transition flex items-center gap-1 ${deviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-white/40'}`}
              title="Mobile View"
              id="preview-mode-mobile"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className="p-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white transition cursor-pointer"
            title="Force Rebuild Sandbox"
            id="btn-preview-refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame wrapper */}
      <div className="flex-1 flex items-center justify-center bg-[#0e0e11] p-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 rounded-lg shadow-2xl bg-white overflow-hidden ${
            deviceMode === 'mobile' ? 'w-[375px] max-w-full border-[10px] border-zinc-800 rounded-[2.5rem]' : 'w-full'
          }`}
          id="iframe-preview-container"
        >
          <iframe
            key={key}
            title="Live Workspace Preview Sandbox"
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className="w-full h-full border-none bg-white"
            id="workspace-preview-iframe"
          />
        </div>
      </div>
    </div>
  );
}
