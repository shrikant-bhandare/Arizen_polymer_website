import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { isInternal } from '../../lib/site';

type Variant = 'primary' | 'secondary' | 'onDark' | 'text';

const styles: Record<Variant, string> = {
  primary: 'bg-cyan text-navy hover:bg-navy hover:text-white',
  secondary: 'border border-navy/20 text-navy hover:border-navy hover:bg-navy hover:text-white',
  onDark: 'border border-white/30 text-white hover:border-cyan hover:bg-cyan hover:text-navy',
  text: 'text-blue hover:text-navy !px-0 !h-auto',
};

interface Props {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

/** Link styled as a button. Internal paths use the router; external links open safely. */
export function ButtonLink({ href, children, variant = 'primary', className = '' }: Props) {
  const internal = isInternal(href);
  const anchor = href.startsWith('#');
  const Icon = anchor ? ArrowDown : internal ? ArrowRight : ArrowUpRight;
  const cls = `group inline-flex h-12 items-center gap-3 rounded-full px-6 text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${styles[variant]} ${className}`;
  const content = (
    <>
      {children}
      <Icon className={`h-4 w-4 transition-transform duration-300 ease-[var(--ease-premium)] ${anchor ? 'group-hover:translate-y-0.5' : 'group-hover:translate-x-1'}`} strokeWidth={2} aria-hidden="true" />
    </>
  );
  if (internal) {
    return (
      <Link to={href} className={cls} viewTransition>
        {content}
      </Link>
    );
  }
  const external = /^https?:/.test(href);
  return (
    <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {content}
    </a>
  );
}
