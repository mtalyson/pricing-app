import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChefHat, Store, ArrowRight, LogOut, Sparkles } from 'lucide-react';

import { useAuthStore } from '~/stores/authStore';
import { useRestaurantStore } from '~/stores/restaurantStore';

import {
  defaultOnboardingValues,
  onboardingSchema,
  type OnboardingFormValues,
} from './validation';

export function Onboarding() {
  const navigate = useNavigate();
  const { restaurants, create } = useRestaurantStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: defaultOnboardingValues,
  });

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // If user already has restaurants, skip onboarding
  if (restaurants.length > 0) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: OnboardingFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const restaurant = await create({ name: data.name });

    if (restaurant) {
      navigate('/', { replace: true });
    } else {
      setSubmitError(
        useRestaurantStore.getState().error ?? 'Erro ao criar restaurante',
      );
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary-950 via-primary-900 to-surface-950 p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-400/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-linear-to-br from-primary-500 to-primary-700 p-3 shadow-lg shadow-primary-500/25">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Bem-vindo ao Smart Pricing
          </h1>
          <p className="mt-2 text-sm text-primary-200/70">
            Para começar, crie o perfil do seu restaurante
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-modal backdrop-blur-xl">
          {/* Feature hints */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary-400/10 bg-primary-500/5 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary-400" />
            <div>
              <p className="text-sm font-medium text-primary-200">
                Seu espaço de trabalho
              </p>
              <p className="mt-1 text-xs text-primary-300/60">
                Todos os ingredientes, produtos e receitas serão organizados
                dentro do seu restaurante.
              </p>
            </div>
          </div>

          {submitError && (
            <div
              className="mb-4 rounded-lg border border-danger-500/20 bg-danger-500/10 p-3 text-sm text-danger-500"
              role="alert"
              id="onboarding-error"
            >
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="onboarding-name"
                className="mb-1.5 block text-sm font-medium text-primary-200/80"
              >
                Nome do restaurante
              </label>
              <div className="relative">
                <Store className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary-300/50" />
                <input
                  id="onboarding-name"
                  type="text"
                  placeholder="Ex: Hamburgueria do Chef"
                  {...register('name')}
                  ref={e => {
                    register('name').ref(e);
                    nameInputRef.current = e;
                  }}
                  className={`w-full rounded-xl border bg-white/5 py-2.5 pr-4 pl-10 text-white placeholder-primary-300/30 transition-colors focus:bg-white/10 focus:ring-0 focus:outline-none ${
                    errors.name
                      ? 'border-danger-500/50 focus:border-danger-500'
                      : 'border-white/10 focus:border-primary-400/50'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-danger-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <button
              id="onboarding-submit"
              type="submit"
              disabled={isSubmitting}
              className={`flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:from-primary-400 hover:to-primary-500 hover:shadow-xl hover:shadow-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50 ${
                isSubmitting ? 'cursor-progress' : 'cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Criar restaurante
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <button
          id="onboarding-signout"
          type="button"
          onClick={() => useAuthStore.getState().signOut()}
          className="mx-auto mt-2 flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-primary-300/50 transition-colors hover:text-primary-200"
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </button>
      </div>
    </div>
  );
}
