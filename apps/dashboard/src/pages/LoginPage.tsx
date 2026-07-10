import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((s) => s.login);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      await fetchMe();
      navigate('/');
    } catch {
      setError('Napačni podatki za prijavo.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-500/40 bg-brand-500/15 text-sm font-bold text-brand-400">
            DW
          </div>
          <div className="mb-1 text-3xl font-bold tracking-tight text-white">DriveWise</div>
          <div className="text-sm text-surface-400">Admin nadzorna plošča</div>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-surface-300">E-pošta</label>
            <input
              id="email"
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-surface-500 bg-surface-700 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-surface-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="admin@drivewise.si"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-surface-300">Geslo</label>
            <input
              id="password"
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-surface-500 bg-surface-700 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-surface-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="admin1234"
              required
            />
          </div>
          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
          <button type="submit" className="btn-primary w-full justify-center py-2.5">
            Prijava
          </button>
        </form>
        <div className="mt-4 rounded-xl border border-surface-600 bg-surface-800/80 p-3 text-center text-xs text-surface-400">
          Demo prijava: <span className="text-surface-300">admin@drivewise.si</span> / <span className="text-surface-300">admin1234</span>
        </div>
      </div>
    </div>
  );
}
