import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import JSZip from 'jszip';

export interface VFSFile {
  path: string;
  name: string;
  content: string;
  language: string;
  isFolder: boolean;
}

export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface GitState {
  isRepo: boolean;
  currentBranch: string;
  branches: string[];
  staged: string[];
  modified: string[];
  commits: Commit[];
}

export interface IDEExtension {
  id: string;
  name: string;
  description: string;
  category: 'theme' | 'icons' | 'ai' | 'language' | 'tool';
  installed: boolean;
  rating: number;
  downloads: string;
  author: string;
}

export interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
}

interface IDEState {
  files: VFSFile[];
  activeFilePath: string | null;
  tabs: string[];
  theme: string;
  activeWorkspaceMode: 'desktop' | 'mobile';
  showCommandPalette: boolean;
  terminalLines: TerminalLine[];
  currentDir: string;
  git: GitState;
  extensions: IDEExtension[];
  user: { name: string; email: string; avatar: string } | null;
  token: string | null;
  settings: {
    fontSize: number;
    fontFamily: string;
    lineHeight: number;
    autosave: boolean;
    wordWrap: 'on' | 'off';
  };
  problems: { file: string; line: number; message: string; severity: 'error' | 'warning' }[];
  
  // Actions
  setFiles: (files: VFSFile[]) => void;
  createFile: (path: string, content?: string) => void;
  createFolder: (path: string) => void;
  deleteItem: (path: string) => void;
  renameItem: (oldPath: string, newPath: string) => void;
  updateFileContent: (path: string, content: string) => void;
  setActiveFilePath: (path: string | null) => void;
  openTab: (path: string) => void;
  closeTab: (path: string) => void;
  setWorkspaceMode: (mode: 'desktop' | 'mobile') => void;
  toggleCommandPalette: (show?: boolean) => void;
  setTheme: (theme: string) => void;
  addTerminalLine: (line: TerminalLine) => void;
  clearTerminal: () => void;
  executeTerminalCommand: (command: string) => void;
  updateSettings: (settings: Partial<IDEState['settings']>) => void;
  
  // Git Actions
  gitInit: () => void;
  gitAdd: (path: string) => void;
  gitRemoveStage: (path: string) => void;
  gitCommit: (message: string) => void;
  gitBranch: (name: string) => void;
  gitCheckout: (name: string) => void;
  gitClone: (url: string) => void;

  // Extension Actions
  toggleExtension: (id: string) => void;

  // Auth Actions
  loginUser: (user: { name: string; email: string; avatar: string }, token: string) => void;
  logoutUser: () => void;

  // Zip actions
  importZip: (file: File) => Promise<void>;
  exportZip: () => Promise<void>;
}

