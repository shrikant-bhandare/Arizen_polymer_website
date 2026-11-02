import { Link } from 'react-router';

export default function AdminNotFound() {
  return (
    <div className="py-20 text-center">
      <p className="font-display text-2xl font-bold">Page not found</p>
      <p className="mt-2 text-sm text-muted">This dashboard page does not exist.</p>
      <Link to="/admin" className="mt-6 inline-block text-sm font-semibold text-blue hover:text-navy">
        Back to the dashboard
      </Link>
    </div>
  );
}
