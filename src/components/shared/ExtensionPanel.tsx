import { useState } from 'react';
import { useIDEStore, IDEExtension } from '../../store/ideStore';
import { Search, Star, Download, Sparkles, Paintbrush, Monitor, Terminal, ShieldAlert } from 'lucide-react';

export default function ExtensionPanel() {
  const { extensions, toggleExtension } = useIDEStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredExtensions = extensions.filter(ext => {
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || ext.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: IDEExtension['category']) => {
    switch (category) {
      case 'theme': return <Paintbrush className="w-4 h-4 text-pink-400" />;
      case 'icons': return <Monitor className="w-4 h-4 text-blue-400" />;
      case 'ai': return <Sparkles className="w-4 h-4 text-purple-400" />;
      default: return <Terminal className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-inherit text-sm select-none" id="extensions-panel">
      {/* Header */}
      <div className="p-3 border-b border-white/10 bg-white/5">
        <span className="font-semibold uppercase text-xs tracking-wider opacity-60">EXTENSION MARKETPLACE</span>
      </div>

      {/* Search box */}
      <div className="p-3 border-b border-white/10 space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search marketplace extensions..."
            className="w-full bg-black/30 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-indigo-500"
            id="extensions-search-input"
          />
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-2.5" />
        </div>

        {/* Categories Tab Pill links */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
          {['all', 'theme', 'ai', 'tool'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full border transition shrink-0 cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-indigo-600 border-indigo-500 text-white font-semibold' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
              id={`extension-tab-${cat}`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {filteredExtensions.map(ext => (
          <div
            key={ext.id}
            className={`p-3 rounded-lg border transition ${
              ext.installed 
                ? 'bg-indigo-600/5 border-indigo-500/30' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
            id={`extension-card-${ext.id}`}
          >
            <div className="flex items-start gap-2.5 justify-between">
              <div className="flex gap-2 items-center">
                <div className="p-1.5 rounded-md bg-black/20 shrink-0">
                  {getCategoryIcon(ext.category)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs text-white truncate">{ext.name}</h4>
                  <p className="text-[10px] text-white/40">{ext.author}</p>
                </div>
              </div>

              {/* Install Action CTA Button */}
              <button
                onClick={() => toggleExtension(ext.id)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer transition ${
                  ext.installed
                    ? 'bg-red-950/40 text-red-400 hover:bg-red-900/50 border border-red-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                }`}
                id={`btn-install-${ext.id}`}
              >
                {ext.installed ? 'Disable' : 'Install'}
              </button>
            </div>

            <p className="text-xs text-white/70 mt-2.5 leading-relaxed">
              {ext.description}
            </p>

            {/* Ratings, downloads count metadata row */}
            <div className="flex items-center justify-between text-[10px] text-white/30 border-t border-white/5 mt-3 pt-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-white/60">{ext.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{ext.downloads} downloads</span>
              </div>
            </div>
          </div>
        ))}

        {filteredExtensions.length === 0 && (
          <div className="p-8 text-center text-white/30 text-xs">
            No marketplace extensions match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
