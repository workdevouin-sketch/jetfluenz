'use client';

import { Suspense } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UsersTable from '@/components/admin/UsersTable';
import { useAdminData } from '@/hooks/useAdminData';
import { useSearchParams } from 'next/navigation';

function BusinessContent() {
    const { users, loading, refetch } = useAdminData();
    const searchParams = useSearchParams();
    const query = searchParams.get('q')?.toLowerCase() || '';

    const filteredUsers = users.filter(user => {
        if (!query) return true;
        return (
            user.companyName?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.contactPerson?.toLowerCase().includes(query) ||
            user.industry?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-gray-400">Loading...</div>;
    }

    return <UsersTable users={filteredUsers} role="business" onRefetch={refetch} />;
}

export default function BusinessPage() {
    return (
        <DashboardLayout role="admin" title="Business">
            <Suspense fallback={<div className="flex justify-center items-center h-64 text-gray-400">Loading search...</div>}>
                <BusinessContent />
            </Suspense>
        </DashboardLayout>
    );
}
