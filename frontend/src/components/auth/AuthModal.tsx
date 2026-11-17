import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginDemo } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    try {
      await loginDemo();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#111318] border border-white/10 p-6 flex flex-col shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#9297A2] hover:text-white rounded-lg bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#08090B] border border-[#FFD600]/40 p-2 mx-auto mb-3 flex items-center justify-center shadow-[0_0_20px_rgba(255,214,0,0.3)]">
            <Sparkles className="w-6 h-6 text-[#FFD600]" />
          </div>
          <h3 className="font-heading text-xl font-bold text-white">
            {isSignUp ? 'Create MINION AI Account' : 'Welcome to MINION AI'}
          </h3>
          <p className="text-xs text-[#9297A2] mt-1">Your Intelligence. Your Assistant. Your World.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs text-[#9297A2] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9297A2] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rolex Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#08090B] border border-white/10 focus:border-[#FFD600] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#9297A2] outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-[#9297A2] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9297A2] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#08090B] border border-white/10 focus:border-[#FFD600] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#9297A2] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#9297A2] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9297A2] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#08090B] border border-white/10 focus:border-[#FFD600] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#9297A2] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#FFD600] hover:bg-[#FFE033] text-[#08090B] font-semibold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono">
            <span className="bg-[#111318] px-2 text-[#9297A2]">Or Quick Test</span>
          </div>
        </div>

        {/* Demo Login Button */}
        <button
          onClick={handleDemo}
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-[#171A20] hover:bg-[#20242D] border border-white/10 hover:border-[#00D8FF]/40 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00D8FF]" />
          <span>Launch as Demo Rolex</span>
        </button>

        <div className="mt-4 text-center text-xs text-[#9297A2]">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-[#FFD600] font-medium hover:underline ml-1"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
