import React, { useState } from 'react';
import { useIDEStore } from '../../store/ideStore';
import { Search, Replace, FileCode } from 'lucide-react';

interface SearchResult {
  filePath: string;
  line: number;
  lineText: string;
}

export default function SearchPanel() {
  const { files, updateFileContent, setActiveFilePath } = useIDEStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (!searchQuery) {
      setResults([]);
      return;
    }

    const matches: SearchResult[] = [];
    files.forEach(file => {
      if (file.isFolder) return;
      const lines = file.content.split('\n');
      lines.forEach((lineText, idx) => {
        if (lineText.toLowerCase().includes(searchQuery.toLowerCase())) {
          matches.push({
            filePath: file.path,
            line: idx + 1,
            lineText: lineText.trim()
          });
        }
      });
    });

    setResults(matches);
  };

  const handleReplaceAll = () => {
    if (!searchQuery) return;
    
    let replaceCount = 0;
    files.forEach(file => {
      if (file.isFolder) return;
      if (file.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        // Simple global case-insensitive replace simulated
        const regex = new RegExp(searchQuery, 'gi');
        const updated = file.content.replace(regex, replaceQuery);
        updateFileContent(file.path, updated);
        replaceCount++;
      }
    });

    alert(`Successfully replaced instances in ${replaceCount} file(s).`);
    // Re-trigger search to update lists
    const e = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(e);
  };

  return (
    <div className="flex flex-col h-full bg-inherit text-sm select-none" id="vfs-search-panel">
      <div className="p-3 border-b border-white/10 bg-white/5">
        <span className="font-semibold uppercase text-xs tracking-wider opacity-60">SEARCH & REPLACE</span>
      </div>

      <form onSubmit={handleSearch} className="p-4 space-y-3 border-b border-white/10">
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 block">Search Term</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-black/30 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-indigo-500"
              id="search-input"
            />
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-white/50 block">Replace Term</label>
          <div className="relative">
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="Replace with..."
              className="w-full bg-black/30 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-indigo-500"
              id="replace-input"
            />
            <Replace className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded py-1.5 transition cursor-pointer"
            id="btn-trigger-search"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReplaceAll}
            disabled={!searchQuery}
            className="flex-1 border border-white/20 hover:bg-white/5 text-white font-medium text-xs rounded py-1.5 transition disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
            id="btn-trigger-replace"
          >
            Replace All
          </button>
        </div>
      </form>

      {/* Results panel list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {hasSearched && results.length > 0 && (
          <span className="text-xs text-white/40 px-2.5 pb-2 block">
            Found {results.length} result(s):
          </span>
        )}

        {results.map((res, index) => (
          <div
            key={index}
            onClick={() => setActiveFilePath(res.filePath)}
            className="p-2 rounded-md hover:bg-white/5 border border-transparent hover:border-white/10 cursor-pointer transition text-xs flex gap-2.5 items-start"
            id={`search-result-${index}`}
          >
            <FileCode className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between text-[10px] text-white/40 font-mono mb-0.5">
                <span className="truncate">{res.filePath}</span>
                <span>Line {res.line}</span>
              </div>
              <p className="font-mono text-white/80 bg-black/25 rounded p-1 truncate text-[11px]">
                {res.lineText}
              </p>
            </div>
          </div>
        ))}

        {hasSearched && results.length === 0 && (
          <div className="p-8 text-center text-white/30 text-xs">
            No matches found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
