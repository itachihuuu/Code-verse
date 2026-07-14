import React, { useState } from 'react';
import { useIDEStore } from '../../store/ideStore';
import { GitBranch, GitCommit, Play, Plus, RefreshCw, FolderGit, AlertCircle, History, Check } from 'lucide-react';

export default function GitPanel() {
  const { git, gitInit, gitAdd, gitRemoveStage, gitCommit, gitBranch, gitCheckout, gitClone } = useIDEStore();
  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [cloneUrl, setCloneUrl] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleInitRepo = () => {
    gitInit();
  };

  const handleCloneRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (cloneUrl.trim()) {
      gitClone(cloneUrl.trim());
      setCloneUrl('');
    }
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBranchName.trim()) {
      gitBranch(newBranchName.trim());
      gitCheckout(newBranchName.trim());
      setNewBranchName('');
    }
  };

  const handleCommit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    gitCommit(commitMessage.trim());
    setCommitMessage('');
  };

  if (!git.isRepo) {
    return (
      <div className="flex flex-col h-full bg-inherit text-sm p-4 select-none" id="git-init-panel">
        <div className="text-center space-y-4 py-8 max-w-xs mx-auto">
          <FolderGit className="w-12 h-12 text-indigo-400 mx-auto opacity-75" />
          <h3 className="font-semibold text-white">Source Control</h3>
          <p className="text-xs text-white/50 leading-relaxed">
            This workspace isn't tracked by Git yet. Track and version control your files directly inside CodeVerse.
          </p>
          <button
            onClick={handleInitRepo}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-md py-2.5 transition flex items-center justify-center gap-1.5 cursor-pointer"
            id="btn-git-init"
          >
            <GitBranch className="w-4 h-4" />
            Initialize Repository
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-white/30 text-[10px] uppercase font-mono">or clone</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleCloneRepo} className="space-y-2 text-left">
            <input
              type="text"
              value={cloneUrl}
              onChange={(e) => setCloneUrl(e.target.value)}
              placeholder="https://github.com/user/repo.git"
              className="w-full bg-black/30 border border-white/10 rounded-md py-1.5 px-3 text-xs text-white outline-none focus:border-indigo-500 font-mono"
              id="git-clone-input"
            />
            <button
              type="submit"
              className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-medium rounded-md py-2 transition cursor-pointer"
              id="btn-git-clone"
            >
              Clone Public Repo
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-inherit text-sm select-none" id="git-active-panel">
      {/* Title Header */}
      <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <span className="font-semibold uppercase text-xs tracking-wider opacity-60">SOURCE CONTROL</span>
        <div className="flex items-center gap-1.5 text-white/50">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1 rounded hover:bg-white/10 hover:text-white transition cursor-pointer ${showHistory ? 'text-indigo-400 bg-white/5' : ''}`}
            title="Toggle Git Commit History"
            id="btn-toggle-git-history"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showHistory ? (
        /* Git History panel view */
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-white/75 flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Commit Log
            </h4>
            <button 
              onClick={() => setShowHistory(false)} 
              className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
            >
              Back to files
            </button>
          </div>

          <div className="space-y-3 relative border-l border-white/10 pl-4 ml-2">
            {git.commits.map((commit, idx) => (
              <div key={commit.hash} className="relative space-y-1" id={`git-commit-${commit.hash}`}>
                {/* Visual node on timeline */}
                <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-900"></div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-xs text-indigo-300 font-semibold">{commit.hash}</span>
                  <span className="text-[9px] text-white/30">{new Date(commit.date).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-white/80 font-medium">{commit.message}</p>
                <p className="text-[10px] text-white/40">by {commit.author}</p>
              </div>
            ))}

            {git.commits.length === 0 && (
              <div className="py-6 text-center text-white/30 text-xs">
                No commits created yet. Stage files and commit below.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* standard Git Active panel view */
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Branch management */}
          <div className="space-y-2 bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 text-white/80">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium">Branch:</span>
              <select
                value={git.currentBranch}
                onChange={(e) => gitCheckout(e.target.value)}
                className="bg-black/40 text-xs border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-indigo-500 cursor-pointer"
                id="git-branch-select"
              >
                {git.branches.map(b => (
                  <option key={b} value={b} className="bg-slate-800">{b}</option>
                ))}
              </select>
            </div>

            {/* Create Branch Inline Form */}
            <form onSubmit={handleCreateBranch} className="flex gap-1.5 pt-1 border-t border-white/5 mt-1">
              <input
                type="text"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder="new-branch-name"
                className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-indigo-500 font-mono"
                id="git-new-branch-input"
              />
              <button
                type="submit"
                className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-medium rounded cursor-pointer"
                id="btn-git-new-branch"
              >
                Create
              </button>
            </form>
          </div>

          {/* Staged files */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-white/50 uppercase font-bold tracking-wider">
              <span>Staged Changes ({git.staged.length})</span>
            </div>
            <div className="space-y-1 bg-black/10 rounded-md p-1 min-h-[40px] border border-white/5">
              {git.staged.map(file => (
                <div
                  key={file}
                  onClick={() => gitRemoveStage(file)}
                  className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded hover:bg-white/5 group cursor-pointer text-indigo-200"
                  id={`git-staged-item-${file.replace(/[^a-zA-Z0-9]/g, '-')}`}
                >
                  <span className="truncate font-mono">{file}</span>
                  <Check className="w-3.5 h-3.5 text-indigo-400 group-hover:text-red-400 shrink-0" />
                </div>
              ))}
              {git.staged.length === 0 && (
                <div className="text-[10px] text-white/30 p-2.5 text-center italic">
                  No staged items. Click below to stage.
                </div>
              )}
            </div>
          </div>

          {/* Modified files */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-white/50 uppercase font-bold tracking-wider">
              <span>Modified Changes ({git.modified.length})</span>
              {git.modified.length > 0 && (
                <button
                  onClick={() => gitAdd('.')}
                  className="p-0.5 rounded hover:bg-white/10 text-indigo-400 font-bold text-[9px] uppercase cursor-pointer"
                  id="btn-git-stage-all"
                >
                  Stage All
                </button>
              )}
            </div>
            <div className="space-y-1 bg-black/10 rounded-md p-1 min-h-[40px] border border-white/5">
              {git.modified.map(file => (
                <div
                  key={file}
                  onClick={() => gitAdd(file)}
                  className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded hover:bg-white/5 group cursor-pointer text-red-200"
                  id={`git-modified-item-${file.replace(/[^a-zA-Z0-9]/g, '-')}`}
                >
                  <span className="truncate font-mono">{file}</span>
                  <Plus className="w-3.5 h-3.5 text-red-400 group-hover:text-indigo-400 shrink-0" />
                </div>
              ))}
              {git.modified.length === 0 && (
                <div className="text-[10px] text-white/30 p-2.5 text-center italic">
                  Working directory clean.
                </div>
              )}
            </div>
          </div>

          {/* Commit inputs box */}
          {git.staged.length > 0 && (
            <form onSubmit={handleCommit} className="space-y-2 pt-2 bg-white/5 border border-white/10 rounded-lg p-3">
              <span className="text-[10px] text-white/50 block font-bold uppercase tracking-wider">Commit Changes</span>
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Commit message (e.g. Add landing section)"
                className="w-full bg-black/30 border border-white/10 rounded p-2 text-xs text-white outline-none focus:border-indigo-500 font-mono resize-none h-16"
                id="git-commit-message-input"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded py-2 transition flex items-center justify-center gap-1.5 cursor-pointer"
                id="btn-git-commit"
              >
                <GitCommit className="w-4 h-4" />
                Commit to {git.currentBranch}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
