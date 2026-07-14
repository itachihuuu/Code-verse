import React, { useState } from 'react';
import { useIDEStore } from '../../store/ideStore';
import { Shield, Mail, Lock, User, Key, ChevronRight, Github, Chrome } from 'lucide-react';

export default function AuthPanel() {
  const { loginUser } = useIDEStore();
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGuestLogin = () => {
    loginUser({
      name: "Guest Developer",
      email: "guest@codeverse.io",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    }, "guest-token-session-codeverse");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const endpoint = activeTab === 'signin' ? '/api/auth/login' : '/api/auth/register';
    const payload = activeTab === 'signin' 
      ? { email, password } 
      : { email, name, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.token) {
        loginUser(data.user, data.token);
      } else {
        setErrorMsg(data.error || 'Authenticating failed. Check network endpoints.');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to authenticate against server-side Express.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-filter backdrop-blur-xl flex items-center justify-center p-4 select-none" id="auth-panel-overlay">
      <div className="w-full max-w-md bg-slate-900/40 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 text-slate-200">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl w-fit mx-auto">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-200 via-white to-purple-200 bg-clip-text text-transparent">
            Welcome to CodeVerse
          </h2>
          <p className="text-xs text-white/50">
            Sign in to synchronize your in-browser cloud workspace.
          </p>
        </div>

        {/* Errors indicator */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 text-xs text-center" id="auth-error-msg">
            {errorMsg}
          </div>
        )}

        {/* Tab Links */}
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-md cursor-pointer transition ${
              activeTab === 'signin' ? 'bg-indigo-600 text-white shadow' : 'text-white/40 hover:text-white'
            }`}
            id="tab-signin"
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-md cursor-pointer transition ${
              activeTab === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-white/40 hover:text-white'
            }`}
            id="tab-register"
          >
            Create Account
          </button>
        </div>

        {/* Forms body */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500"
                  id="auth-input-name"
                />
                <User className="w-4 h-4 text-white/30 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-white/40 block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@codeverse.io"
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                id="auth-input-email"
              />
              <Mail className="w-4 h-4 text-white/30 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-white/40 block">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/30 border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                id="auth-input-password"
              />
              <Lock className="w-4 h-4 text-white/30 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg py-3 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/10"
            id="btn-auth-submit"
          >
            {isLoading ? 'Processing...' : activeTab === 'signin' ? 'Sign In' : 'Create Account'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-[10px] text-white/20 uppercase font-mono tracking-widest">or continue with</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Social logins */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGuestLogin}
            className="p-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
            id="btn-social-chrome"
          >
            <Chrome className="w-4 h-4 text-red-400" />
            <span>Google</span>
          </button>
          <button
            onClick={handleGuestLogin}
            className="p-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
            id="btn-social-github"
          >
            <Github className="w-4 h-4 text-purple-400" />
            <span>GitHub</span>
          </button>
        </div>

        {/* Guest sign in bypass */}
        <div className="text-center">
          <button
            onClick={handleGuestLogin}
            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer transition"
            id="btn-auth-guest"
          >
            Proceed as Guest (Skip Authentication)
          </button>
        </div>
      </div>
    </div>
  );
}
