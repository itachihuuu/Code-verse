import React, { useState, useRef } from 'react';
import { useIDEStore, VFSFile } from '../../store/ideStore';
import { Folder, File, Plus, FolderPlus, Trash2, Edit2, Upload, Download, FileArchive, MoreVertical, Play } from 'lucide-react';

export default function FileTree() {
  const { 
    files, 
    activeFilePath, 
    setActiveFilePath, 
    createFile, 
    createFolder, 
    deleteItem, 
    renameItem,
    importZip,
    exportZip
  } = useIDEStore();

  const [newItemType, setNewItemType] = useState<'file' | 'folder' | null>(null);
  const [newItemParentPath, setNewItemParentPath] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [activeDropdownPath, setActiveDropdownPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Group files into a hierarchical tree or render as single list with folders first
  const sortedFiles = [...files].sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.path.localeCompare(b.path);
  });

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const finalPath = newItemParentPath 
      ? `${newItemParentPath}/${newItemName.trim()}` 
      : newItemName.trim();

    if (newItemType === 'file') {
      createFile(finalPath);
    } else if (newItemType === 'folder') {
      createFolder(finalPath);
    }

    setNewItemName('');
    setNewItemType(null);
    setNewItemParentPath(null);
  };

  const handleStartRename = (file: VFSFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPath(file.path);
    setEditingName(file.path);
  };

  const handleRenameSubmit = (oldPath: string) => {
    if (editingName.trim() && editingName.trim() !== oldPath) {
      renameItem(oldPath, editingName.trim());
    }
    setEditingPath(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesUploaded = e.target.files;
    if (!filesUploaded) return;

    Array.from(filesUploaded).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string || '';
        createFile(file.name, content);
      };
      reader.readAsText(file);
    });
  };

  const handleZipImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await importZip(file);
      } catch (err) {
        alert("Failed to parse zip. Please upload a valid zip archive.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-inherit text-sm select-none" id="vfs-explorer-panel">
      {/* Action Buttons */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
        <span className="font-semibold uppercase text-xs tracking-wider opacity-60">WORKSPACE FILES</span>
        <div className="flex items-center gap-1.5 text-white/70">
          <button 
            onClick={() => {
              setNewItemType('file');
              setNewItemParentPath(null);
            }} 
            className="p-1 rounded hover:bg-white/10 hover:text-white transition cursor-pointer" 
            title="New File"
            id="btn-create-file"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              setNewItemType('folder');
              setNewItemParentPath(null);
            }} 
            className="p-1 rounded hover:bg-white/10 hover:text-white transition cursor-pointer" 
            title="New Folder"
            id="btn-create-folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="p-1 rounded hover:bg-white/10 hover:text-white transition cursor-pointer" 
            title="Upload Files"
            id="btn-upload-file"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button 
            onClick={() => zipInputRef.current?.click()} 
            className="p-1 rounded hover:bg-white/10 hover:text-white transition cursor-pointer" 
            title="Import Project ZIP"
            id="btn-import-zip"
          >
            <FileArchive className="w-4 h-4" />
          </button>
          <button 
            onClick={exportZip} 
            className="p-1 rounded hover:bg-white/10 hover:text-white transition cursor-pointer" 
            title="Export Project ZIP"
            id="btn-export-zip"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        multiple 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={zipInputRef} 
        onChange={handleZipImport} 
        accept=".zip" 
        className="hidden" 
      />

      {/* Inline Item Creation Input */}
      {newItemType && (
        <form onSubmit={handleCreateItem} className="p-3 bg-white/5 border-b border-white/10 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-1.5 text-[10px] text-white/50">
            {newItemParentPath ? (
              <>
                <span>Adding inside:</span>
                <span className="font-mono font-semibold text-indigo-400 bg-white/5 px-1 rounded truncate max-w-[150px]" title={newItemParentPath}>{newItemParentPath}</span>
              </>
            ) : (
              <span>Adding inside root workspace</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {newItemType === 'file' ? <File className="w-4 h-4 text-indigo-400" /> : <Folder className="w-4 h-4 text-yellow-500" />}
            <input
              type="text"
              autoFocus
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setNewItemType(null);
                  setNewItemParentPath(null);
                }
              }}
              placeholder={newItemType === 'file' ? "filename.js" : "folder_name"}
              className="flex-1 bg-black/30 text-white border border-white/20 rounded px-1.5 py-0.5 text-xs outline-none focus:border-indigo-500 font-mono"
              id="input-new-item"
            />
          </div>
        </form>
      )}

      {/* Files Tree List */}
      <div className="flex-1 overflow-y-auto py-2 pr-1 scrollbar-thin">
        {sortedFiles.map(file => {
          const isActive = activeFilePath === file.path;
          const isEditing = editingPath === file.path;

          return (
            <div
              key={file.path}
              onClick={() => !file.isFolder && setActiveFilePath(file.path)}
              className={`group flex items-center justify-between px-3.5 py-1.5 rounded-md mx-1.5 transition cursor-pointer relative ${
                isActive && !file.isFolder ? 'bg-indigo-600/25 text-indigo-200 border-l-2 border-indigo-500' : 'hover:bg-white/5 text-white/80 hover:text-white'
              }`}
              id={`tree-item-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {file.isFolder ? (
                  <Folder className="w-4 h-4 text-yellow-500 shrink-0" />
                ) : (
                  <File className="w-4 h-4 text-indigo-400 shrink-0" />
                )}

                {isEditing ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleRenameSubmit(file.path)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(file.path)}
                    autoFocus
                    className="flex-1 bg-black/40 text-white border border-white/30 rounded px-1 text-xs outline-none"
                    id={`input-rename-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  />
                ) : (
                  <span className="truncate text-xs font-mono">{file.path}</span>
                )}
              </div>

              {/* 3-dot Menu */}
              {!isEditing && (
                <div className="relative shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdownPath(activeDropdownPath === file.path ? null : file.path);
                    }}
                    className={`p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer ${
                      activeDropdownPath === file.path ? 'bg-white/10 text-white' : 'hidden group-hover:block'
                    }`}
                    title="Menu Actions"
                    id={`btn-menu-${file.path.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown menu */}
                  {activeDropdownPath === file.path && (
                    <>
                      {/* Fixed full-screen backing shield overlay to close dropdown anywhere */}
                      <div 
                        className="fixed inset-0 z-40 cursor-default" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownPath(null);
                        }}
                      />
                      
                      <div 
                        className="absolute right-0 mt-1 w-48 rounded-md bg-[#1e293b] border border-white/10 shadow-2xl py-1 z-50 text-xs text-slate-200 divide-y divide-white/5 font-sans animate-in fade-in slide-in-from-top-1 duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {file.isFolder && (
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setNewItemType('file');
                                setNewItemParentPath(file.path);
                                setNewItemName('');
                                setActiveDropdownPath(null);
                              }}
                              className="flex items-center w-full px-3 py-1.5 text-left hover:bg-white/5 hover:text-indigo-400 transition cursor-pointer gap-2"
                            >
                              <Plus className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Create New File</span>
                            </button>
                            <button
                              onClick={() => {
                                setNewItemType('folder');
                                setNewItemParentPath(file.path);
                                setNewItemName('');
                                setActiveDropdownPath(null);
                              }}
                              className="flex items-center w-full px-3 py-1.5 text-left hover:bg-white/5 hover:text-yellow-400 transition cursor-pointer gap-2"
                            >
                              <FolderPlus className="w-3.5 h-3.5 text-yellow-500" />
                              <span>Create New Folder</span>
                            </button>
                          </div>
                        )}

                        {!file.isFolder && (['javascript', 'python', 'html'].includes(file.language) || file.path.endsWith('.js') || file.path.endsWith('.py') || file.path.endsWith('.html')) && (
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setActiveDropdownPath(null);
                                setActiveFilePath(file.path);
                                // Run active code file!
                                setTimeout(() => {
                                  let command = '';
                                  if (file.language === 'javascript' || file.path.endsWith('.js')) {
                                    command = `node ${file.name}`;
                                  } else if (file.language === 'python' || file.path.endsWith('.py')) {
                                    command = `python ${file.name}`;
                                  } else {
                                    command = `cat ${file.name}`;
                                  }
                                  useIDEStore.getState().executeTerminalCommand(command);
                                }, 100);
                              }}
                              className="flex items-center w-full px-3 py-1.5 text-left hover:bg-emerald-600/25 hover:text-emerald-400 transition cursor-pointer gap-2"
                            >
                              <Play className="w-3.5 h-3.5 fill-emerald-500/10 text-emerald-400" />
                              <span>Run Code</span>
                            </button>
                          </div>
                        )}

                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              setActiveDropdownPath(null);
                              handleStartRename(file, e);
                            }}
                            className="flex items-center w-full px-3 py-1.5 text-left hover:bg-white/5 hover:text-indigo-400 transition cursor-pointer gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveDropdownPath(null);
                              if (confirm(`Are you sure you want to delete ${file.path}?`)) {
                                deleteItem(file.path);
                              }
                            }}
                            className="flex items-center w-full px-3 py-1.5 text-left hover:bg-red-900/30 hover:text-red-400 transition cursor-pointer gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {files.length === 0 && (
          <div className="p-8 text-center text-white/30 text-xs">
            No files in workspace.<br/>Use plus buttons to seed one.
          </div>
        )}
      </div>
    </div>
  );
}
