import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useId, useRef, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { inquiryInput, type InquiryInput } from '@shared/schemas';
import { api, ApiError } from '../lib/api';
import { useSite } from '../lib/site';
import { easePremium } from './motion/Reveal';

interface Props {
  defaultProduct?: string;
  tone?: 'light' | 'dark';
  heading?: string;
}

interface FieldProps {
  name: keyof InquiryInput;
  labelText: string;
  children: ReactNode;
  error?: string;
  dark: boolean;
  required?: boolean;
  className?: string;
}

/** Floating-label field wrapper. Defined at module level so inputs keep focus across re-renders. */
function FormField({ name, labelText, children, error, dark, required = true, className = '' }: FieldProps) {
  const label = dark ? 'text-silver/60 peer-focus:text-cyan' : 'text-muted peer-focus:text-blue';
  return (
    <div className={className}>
      <div className="relative">
        {children}
        <label htmlFor={`inq-${name}`} className={`pointer-events-none absolute top-1.5 left-0 text-xs font-medium tracking-wide transition-colors ${label} ${error ? '!text-danger' : ''}`}>
          {labelText}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p id={`inq-${name}-error`} role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-2 flex items-center gap-1.5 text-xs ${dark ? 'text-[#ff9b8f]' : 'text-danger'}`}>
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const fieldBase =
  'peer w-full rounded-none border-0 border-b bg-transparent px-0 pt-6 pb-2.5 text-base outline-none transition-colors placeholder:text-transparent focus:ring-0';

export function InquiryForm({ defaultProduct = '', tone = 'light', heading }: Props) {
  const { products } = useSite();
  const startedAt = useRef(Date.now());
  const honeypotId = useId();
  const [reference, setReference] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const dark = tone === 'dark';

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquiryInput),
    mode: 'onTouched',
    defaultValues: { fullName: '', companyName: '', email: '', phone: '', product: products.some((p) => p.slug === defaultProduct) ? defaultProduct : '', quantity: '', message: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const website = (document.getElementById(honeypotId) as HTMLInputElement | null)?.value ?? '';
    try {
      const res = await api.post<{ reference: string }>('/api/inquiries', { ...values, website, elapsedMs: Date.now() - startedAt.current });
      setReference(res.reference);
      reset();
    } catch (err) {
      if (err instanceof ApiError && err.issues.length) {
        for (const issue of err.issues) setError(issue.path as keyof InquiryInput, { message: issue.message });
        setFormError('Please check the highlighted fields.');
      } else {
        setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      }
    }
  });

  const line = dark ? 'border-white/25 focus:border-cyan text-white' : 'border-navy/20 focus:border-blue text-navy';

  const aria = (name: keyof InquiryInput) => ({
    id: `inq-${name}`,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `inq-${name}-error` : undefined,
  });

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {reference ? (
          <motion.div key="done" role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: easePremium }} className="py-6">
            <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden="true" fill="none">
              <motion.circle cx="32" cy="32" r="30" stroke="#47C5D3" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} />
              <motion.path d="M20 33l8 8 16-17" stroke="#47C5D3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.6 }} />
            </svg>
            <h3 className={`mt-6 font-display text-3xl font-bold tracking-tight ${dark ? 'text-white' : ''}`}>Thank you. Your inquiry has been received.</h3>
            <p className={`mt-3 max-w-md leading-relaxed ${dark ? 'text-silver/75' : 'text-muted'}`}>
              The Arizen team will review your requirement and get back to you. Please keep this reference for any follow-up:
            </p>
            <p className={`tabular mt-4 inline-block border px-4 py-2 font-display text-lg font-bold tracking-[0.2em] ${dark ? 'border-white/20 text-cyan' : 'border-navy/15 text-blue'}`}>{reference}</p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold">
              <button type="button" onClick={() => setReference(null)} className={dark ? 'text-cyan hover:text-white' : 'text-blue hover:text-navy'}>
                Send another inquiry
              </button>
              <Link to="/products" className={dark ? 'text-silver/70 hover:text-white' : 'text-muted hover:text-navy'}>
                Back to products
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-labelledby={heading ? 'inquiry-heading' : undefined}>
            {heading && (
              <h2 id="inquiry-heading" className={`mb-8 font-display text-2xl font-bold tracking-tight ${dark ? 'text-white' : ''}`}>
                {heading}
              </h2>
            )}
            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              <FormField dark={dark} error={errors.fullName?.message} name="fullName" labelText="Full name">
                <input {...register('fullName')} {...aria('fullName')} autoComplete="name" placeholder="Full name" className={`${fieldBase} ${line}`} />
              </FormField>
              <FormField dark={dark} error={errors.companyName?.message} name="companyName" labelText="Company name">
                <input {...register('companyName')} {...aria('companyName')} autoComplete="organization" placeholder="Company" className={`${fieldBase} ${line}`} />
              </FormField>
              <FormField dark={dark} error={errors.email?.message} name="email" labelText="Business email">
                <input {...register('email')} {...aria('email')} type="email" inputMode="email" autoComplete="email" placeholder="Email" className={`${fieldBase} ${line}`} />
              </FormField>
              <FormField dark={dark} error={errors.phone?.message} name="phone" labelText="Phone number">
                <input {...register('phone')} {...aria('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="Phone" className={`${fieldBase} ${line}`} />
              </FormField>
              <FormField dark={dark} error={errors.product?.message} name="product" labelText="Product interested in" required={false}>
                <select {...register('product')} {...aria('product')} className={`${fieldBase} ${line} appearance-none ${dark ? '[&>option]:text-navy' : ''}`}>
                  <option value="">General inquiry</option>
                  {products.map((p) => (
                    <option key={p._id} value={p.slug}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField dark={dark} error={errors.quantity?.message} name="quantity" labelText="Required quantity" required={false}>
                <input {...register('quantity')} {...aria('quantity')} placeholder="e.g. 5 MT per month" className={`${fieldBase} ${line} placeholder:!text-current placeholder:opacity-30`} />
              </FormField>
              <FormField dark={dark} error={errors.message?.message} name="message" labelText="Message" className="sm:col-span-2">
                <textarea {...register('message')} {...aria('message')} rows={4} placeholder="Message" className={`${fieldBase} ${line} resize-y`} />
              </FormField>
            </div>

            {/* Honeypot: invisible to people and screen readers, tempting to bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={honeypotId}>Leave this field empty</label>
              <input id={honeypotId} name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <AnimatePresence>
              {formError && (
                <motion.p role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`mt-6 flex items-center gap-2 text-sm ${dark ? 'text-[#ff9b8f]' : 'text-danger'}`}>
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {formError}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className={`max-w-sm text-xs leading-relaxed ${dark ? 'text-silver/65' : 'text-muted'}`}>Your details are used only to respond to this inquiry.</p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-cyan px-8 text-sm font-semibold text-navy transition-colors duration-300 hover:bg-navy hover:text-white disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {isSubmitting ? 'Sending…' : 'Submit inquiry'}
                {!isSubmitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
