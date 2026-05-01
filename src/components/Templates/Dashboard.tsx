import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { ChevronsUpDown, Check, LogOut, Moon, Sun, Store } from 'lucide-react';

import { navItems } from '~/constants';
import { useAuthStore } from '~/stores/authStore';
import { useRestaurantStore } from '~/stores/restaurantStore';
import { useThemeStore } from '~/stores/themeStore';

export function Dashboard() {
  const { user, signOut } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { restaurants, currentRestaurant, currentRole, select } =
    useRestaurantStore();
  const [showSwitcher, setShowSwitcher] = useState(false);

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const roleLabels: Record<string, string> = {
    owner: 'Proprietário',
    manager: 'Gerente',
    staff: 'Funcionário',
  };

  return (
    <div className="flex min-h-screen bg-surface-50 transition-colors duration-200">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-surface-200 bg-white shadow-card dark:bg-surface-100">
        <div className="relative border-b border-surface-200 px-3 py-3">
          <button
            id="restaurant-switcher"
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-100 dark:hover:bg-surface-200"
          >
            <div className="flex items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-primary-700 p-2 shadow-md shadow-primary-500/20">
              <Store className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="truncate text-sm font-semibold text-surface-900">
                {currentRestaurant?.name ?? 'Restaurante'}
              </p>
              <p className="text-xs text-surface-800/50">
                {currentRole ? roleLabels[currentRole] : ''}
              </p>
            </div>
            {restaurants.length > 1 && (
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-surface-800/40" />
            )}
          </button>

          {showSwitcher && restaurants.length > 1 && (
            <>
              <div
                className="fixed inset-0 z-40"
                role="presentation"
                onClick={() => setShowSwitcher(false)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setShowSwitcher(false);
                }}
              />
              <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-xl border border-surface-200 bg-white py-1 shadow-lg dark:bg-surface-100">
                {restaurants.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      select(r);
                      setShowSwitcher(false);
                    }}
                    className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-200 ${
                      currentRestaurant?.id === r.id
                        ? 'text-primary-600 font-medium'
                        : 'text-surface-800'
                    }`}
                  >
                    <Store className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 truncate">{r.name}</span>
                    {currentRestaurant?.id === r.id && (
                      <Check className="h-4 w-4 shrink-0 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
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
            className="mb-1 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-surface-800/60 transition-all hover:bg-surface-100 hover:text-surface-800 dark:hover:bg-surface-200"
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
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger-500 transition-all hover:bg-danger-500/5"
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
