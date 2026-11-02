/** Every section of the proposal, in page order. Drives navigation and the index overlay. */
export const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'understanding', label: 'Project Understanding' },
  { id: 'products', label: 'Product Showcase' },
  { id: 'scope', label: 'Scope of Work' },
  { id: 'features', label: 'Technical Features' },
  { id: 'foundation', label: 'Digital Foundation' },
  { id: 'investment', label: 'Commercial Proposal' },
  { id: 'timeline', label: 'Project Timeline' },
  { id: 'payments', label: 'Payment Milestones' },
  { id: 'recurring', label: 'Annual Recurring Costs' },
  { id: 'deliverables', label: 'Deliverables' },
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'acceptance', label: 'Contact & Acceptance' },
] as const;

export type SectionId = (typeof sections)[number]['id'];

/** Compact desktop navigation; each link stays active across the sections it covers. */
export const navLinks: { label: string; target: SectionId; covers: SectionId[] }[] = [
  { label: 'Overview', target: 'introduction', covers: ['introduction', 'understanding'] },
  { label: 'Products', target: 'products', covers: ['products'] },
  { label: 'Scope', target: 'scope', covers: ['scope', 'features', 'foundation'] },
  { label: 'Investment', target: 'investment', covers: ['investment'] },
  { label: 'Timeline', target: 'timeline', covers: ['timeline'] },
  { label: 'Payments', target: 'payments', covers: ['payments', 'recurring'] },
  { label: 'Terms', target: 'deliverables', covers: ['deliverables', 'terms', 'portfolio'] },
];

export function sectionNumber(id: SectionId): string {
  return String(sections.findIndex((s) => s.id === id) + 2).padStart(2, '0');
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  // Move focus for keyboard and screen-reader users without a second scroll jump.
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}