// Initial Virtual Files to seed the browser IDE
const initialFiles: VFSFile[] = [
  {
    path: 'index.html',
    name: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to CodeVerse</title>
  <style>
    body {
      background: linear-gradient(135deg, #1e1e38 0%, #0c0c14 100%);
      color: #e2e8f0;
      font-family: 'Inter', system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
    }
    h1 {
      font-size: 3rem;
      background: linear-gradient(to right, #6366f1, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 1rem;
    }
    p {
      color: #94a3b8;
      font-size: 1.2rem;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 2rem;
      border-radius: 1rem;
      margin-top: 2rem;
      max-width: 500px;
    }
    .badge {
      background: #4338ca;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.8rem;
    }
  </style>
</head>
<body>
  <h1>CodeVerse IDE</h1>
  <p>The Ultimate Browser Code Editor for Mobile & Desktop</p>
  
  <div class="card">
    <h3>🚀 Instant Live Preview</h3>
    <p>Edit index.html or scripts and see real-time updates instantly on your screen.</p>
    <span class="badge" id="clock-badge">Loading local time...</span>
  </div>

  <script src="script.js"></script>
</body>
</html>`,
    language: 'html',
    isFolder: false,
  },
  {
    path: 'script.js',
    name: 'script.js',
    content: `// Live Clock Interaction in CodeVerse IDE
console.log("Welcome to CodeVerse IDE execution environment!");

function updateClock() {
  const clockElement = document.getElementById('clock-badge');
  if (clockElement) {
    const now = new Date();
    clockElement.innerText = "Time: " + now.toLocaleTimeString();
  }
}

// Start local timer
setInterval(updateClock, 1000);
updateClock();
`,
    language: 'javascript',
    isFolder: false,
  },
  {
    path: 'app.py',
    name: 'app.py',
    content: `# Simulated Python computation script
import math

def calculate_fibonacci(n):
    print(f"Calculating Fibonacci series up to index {n}...")
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

result = calculate_fibonacci(10)
print("Fibonacci sequence completed!")
print("Result:", result)
`,
    language: 'python',
    isFolder: false,
  },
  {
    path: 'README.md',
    name: 'README.md',
    content: `# 🚀 Welcome to CodeVerse IDE

CodeVerse is a production-grade, highly-interactive full-stack browser-based IDE optimized for both desktop and mobile layouts.

## 🛠️ Features

- **Full-Stack Workspace**: Toggle seamlessly between Mobile and Desktop workspaces using the prominent workspace selector at the top toolbar.
- **Interactive Bash Terminal**: Execute virtual commands to manage your codebase. Run javascript files via \`node script.js\` or python files via \`python app.py\`.
- **Git Integration**: Full Source Control workspace supporting \`git init\`, \`git add\`, \`git commit\`, and \`git log\`.
- **Extension Marketplace**: Install themes (Nord, Cyberpunk, Monokai) and utilities which directly adjust the workspace style.
- **AI Copilot (Gemini-Powered)**: Integrated side-panel companion to assist with coding, debugging, refactoring, and code review.
- **Camera OCR code-scanner**: Exclusive mobile layout feature! Click the OCR camera scan button, capture printed/written code, and let Gemini extract it directly into your active editor tab.

## 💻 Sandbox Bash Command List

Open the Terminal panel and try executing:
- \`help\` - list all available interactive utilities
- \`ls\` - inspect active virtual directory
- \`cat index.html\` - read file content
- \`node script.js\` - execute real JavaScript sandbox runtime
- \`python app.py\` - execute python script
- \`npm install express\` - simulate NPM package resolution
- \`git init\` & \`git status\` - initiate source control version tree

Enjoy your desktop-class coding experience anywhere in the CodeVerse!
`,
    language: 'markdown',
    isFolder: false,
  },
];

const initialExtensions: IDEExtension[] = [
  { id: 'theme-dracula', name: 'Dracula Theme', description: 'A dark theme for many editors, shells, and more.', category: 'theme', installed: false, rating: 4.8, downloads: '12K', author: 'Dracula Team' },
  { id: 'theme-nord', name: 'Nordic slate', description: 'An arctic, north-bluish clean design theme.', category: 'theme', installed: false, rating: 4.6, downloads: '8.4K', author: 'Nord' },
  { id: 'theme-cyberpunk', name: 'Cyberpunk Neon', description: 'High contrast futuristic glowing synthwave look.', category: 'theme', installed: false, rating: 4.7, downloads: '9.2K', author: 'NeonDev' },
  { id: 'tool-gitlens', name: 'GitLens Lite', description: 'Supercharge Git within CodeVerse to visualize code authorship.', category: 'tool', installed: false, rating: 4.9, downloads: '15K', author: 'GitCrafter' },
  { id: 'ai-autocomplete', name: 'AI Autocompleter', description: 'Generates inline code suggestions as you type.', category: 'ai', installed: false, rating: 4.5, downloads: '22K', author: 'GeminiLabs' },
];

export const useIDEStore = create<IDEState>()(
  persist(
    (set, get) => ({
      files: initialFiles,
      activeFilePath: 'README.md',
      tabs: ['README.md', 'index.html'],
      theme: 'dark',
      activeWorkspaceMode: 'desktop',
      showCommandPalette: false,
      terminalLines: [
        { text: '=============================================', type: 'system' },
        { text: '     Welcome to CodeVerse IDE Virtual Bash    ', type: 'system' },
        { text: '  Type "help" to view a list of simulated commands. ', type: 'system' },
        { text: '=============================================', type: 'system' },
      ],
      currentDir: '~',
      git: {
        isRepo: false,
        currentBranch: 'main',
        branches: ['main'],
        staged: [],
        modified: [],
        commits: [],
      },
      extensions: initialExtensions,
      user: null,
      token: null,
      settings: {
        fontSize: 14,
        fontFamily: 'Fira Code',
        lineHeight: 1.5,
        autosave: true,
        wordWrap: 'on',
      },
      problems: [
        { file: 'index.html', line: 42, message: 'Consider adding alt attribute to images', severity: 'warning' }
      ],

      setFiles: (files) => set({ files }),

      createFile: (filePath, content = '') => {
        const files = [...get().files];
        if (files.some(f => f.path === filePath)) return;

        const name = filePath.split('/').pop() || filePath;
        const ext = name.split('.').pop() || '';
        let language = 'plaintext';
        if (['js', 'jsx'].includes(ext)) language = 'javascript';
        else if (['ts', 'tsx'].includes(ext)) language = 'typescript';
        else if (ext === 'html') language = 'html';
        else if (ext === 'css') language = 'css';
        else if (ext === 'py') language = 'python';
        else if (ext === 'md') language = 'markdown';
        else if (ext === 'json') language = 'json';

        const newFile: VFSFile = {
          path: filePath,
          name,
          content,
          language,
          isFolder: false,
        };

        set({
          files: [...files, newFile],
          activeFilePath: filePath,
        });
        get().openTab(filePath);

        // Update Git modified if in repo
        if (get().git.isRepo) {
          set(state => ({
            git: {
              ...state.git,
              modified: Array.from(new Set([...state.git.modified, filePath]))
            }
          }));
        }
      },

      createFolder: (folderPath) => {
        const files = [...get().files];
        if (files.some(f => f.path === folderPath)) return;

        const name = folderPath.split('/').pop() || folderPath;
        const newFolder: VFSFile = {
          path: folderPath,
          name,
          content: '',
          language: '',
          isFolder: true,
        };

        set({ files: [...files, newFolder] });
      },

      deleteItem: (path) => {
        const files = get().files.filter(f => !f.path.startsWith(path));
        const tabs = get().tabs.filter(t => !t.startsWith(path));
        let activeFilePath = get().activeFilePath;

        if (activeFilePath && activeFilePath.startsWith(path)) {
          activeFilePath = tabs.length > 0 ? tabs[0] : null;
        }

        set({ files, tabs, activeFilePath });

        // Update Git
        if (get().git.isRepo) {
          set(state => ({
            git: {
              ...state.git,
              staged: state.git.staged.filter(s => s !== path),
              modified: state.git.modified.filter(m => m !== path),
            }
          }));
        }
      },

      renameItem: (oldPath, newPath) => {
        const files = get().files.map(f => {
          if (f.path === oldPath) {
            const name = newPath.split('/').pop() || newPath;
            return { ...f, path: newPath, name };
          }
          if (f.path.startsWith(oldPath + '/')) {
            const relativePart = f.path.substring(oldPath.length);
            return { ...f, path: newPath + relativePart };
          }
          return f;
        });

        const tabs = get().tabs.map(t => {
          if (t === oldPath) return newPath;
          if (t.startsWith(oldPath + '/')) {
            const relativePart = t.substring(oldPath.length);
            return newPath + relativePart;
          }
          return t;
        });

        let activeFilePath = get().activeFilePath;
        if (activeFilePath === oldPath) activeFilePath = newPath;
        else if (activeFilePath?.startsWith(oldPath + '/')) {
          activeFilePath = newPath + activeFilePath.substring(oldPath.length);
        }

        set({ files, tabs, activeFilePath });
      },

      updateFileContent: (path, content) => {
        const files = get().files.map(f => f.path === path ? { ...f, content } : f);
        set({ files });

        // If Git repo is initialized, add to modified files list
        if (get().git.isRepo) {
          const isStaged = get().git.staged.includes(path);
          if (!isStaged) {
            set(state => ({
              git: {
                ...state.git,
                modified: Array.from(new Set([...state.git.modified, path]))
              }
            }));
          }
        }
      },

      setActiveFilePath: (path) => {
        if (path) {
          get().openTab(path);
        }
        set({ activeFilePath: path });
      },

      openTab: (path) => {
        const tabs = [...get().tabs];
        if (!tabs.includes(path)) {
          set({ tabs: [...tabs, path], activeFilePath: path });
        } else {
          set({ activeFilePath: path });
        }
      },

      closeTab: (path) => {
        const tabs = get().tabs.filter(t => t !== path);
        let activeFilePath = get().activeFilePath;
        if (activeFilePath === path) {
          activeFilePath = tabs.length > 0 ? tabs[tabs.length - 1] : null;
        }
        set({ tabs, activeFilePath });
      },

      setWorkspaceMode: (mode) => set({ activeWorkspaceMode: mode }),

      toggleCommandPalette: (show) => set(state => ({
        showCommandPalette: show !== undefined ? show : !state.showCommandPalette
      })),

      setTheme: (theme) => set({ theme }),

      addTerminalLine: (line) => set(state => ({
        terminalLines: [...state.terminalLines, line]
      })),

      clearTerminal: () => set({ terminalLines: [] }),

      executeTerminalCommand: (commandText) => {
        const trimmed = commandText.trim();
        if (!trimmed) return;

        // Add user command line to output
        get().addTerminalLine({ text: `codeverse@vps:${get().currentDir}$ ${trimmed}`, type: 'input' });

        const args = trimmed.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
          case 'clear':
            get().clearTerminal();
            break;
          case 'help':
            get().addTerminalLine({ text: 'Available simulated commands:', type: 'system' });
            get().addTerminalLine({ text: '  help              Show this menu', type: 'output' });
            get().addTerminalLine({ text: '  ls                List files in virtual workspace', type: 'output' });
            get().addTerminalLine({ text: '  cat <file>        Inspect file contents', type: 'output' });
            get().addTerminalLine({ text: '  node <file>       Safely execute a JavaScript file in sandbox', type: 'output' });
            get().addTerminalLine({ text: '  python <file>     Simulate/run Python code', type: 'output' });
            get().addTerminalLine({ text: '  npm install <pkg> Install simulated NPM packages', type: 'output' });
            get().addTerminalLine({ text: '  pip install <pkg> Install simulated python modules', type: 'output' });
            get().addTerminalLine({ text: '  git init          Initialize a clean git repository', type: 'output' });
            get().addTerminalLine({ text: '  git status        Display tracked/untracked git elements', type: 'output' });
            get().addTerminalLine({ text: '  git add <file>    Stage file changes', type: 'output' });
            get().addTerminalLine({ text: '  git commit -m     Create a git timeline commit node', type: 'output' });
            get().addTerminalLine({ text: '  git log           Print commit timeline graph', type: 'output' });
            break;

          case 'ls': {
            const workspaceFiles = get().files.filter(f => !f.isFolder);
            const folderLines = get().files.filter(f => f.isFolder).map(f => `📁 ${f.name}/`);
            const fileLines = workspaceFiles.map(f => `📄 ${f.name}   (${f.content.length} bytes)`);
            
            if (folderLines.length === 0 && fileLines.length === 0) {
              get().addTerminalLine({ text: 'Directory is empty.', type: 'output' });
            } else {
              [...folderLines, ...fileLines].forEach(line => {
                get().addTerminalLine({ text: line, type: 'output' });
              });
            }
            break;
          }

          case 'cat': {
            if (args.length < 2) {
              get().addTerminalLine({ text: 'Error: Missing argument. Usage: cat <file_name>', type: 'error' });
              break;
            }
            const file = get().files.find(f => f.name === args[1] && !f.isFolder);
            if (!file) {
              get().addTerminalLine({ text: `cat: ${args[1]}: No such file or folder`, type: 'error' });
            } else {
              file.content.split('\n').forEach(line => {
                get().addTerminalLine({ text: line, type: 'output' });
              });
            }
            break;
          }

          case 'node': {
            if (args.length < 2) {
              get().addTerminalLine({ text: 'Error: Usage: node <file_name.js>', type: 'error' });
              break;
            }
            const file = get().files.find(f => f.name === args[1]);
            if (!file) {
              get().addTerminalLine({ text: `node: ${args[1]}: File not found`, type: 'error' });
            } else if (file.language !== 'javascript') {
              get().addTerminalLine({ text: 'node: Can only execute JavaScript files (.js)', type: 'error' });
            } else {
              get().addTerminalLine({ text: 'Running sandboxed Node environment...', type: 'system' });
              try {
                // Intercept console.log inside eval safely
                const loggedLines: string[] = [];
                const customConsole = {
                  log: (...msg: any[]) => loggedLines.push(msg.map(m => typeof m === 'object' ? JSON.stringify(m) : m).join(' ')),
                  error: (...msg: any[]) => loggedLines.push(`[Error] ` + msg.join(' ')),
                  warn: (...msg: any[]) => loggedLines.push(`[Warn] ` + msg.join(' '))
                };

                const executeSandbox = new Function('console', file.content);
                executeSandbox(customConsole);

                if (loggedLines.length === 0) {
                  get().addTerminalLine({ text: 'Process finished with exit code 0 (No output produced).', type: 'success' });
                } else {
                  loggedLines.forEach(line => get().addTerminalLine({ text: line, type: 'output' }));
                  get().addTerminalLine({ text: 'Process completed successfully.', type: 'success' });
                }
              } catch (e: any) {
                get().addTerminalLine({ text: `Runtime Exception: ${e.message}`, type: 'error' });
              }
            }
            break;
          }

          case 'python': {
            if (args.length < 2) {
              get().addTerminalLine({ text: 'Error: Usage: python <file_name.py>', type: 'error' });
              break;
            }
            const file = get().files.find(f => f.name === args[1]);
            if (!file) {
              get().addTerminalLine({ text: `python: ${args[1]}: File not found`, type: 'error' });
            } else if (file.language !== 'python') {
              get().addTerminalLine({ text: 'python: Can only execute Python files (.py)', type: 'error' });
            } else {
              get().addTerminalLine({ text: 'Initializing virtual Python interpreter...', type: 'system' });
              
              // Standard simulated execution output for Python file
              setTimeout(() => {
                get().addTerminalLine({ text: '>>> Python 3.10.4 Execution Output:', type: 'system' });
                if (file.content.includes('def calculate_fibonacci')) {
                  get().addTerminalLine({ text: 'Calculating Fibonacci series up to index 10...', type: 'output' });
                  get().addTerminalLine({ text: 'Fibonacci sequence completed!', type: 'output' });
                  get().addTerminalLine({ text: 'Result: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]', type: 'success' });
                } else {
                  // Standard regex print simulation for simple python edits
                  const prints = file.content.match(/print\((['"])(.*?)\1\)/g);
                  if (prints) {
                    prints.forEach(p => {
                      const msg = p.replace(/print\(['"]/, '').replace(/['"]\)/, '');
                      get().addTerminalLine({ text: msg, type: 'output' });
                    });
                  } else {
                    get().addTerminalLine({ text: 'Code evaluated with zero console outputs.', type: 'success' });
                  }
                }
              }, 400);
            }
            break;
          }

          case 'npm': {
            if (args[1] === 'install') {
              const pkgName = args[2] || 'express';
              get().addTerminalLine({ text: `npm install ${pkgName} --save`, type: 'system' });
              get().addTerminalLine({ text: `⠋ Resolving packages for ${pkgName}...`, type: 'output' });
              
              setTimeout(() => {
                get().addTerminalLine({ text: `✔ Downloaded dependency tree for ${pkgName}.`, type: 'output' });
                get().addTerminalLine({ text: `+ ${pkgName}@latest\nadded 14 packages in 1.48s`, type: 'success' });
                
                // Add to package.json
                const pkgJson = get().files.find(f => f.name === 'package.json');
                if (pkgJson) {
                  try {
                    const parsed = JSON.parse(pkgJson.content);
                    parsed.dependencies = { ...(parsed.dependencies || {}), [pkgName]: "^1.0.0" };
                    get().updateFileContent('package.json', JSON.stringify(parsed, null, 2));
                  } catch (e) {}
                } else {
                  // Create mock package.json
                  get().createFile('package.json', JSON.stringify({
                    name: "codeverse-sandbox",
                    dependencies: { [pkgName]: "^1.0.0" }
                  }, null, 2));
                }
              }, 1000);
            } else {
              get().addTerminalLine({ text: 'npm usage: npm install <package_name>', type: 'error' });
            }
            break;
          }

          case 'pip': {
            if (args[1] === 'install') {
              const pkgName = args[2] || 'requests';
              get().addTerminalLine({ text: `pip install ${pkgName}`, type: 'system' });
              get().addTerminalLine({ text: `Downloading ${pkgName}-3.1-py3-none-any.whl (142 kB)...`, type: 'output' });
              
              setTimeout(() => {
                get().addTerminalLine({ text: `Installing collected packages: ${pkgName}`, type: 'output' });
                get().addTerminalLine({ text: `Successfully installed ${pkgName}-3.1`, type: 'success' });
              }, 800);
            } else {
              get().addTerminalLine({ text: 'pip usage: pip install <module_name>', type: 'error' });
            }
            break;
          }

          case 'git': {
            const sub = args[1]?.toLowerCase();
            const git = get().git;

            if (sub === 'init') {
              get().gitInit();
              get().addTerminalLine({ text: 'Initialized empty Git repository in /workspace/.git/', type: 'success' });
            } else if (!git.isRepo) {
              get().addTerminalLine({ text: 'fatal: not a git repository (or any of the parent directories): .git', type: 'error' });
            } else {
              switch (sub) {
                case 'status':
                  get().addTerminalLine({ text: `On branch ${git.currentBranch}`, type: 'system' });
                  if (git.staged.length === 0 && git.modified.length === 0) {
                    get().addTerminalLine({ text: 'nothing to commit, working tree clean', type: 'success' });
                  } else {
                    if (git.staged.length > 0) {
                      get().addTerminalLine({ text: 'Changes to be committed:', type: 'success' });
                      git.staged.forEach(f => get().addTerminalLine({ text: `\tstaged:    ${f}`, type: 'success' }));
                    }
                    if (git.modified.length > 0) {
                      get().addTerminalLine({ text: 'Changes not staged for commit:', type: 'error' });
                      git.modified.forEach(f => get().addTerminalLine({ text: `\tmodified:  ${f}`, type: 'error' }));
                    }
                  }
                  break;

                case 'add': {
                  const target = args[2];
                  if (!target) {
                    get().addTerminalLine({ text: 'fatal: pathspec not provided to add', type: 'error' });
                  } else {
                    get().gitAdd(target);
                    get().addTerminalLine({ text: `Staged: ${target}`, type: 'success' });
                  }
                  break;
                }

                case 'commit': {
                  // Extract message inside quotes
                  const msgIndex = trimmed.indexOf('-m "');
                  if (msgIndex === -1) {
                    get().addTerminalLine({ text: 'Error: Git commit requires a message. Usage: git commit -m "your message"', type: 'error' });
                  } else {
                    const msg = trimmed.substring(msgIndex + 4, trimmed.length - 1);
                    get().gitCommit(msg);
                    get().addTerminalLine({ text: `[${git.currentBranch} ${Math.random().toString(36).substring(2, 8)}] ${msg}`, type: 'success' });
                  }
                  break;
                }

                case 'log':
                  if (git.commits.length === 0) {
                    get().addTerminalLine({ text: 'fatal: your current branch does not have any commits yet', type: 'error' });
                  } else {
                    git.commits.forEach(commit => {
                      get().addTerminalLine({ text: `commit ${commit.hash} (HEAD -> ${git.currentBranch})`, type: 'system' });
                      get().addTerminalLine({ text: `Author: ${commit.author}`, type: 'output' });
                      get().addTerminalLine({ text: `Date:   ${commit.date}`, type: 'output' });
                      get().addTerminalLine({ text: `\n    ${commit.message}\n`, type: 'output' });
                    });
                  }
                  break;

                default:
                  get().addTerminalLine({ text: `git: "${sub}" is not a recognized simulated git command.`, type: 'error' });
              }
            }
            break;
          }

          default:
            get().addTerminalLine({ text: `bash: ${cmd}: command not found. Type "help" for a list of available utilities.`, type: 'error' });
        }
      },

      updateSettings: (newSettings) => set(state => ({
        settings: { ...state.settings, ...newSettings }
      })),

      // Git functionality
      gitInit: () => set(state => {
        const modifiedList = state.files.filter(f => !f.isFolder).map(f => f.path);
        return {
          git: {
            isRepo: true,
            currentBranch: 'main',
            branches: ['main'],
            staged: [],
            modified: modifiedList,
            commits: [],
          }
        };
      }),

      gitAdd: (target) => set(state => {
        const isTargetMatch = (filePath: string) => target === '.' || filePath === target || filePath.startsWith(target + '/');
        
        const filesToStage = state.git.modified.filter(isTargetMatch);
        const staged = Array.from(new Set([...state.git.staged, ...filesToStage]));
        const modified = state.git.modified.filter(m => !filesToStage.includes(m));

        return {
          git: { ...state.git, staged, modified }
        };
      }),

      gitRemoveStage: (filePath) => set(state => {
        return {
          git: {
            ...state.git,
            staged: state.git.staged.filter(s => s !== filePath),
            modified: Array.from(new Set([...state.git.modified, filePath]))
          }
        };
      }),

      gitCommit: (message) => set(state => {
        if (state.git.staged.length === 0) return {};
        
        const hash = Math.random().toString(16).substring(2, 9) + Math.random().toString(16).substring(2, 9);
        const newCommit: Commit = {
          hash,
          message,
          author: state.user?.name || 'CodeVerse Developer',
          date: new Date().toUTCString(),
        };

        return {
          git: {
            ...state.git,
            staged: [],
            commits: [newCommit, ...state.git.commits]
          }
        };
      }),

      gitBranch: (name) => set(state => {
        if (state.git.branches.includes(name)) return {};
        return {
          git: {
            ...state.git,
            branches: [...state.git.branches, name]
          }
        };
      }),

      gitCheckout: (name) => set(state => {
        if (!state.git.branches.includes(name)) return {};
        return {
          git: {
            ...state.git,
            currentBranch: name
          }
        };
      }),

      gitClone: (url) => set(state => {
        const name = url.split('/').pop()?.replace('.git', '') || 'cloned-repo';
        return {
          git: {
            isRepo: true,
            currentBranch: 'main',
            branches: ['main'],
            staged: [],
            modified: [],
            commits: [{
              hash: 'a1b2c3d4',
              message: `Initial commit from ${name} clone`,
              author: 'OpenSource Maintainer',
              date: new Date().toUTCString()
            }],
          }
        };
      }),

      toggleExtension: (id) => set(state => {
        const extensions = state.extensions.map(ext => {
          if (ext.id === id) {
            const targetInstallState = !ext.installed;
            
            // Side effect: If theme is installed and activated, apply theme changes automatically
            if (ext.category === 'theme' && targetInstallState) {
              const themeName = id.replace('theme-', '');
              setTimeout(() => {
                get().setTheme(themeName);
              }, 100);
            }

            return { ...ext, installed: targetInstallState };
          }
          return ext;
        });
        return { extensions };
      }),

      loginUser: (user, token) => set({ user, token }),
      logoutUser: () => set({ user: null, token: null }),

      // Zip Compression Handlers
      importZip: async (file) => {
        try {
          const zip = await JSZip.loadAsync(file);
          const loadedFiles: VFSFile[] = [];

          const promises = Object.keys(zip.files).map(async (filename) => {
            const zipFile = zip.files[filename];
            if (zipFile.dir) {
              loadedFiles.push({
                path: filename.replace(/\/$/, ''),
                name: filename.split('/').filter(Boolean).pop() || filename,
                content: '',
                language: '',
                isFolder: true
              });
            } else {
              const content = await zipFile.async('text');
              const name = filename.split('/').pop() || filename;
              const ext = name.split('.').pop() || '';
              
              let language = 'plaintext';
              if (['js', 'jsx'].includes(ext)) language = 'javascript';
              else if (['ts', 'tsx'].includes(ext)) language = 'typescript';
              else if (ext === 'html') language = 'html';
              else if (ext === 'css') language = 'css';
              else if (ext === 'py') language = 'python';
              else if (ext === 'md') language = 'markdown';
              else if (ext === 'json') language = 'json';

              loadedFiles.push({
                path: filename,
                name,
                content,
                language,
                isFolder: false
              });
            }
          });

          await Promise.all(promises);
          
          if (loadedFiles.length > 0) {
            set({
              files: loadedFiles,
              activeFilePath: loadedFiles[0].isFolder ? null : loadedFiles[0].path,
              tabs: loadedFiles.filter(f => !f.isFolder).slice(0, 3).map(f => f.path)
            });
          }
        } catch (error) {
          console.error("ZIP import error: ", error);
          throw error;
        }
      },

      exportZip: async () => {
        try {
          const zip = new JSZip();
          const files = get().files;

          files.forEach(file => {
            if (file.isFolder) {
              zip.folder(file.path);
            } else {
              zip.file(file.path, file.content);
            }
          });

          const blob = await zip.generateAsync({ type: 'blob' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'codeverse-project.zip';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error("ZIP export error: ", error);
          throw error;
        }
      }
    }),
    {
      name: 'codeverse-ide-storage',
      partialize: (state) => ({
        files: state.files,
        activeFilePath: state.activeFilePath,
        tabs: state.tabs,
        theme: state.theme,
        activeWorkspaceMode: state.activeWorkspaceMode,
        settings: state.settings,
        git: state.git,
        extensions: state.extensions,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
