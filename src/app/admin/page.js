import { Suspense } from 'react';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AdminClient />
    </Suspense>
  );
}
