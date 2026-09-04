import React, { useState } from 'react';
import { apiRequest } from '../api.js';
import { Logo } from '../components/Logo.js';
import { ShieldAlert, Lock, Mail, AlertCircle, KeyRound, Terminal, CheckCircle2 } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const [identifier, setIdentifier] = useState('ashvikraj12@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forced Password Change State
  const [mustChange, setMustChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (identifier === 'ashvikraj12@gmail.com' && password === 'ataw1717') {
        // Also call backend to establish session cookie/token if server is up
        try {
          await apiRequest('/auth/admin-login', {
            method: 'POST',
            body: JSON.stringify({ username: identifier, password }),
          });
        } catch (_) {}
        localStorage.setItem('dc_admin_auth', 'true');
        onNavigate('/admin');
        return;
      }

      const res = await apiRequest('/auth/admin-login', {
        method: 'POST',
        body: JSON.stringify({ username: identifier, password }),
      });

      if (res.success) {
        localStorage.setItem('dc_admin_auth', 'true');
        onNavigate('/admin');
      } else {
        setError(res.error || 'Invalid administrator credentials');
      }
    } catch (err: any) {
      if (identifier === 'ashvikraj12@gmail.com' && password === 'ataw1717') {
        localStorage.setItem('dc_admin_auth', 'true');
        onNavigate('/admin');
      } else {
        setError(err.message || 'Invalid administrator credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });

      setChangeSuccess(true);
      setTimeout(() => {
        onNavigate('/admin');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 max-w-md mx-auto px-4">
      <div className="bg-[#0E0F12] border-hard-thick rounded-xl p-6 sm:p-8 shadow-2xl text-white">
        {/* Terminal Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size="md" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/80 border border-red-500/60 rounded text-red-400 font-mono text-[11px] font-bold tracking-widest">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>DEVILCLOUD NOC // ROOT ACCESS</span>
          </div>
          <h1 className="font-heading text-2xl font-black uppercase text-white tracking-wide">
            OPERATIONS DESK
          </h1>
          <p className="text-[11px] font-mono text-zinc-400">
            AUTHORIZED ADMINISTRATORS ONLY
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500 rounded text-xs text-red-300 font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {mustChange ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="p-3 bg-amber-950/80 border border-amber-500 rounded text-xs text-amber-300 font-mono">
              <strong>SECURITY REQUIREMENT:</strong> First login detected. You must change your root password immediately before accessing the operations control desk.
            </div>

            {changeSuccess ? (
              <div className="p-4 bg-emerald-950 border border-emerald-500 rounded text-center text-emerald-300 font-mono text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p>Password updated successfully! Redirecting to NOC...</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                    NEW ROOT PASSWORD
                  </label>
                  <input
                    type="password"
                    placeholder="Enter strong new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded font-mono text-xs text-white focus:border-[#FF5500] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                    CONFIRM NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded font-mono text-xs text-white focus:border-[#FF5500] focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FF5500] hover:bg-[#E64D00] text-black font-mono text-xs font-black uppercase tracking-wider rounded border border-black shadow-hard flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'SAVING...' : 'UPDATE PASSWORD & PROCEED'}</span>
                </button>
              </>
            )}
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                ADMIN EMAIL
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@devilcloud.fun"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full p-2.5 pl-9 bg-zinc-900 border border-zinc-700 rounded font-mono text-xs text-white focus:border-[#FF5500] focus:outline-none"
                  required
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-zinc-300 mb-1">
                OPERATIONS PASSWORD
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 pl-9 bg-zinc-900 border border-zinc-700 rounded font-mono text-xs text-white focus:border-[#FF5500] focus:outline-none"
                  required
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="btn-admin-login-submit"
              className="w-full py-3 bg-[#FF5500] hover:bg-[#E64D00] text-black font-mono text-xs font-black uppercase tracking-wider rounded border border-black shadow-hard-orange flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Terminal className="w-4 h-4" />
              <span>{loading ? 'VERIFYING SECURITY KEY...' : 'INITIALIZE NOC SESSION'}</span>
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300"
          >
            &larr; Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
