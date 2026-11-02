import { ArrowRight, FolderTree, Inbox, MailWarning, Package } from 'lucide-react';
import { Link } from 'react-router';
import type { InquiryStatus } from '@shared/schemas';
import { CountUp } from '../../components/motion/CountUp';
import { useAdmin } from '../auth';
import { StatusPill } from '../StatusPill';
import { Card, ErrorNote, formatDate, PageHeader, Spinner, useResource } from '../ui';

interface Dashboard {
  totalProducts: number;
  publishedProducts: number;
  activeCategories: number;
  totalInquiries: number;
  newInquiries: number;
  recentInquiries: { _id: string; fullName: string; companyName: string; productName: string; status: InquiryStatus; createdAt: string }[];
  recentUpdates: { type: string; label: string; href: string; updatedAt: string; by: string }[];
}

export default function DashboardPage() {
  const user = useAdmin();
  const { data, error, loading, reload } = useResource<Dashboard>('/api/admin/dashboard');

  if (loading && !data) return <Spinner />;
  if (error || !data) return <ErrorNote error={error} onRetry={reload} />;

  const stats = [
    { label: 'Total products', value: data.totalProducts, sub: `${data.publishedProducts} published`, icon: Package, href: '/admin/products' },
    { label: 'Active categories', value: data.activeCategories, sub: 'Shown on the website', icon: FolderTree, href: '/admin/categories' },
    { label: 'Total inquiries', value: data.totalInquiries, sub: 'All time', icon: Inbox, href: '/admin/inquiries' },
    { label: 'New inquiries', value: data.newInquiries, sub: 'Awaiting first contact', icon: MailWarning, href: '/admin/inquiries?status=new', highlight: data.newInquiries > 0 },
  ];

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`} description="An overview of the website catalogue and incoming business inquiries." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, href, highlight }) => (
          <Link key={label} to={href} className={`group rounded-xl border p-5 transition-colors ${highlight ? 'border-cyan/50 bg-cyan/10' : 'border-navy/10 bg-white hover:border-blue/40'}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted">{label}</p>
              <Icon className={`h-5 w-5 ${highlight ? 'text-[#0f6f7a]' : 'text-mist group-hover:text-blue'}`} strokeWidth={1.75} aria-hidden="true" />
            </div>
            <p className="mt-4 font-display text-4xl font-extrabold tracking-tight">
              <CountUp value={value} format={(n) => String(n)} duration={1} />
            </p>
            <p className="mt-1 text-xs text-muted">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card
          title="Recent inquiries"
          className="xl:col-span-3"
          actions={
            <Link to="/admin/inquiries" className="inline-flex items-center gap-1 text-sm font-semibold text-blue hover:text-navy">
              View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        >
          {data.recentInquiries.length ? (
            <ul className="-mx-2 divide-y divide-navy/5">
              {data.recentInquiries.map((i) => (
                <li key={i._id}>
                  <Link to={`/admin/inquiries/${i._id}`} className="flex items-center justify-between gap-4 rounded-lg px-2 py-3 hover:bg-paper">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{i.companyName}</span>
                      <span className="block truncate text-xs text-muted">
                        {i.fullName} · {i.productName || 'General inquiry'} · {formatDate(i.createdAt)}
                      </span>
                    </span>
                    <StatusPill status={i.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No inquiries yet. They will appear here as soon as visitors submit the form.</p>
          )}
        </Card>
        <Card title="Recent content updates" className="xl:col-span-2">
          {data.recentUpdates.length ? (
            <ul className="-mx-2 divide-y divide-navy/5">
              {data.recentUpdates.map((u) => (
                <li key={`${u.type}-${u.href}-${u.label}`}>
                  <Link to={u.href} className="flex items-center justify-between gap-4 rounded-lg px-2 py-3 hover:bg-paper">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{u.label}</span>
                      <span className="block text-xs text-muted">
                        {u.type}
                        {u.by ? ` · ${u.by}` : ''}
                      </span>
                    </span>
                    <span className="text-xs whitespace-nowrap text-muted">{formatDate(u.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No updates yet.</p>
          )}
        </Card>
      </div>
    </>
  );
}
