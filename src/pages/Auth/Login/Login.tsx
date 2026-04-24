import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Mail, Lock, ChefHat } from 'lucide-react';

import { useAuthStore } from '~/stores/authStore';

import {
  defaultLoginValues,
  loginSchema,
  type LoginFormValues,
} from './validation';

export function Login() {
  const { user, signIn, loading, initialized, initialize, error, clearError } =
    useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
  });

  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    try {
      await signIn(data.email, data.password);
    } catch {
      // Error is handled in the store
    }
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary-950 via-primary-900 to-surface-950">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-primary-950 via-primary-900 to-surface-950 p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-linear-to-br from-primary-500 to-primary-700 p-3 shadow-lg shadow-primary-500/25">
            <ChefHat className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Smart Pricing App</h1>
          <p className="mt-1 text-sm text-primary-200/70">
            Gestão de custos e precificação
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-modal backdrop-blur-xl">
          <h2 className="mb-6 text-center text-xl font-semibold text-white">
            Entrar na sua conta
          </h2>

          {error && (
            <div
              className="mb-4 rounded-lg border border-danger-500/20 bg-danger-500/10 p-3 text-sm text-danger-500"
              role="alert"
              id="login-error"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-primary-200/80"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary-300/50" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                  className={`w-full rounded-xl border bg-white/5 py-2.5 pr-4 pl-10 text-white placeholder-primary-300/30 transition-colors focus:bg-white/10 focus:ring-0 focus:outline-none ${errors.email ? 'border-danger-500/50 focus:border-danger-500' : 'border-white/10 focus:border-primary-400/50'}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-danger-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-primary-200/80"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary-300/50" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`w-full rounded-xl border bg-white/5 py-2.5 pr-4 pl-10 text-white placeholder-primary-300/30 transition-colors focus:bg-white/10 focus:ring-0 focus:outline-none ${errors.password ? 'border-danger-500/50 focus:border-danger-500' : 'border-white/10 focus:border-primary-400/50'}`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-br from-primary-500 to-primary-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-primary-500/25 transition-all hover:from-primary-400 hover:to-primary-500 hover:shadow-xl hover:shadow-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50 ${
                loading ? 'cursor-progress' : 'cursor-pointer'
              }`}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-primary-200/50">
            Não tem conta?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-300 transition-colors hover:text-primary-200"
              id="login-register-link"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
