import { type ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthStore } from '~/stores/authStore';
import { useRestaurantStore } from '~/stores/restaurantStore';

interface RestaurantGuardProps {
  children: ReactNode;
}

export function RestaurantGuard({ children }: RestaurantGuardProps) {
  const { user } = useAuthStore();
  const { currentRestaurant, restaurants, fetch } = useRestaurantStore();
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (user && !hasFetched) {
      fetch().then(() => {
        // Only mark as fetched when loading is truly complete.
        // fetch() may return early if another fetch is in progress
        // (due to `if (get().loading) return`), which would leave
        // restaurants empty and cause a false redirect to onboarding.
        const state = useRestaurantStore.getState();
        if (!state.loading) {
          setHasFetched(true);
        }
      });
    }
  }, [user, hasFetched, fetch]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only block rendering during the INITIAL fetch.
  // Subsequent fetch() calls (e.g. from child pages) must NOT unmount children,
  // otherwise it causes an infinite remount → fetch → unmount loop.
  if (!hasFetched) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-600" />
          <p className="text-sm text-surface-800/60">
            Carregando restaurante...
          </p>
        </div>
      </div>
    );
  }

  // No restaurants — redirect to onboarding
  if (restaurants.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  // Has restaurants but none selected — select the first one
  if (!currentRestaurant && restaurants.length > 0) {
    // This shouldn't normally happen because fetch() auto-selects,
    // but handle it defensively
    useRestaurantStore.getState().select(restaurants[0]);
  }

  return <>{children}</>;
}
