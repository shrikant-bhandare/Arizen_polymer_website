import { inquiryStatusLabels, type InquiryStatus } from '@shared/schemas';

const colors: Record<InquiryStatus, string> = {
  new: 'bg-cyan/15 text-[#0f6f7a] ring-cyan/40',
  contacted: 'bg-blue/10 text-blue ring-blue/30',
  in_discussion: 'bg-[#f3e8ff] text-[#6b3fa0] ring-[#d8c3f0]',
  quotation_sent: 'bg-[#fff4e0] text-warning ring-[#f2d29b]',
  converted: 'bg-success/10 text-success ring-success/30',
  closed: 'bg-navy/5 text-muted ring-navy/15',
};

export function StatusPill({ status }: { status: InquiryStatus }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${colors[status]}`}>{inquiryStatusLabels[status]}</span>;
}
