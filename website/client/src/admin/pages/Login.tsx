import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { z } from 'zod';
import { api, ApiError } from '../../lib/api';

const schema = z.object({
  email: z.email('Enter your email address'),
  password: z.string().min(1, 'Enter your password'),
});
type Values = z.infer<typeof schema>;

export default function Login() {
  const [params] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await api.post('/api/admin/auth/login', values);
      const next = params.get('next') ?? '/admin';
      // Only ever return to a dashboard path, never an arbitrary URL.
      window.location.assign(next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign-in failed. Please try again.');
    }
  });

  const input = 'w-full rounded-lg border border-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/15';

  return (
    <div className="grid min-h-[100svh] place-items-center bg-navy px-4 py-12">
      <title>Sign in | Arizen Polymers CMS</title>
      <meta name="robots" content="noindex, nofollow" />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center text-white">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-white/10">
            <Lock className="h-5 w-5 text-cyan" aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Arizen Polymers CMS</h1>
          <p className="mt-1 text-sm text-silver/60">Sign in to manage the website.</p>
        </div>
        <form onSubmit={onSubmit} noValidate className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input id="email" type="email" autoComplete="username" className={input} aria-invalid={formState.errors.email ? true : undefined} {...register('email')} />
              {formState.errors.email && <p className="mt-1.5 text-xs text-danger">{formState.errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Password
              </label>
              <input id="password" type="password" autoComplete="current-password" className={input} aria-invalid={formState.errors.password ? true : undefined} {...register('password')} />
              {formState.errors.password && <p className="mt-1.5 text-xs text-danger">{formState.errors.password.message}</p>}
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-5 rounded-lg bg-danger/5 px-3 py-2.5 text-sm text-danger">
              {error}
            </p>
          )}
          <button type="submit" disabled={formState.isSubmitting} className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-navy text-sm font-semibold text-white hover:bg-blue disabled:opacity-60">
            {formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-silver/65">Authorised Arizen staff only. Sign-in attempts are rate limited.</p>
      </div>
    </div>
  );
}
