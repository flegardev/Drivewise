import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import clsx from 'clsx';

const navItems = [
  { to: '/',             label: 'Pregled',          code: 'PR' },
  { to: '/users',        label: 'Uporabniki',       code: 'UP' },
  { to: '/trips',        label: 'Vožnje',           code: 'VO' },
  { to: '/report',       label: 'Poročilo',         code: 'PO' },
  { to: '/risk-map',     label: 'Tvegana karta',    code: 'TK' },
  { to: '/traffic',      label: 'Promet',           code: 'PM' },
  { to: '/roads',        label: 'Cestni podatki',   code: 'CP' },
  { to: '/data-sources', label: 'Podatkovni viri',  code: 'PV' },
  { to: '/simulation',   label: 'Simulacija',       code: 'SI' },
];

export default function Layout() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden md:h-screen md:flex-row">
      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col border-b border-surface-600 bg-surface-800/95 md:w-64 md:border-b-0 md:border-r">
        <div className="border-b border-surface-600 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-500/40 bg-brand-500/15 text-sm font-bold text-brand-400">
              DW
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight text-white">DriveWise</span>
              <div className="mt-0.5 text-xs text-surface-400">Telematics Admin</div>
            </div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:gap-1 md:overflow-y-auto md:px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-brand-500/12 text-white ring-1 ring-brand-500/25'
                    : 'text-surface-300 hover:bg-surface-700/70 hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={clsx(
                      'flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold',
                      isActive ? 'bg-brand-500 text-white' : 'bg-surface-700 text-surface-300',
                    )}
                  >
                    {item.code}
                  </span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t border-surface-600 px-5 py-4 text-xs text-surface-400 md:block">
          <div className="mb-1 font-medium text-surface-300">{user?.name ?? 'Local demo'}</div>
          <div className="mb-3 truncate">{user?.email}</div>
          <button type="button" onClick={handleLogout} className="rounded-lg border border-surface-600 px-3 py-1.5 text-surface-300 transition-colors hover:border-surface-500 hover:text-white">
            Odjava
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-surface-900">
        <Outlet />
      </main>
    </div>
  );
}
