import { NavLink, Outlet } from 'react-router-dom';

import { ChefHat, LogOut, Moon, Sun } from 'lucide-react';

import { navItems } from '~/constants';
import { useAuthStore } from '~/stores/authStore';
import { useThemeStore } from '~/stores/themeStore';

export function Dashboard() {
  const { user, signOut } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div className="flex min-h-screen bg-surface-50 transition-colors duration-200">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-surface-200 bg-white shadow-card dark:bg-surface-100">
        <div className="flex items-center gap-3 border-b border-surface-200 px-5 py-4">
          <div className="flex items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-primary-700 p-2 shadow-md shadow-primary-500/20">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-surface-900">PricingApp</h1>
            <p className="text-xs text-surface-800/50">Gestão de custos</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-500/10 dark:text-primary-400'
                    : 'text-surface-800/60 hover:bg-surface-100 hover:text-surface-800 dark:hover:bg-surface-200'
                }`
              }
            >
              <item.icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-surface-200 p-3">
          <div className="mb-2 truncate px-3 text-xs text-surface-800/40">
            {user?.email}
          </div>
          <button
            onClick={toggleTheme}
            className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-800/60 transition-all hover:bg-surface-100 hover:text-surface-800 dark:hover:bg-surface-200"
          >
            {isDark ? (
              <Sun className="h-4.5 w-4.5" />
            ) : (
              <Moon className="h-4.5 w-4.5" />
            )}
            {isDark ? 'Modo Claro' : 'Modo Escuro'}
          </button>
          <button
            id="sidebar-signout"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger-500 transition-all hover:bg-danger-500/5"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sair
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
