import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { api, ApiError } from '../lib/api';

/* ------------------------------------------------------------------ Buttons */

type Tone = 'primary' | 'secondary' | 'danger' | 'ghost';
const tones: Record<Tone, string> = {
  primary: 'bg-navy text-white hover:bg-blue disabled:hover:bg-navy',
  secondary: 'border border-navy/15 bg-white text-navy hover:border-navy/40',
  danger: 'border border-danger/30 bg-white text-danger hover:bg-danger hover:text-white',
  ghost: 'text-muted hover:bg-navy/5 hover:text-navy',
};

export function Button({ tone = 'primary', busy, children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; busy?: boolean }) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || busy}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ Fields */

const control =
  'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-navy outline-none transition-colors placeholder:text-mist focus:border-blue focus:ring-2 focus:ring-blue/15 aria-[invalid=true]:border-danger';

interface FieldProps {
  label: string;
  help?: string;
  error?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
  className?: string;
  counter?: { value: number; max: number };
}

export function Field({ label, help, error, children, className = '', counter }: FieldProps) {
  const id = useId();
  const describedBy = [help && `${id}-help`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-navy">
          {label}
        </label>
        {counter && <span className={`tabular text-xs ${counter.value > counter.max ? 'text-danger' : 'text-mist'}`}>{counter.value}/{counter.max}</span>}
      </div>
      {children(id, describedBy)}
      {help && !error && (
        <p id={`${id}-help`} className="mt-1.5 text-xs leading-relaxed text-muted">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ label, help, error, className, max, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, 'max'> & { label: string; help?: string; error?: string; max?: number }) {
  const length = typeof rest.value === 'string' ? rest.value.length : 0;
  return (
    <Field label={label} help={help} error={error} className={className} counter={max ? { value: length, max } : undefined}>
      {(id, describedBy) => <input id={id} aria-describedby={describedBy} aria-invalid={error ? true : undefined} className={`${control} border-navy/15`} {...rest} />}
    </Field>
  );
}

export function TextArea({ label, help, error, className, max, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; help?: string; error?: string; max?: number }) {
  const length = typeof rest.value === 'string' ? rest.value.length : 0;
  return (
    <Field label={label} help={help} error={error} className={className} counter={max ? { value: length, max } : undefined}>
      {(id, describedBy) => <textarea id={id} aria-describedby={describedBy} aria-invalid={error ? true : undefined} rows={4} className={`${control} resize-y border-navy/15 leading-relaxed`} {...rest} />}
    </Field>
  );
}

export function SelectInput({ label, help, error, className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; help?: string; error?: string }) {
  return (
    <Field label={label} help={help} error={error} className={className}>
      {(id, describedBy) => (
        <select id={id} aria-describedby={describedBy} aria-invalid={error ? true : undefined} className={`${control} border-navy/15`} {...rest}>
          {children}
        </select>
      )}
    </Field>
  );
}

export function Switch({ checked, onChange, label, help, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-blue' : 'bg-navy/20'}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
      <label htmlFor={id} className="text-sm">
        <span className="font-medium text-navy">{label}</span>
        {help && <span className="mt-0.5 block text-xs text-muted">{help}</span>}
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ Layout pieces */

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back}
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, children, className = '', actions }: { title?: string; description?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`rounded-xl border border-navy/10 bg-white p-5 sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-display text-base font-bold tracking-tight">{title}</h2>}
            {description && <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-navy/15 bg-white px-6 py-14 text-center">
      <p className="font-display font-semibold">{title}</p>
      {children && <div className="mt-2 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="grid place-items-center py-20" role="status">
      <Loader2 className="h-6 w-6 animate-spin text-blue" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ErrorNote({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-center justify-between gap-4 rounded-xl border border-danger/20 bg-danger/5 px-5 py-4 text-sm text-danger">
      <span>{error instanceof Error ? error.message : 'Something went wrong.'}</span>
      {onRetry && (
        <Button tone="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-end gap-2 text-sm">
      <Button tone="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)} className="!px-2.5">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Previous page</span>
      </Button>
      <span className="tabular px-2 text-muted">
        Page {page} of {pages}
      </span>
      <Button tone="secondary" disabled={page >= pages} onClick={() => onPage(page + 1)} className="!px-2.5">
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Next page</span>
      </Button>
    </nav>
  );
}

/* ------------------------------------------------------------------ Modal & confirm */

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-end justify-center bg-navy/50 p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            className={`max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl ${wide ? 'max-w-5xl' : 'max-w-lg'}`}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
              <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-navy/5 hover:text-navy">
                <X className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({ open, title, body, confirmLabel = 'Delete', onConfirm, onCancel, busy }: { open: boolean; title: string; body: ReactNode; confirmLabel?: string; onConfirm: () => void; onCancel: () => void; busy?: boolean }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="flex gap-3 text-sm leading-relaxed text-muted">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
        <div>{body}</div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button tone="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button tone="danger" onClick={onConfirm} busy={busy}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ Toasts */

interface Toast {
  id: number;
  kind: 'success' | 'error';
  text: string;
}
const ToastContext = createContext<(kind: Toast['kind'], text: string) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 6000 : 3500);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40 }} className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-xl ${t.kind === 'success' ? 'bg-navy' : 'bg-danger'}`}>
              {t.kind === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
              <span>{t.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

/* ------------------------------------------------------------------ Data hooks */

export function useResource<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!url) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    api
      .get<T>(url, ctrl.signal)
      .then((d) => setData(d))
      .catch((e) => (e as Error).name !== 'AbortError' && setError(e))
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
  }, [url, version]);

  return { data, setData, error, loading, reload: () => setVersion((v) => v + 1) };
}

type Path = (string | number)[];

function setIn<T>(obj: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  const clone = (Array.isArray(obj) ? [...obj] : { ...(obj as object) }) as Record<string | number, unknown>;
  clone[head] = setIn(clone[head], rest, value);
  return clone as T;
}

/** Editable copy of a record with path-based updates and a field → error map. */
export function useDraft<T>(initial: T | null) {
  const [draft, setDraft] = useState<T | null>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    setDraft(initial);
    setDirty(false);
    setErrors({});
  }, [initial]);
  const set = useCallback((path: Path, value: unknown) => {
    setDraft((d) => (d === null ? d : setIn(d, path, value)));
    setDirty(true);
    setErrors((e) => {
      const key = path.join('.');
      if (!(key in e)) return e;
      const { [key]: _removed, ...rest } = e;
      void _removed;
      return rest;
    });
  }, []);
  const failWith = (err: unknown) => {
    if (err instanceof ApiError) setErrors(Object.fromEntries(err.issues.map((i) => [i.path, i.message])));
  };
  return { draft, setDraft, set, errors, setErrors, failWith, dirty, setDirty };
}

/** Warn before leaving a page with unsaved changes. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}

export const formatDate = (iso: string | Date | null | undefined, withTime = false) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) }) : '—';
