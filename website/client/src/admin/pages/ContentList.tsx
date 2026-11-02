import { ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router';
import { ErrorNote, formatDate, PageHeader, Spinner, useResource } from '../ui';

interface Row {
  key: string;
  label: string;
  path: string | null;
  updatedAt: string | null;
  updatedBy: string;
}

export default function ContentList() {
  const { data, error, loading, reload } = useResource<Row[]>('/api/admin/content');
  return (
    <>
      <PageHeader title="Pages" description="Edit the text, images and search settings of every page, plus the navigation and footer." />
      {error ? (
        <ErrorNote error={error} onRetry={reload} />
      ) : loading && !data ? (
        <Spinner />
      ) : (
        <ul className="divide-y divide-navy/5 rounded-xl border border-navy/10 bg-white">
          {data?.map((p) => (
            <li key={p.key}>
              <Link to={`/admin/content/${p.key}`} className="flex items-center gap-4 px-5 py-4 hover:bg-paper">
                <FileText className="h-5 w-5 shrink-0 text-blue" strokeWidth={1.5} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{p.label}</span>
                  <span className="block text-xs text-muted">{p.path ?? 'Shown on every page'}</span>
                </span>
                <span className="hidden text-right text-xs text-muted sm:block">
                  Updated {formatDate(p.updatedAt)}
                  {p.updatedBy && <span className="block">by {p.updatedBy}</span>}
                </span>
                <ChevronRight className="h-4 w-4 text-mist" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
