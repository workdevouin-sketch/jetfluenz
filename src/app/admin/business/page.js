'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UsersTable from '@/components/admin/UsersTable';
import { useAdminData } from '@/hooks/useAdminData';
import { useSearchParams } from 'next/navigation';

export default function BusinessPage() {
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

    return (
        <DashboardLayout role="admin" title="Business">
            {loading ? (
                <div className="flex justify-center items-center h-64 text-gray-400">Loading...</div>
            ) : (
                <UsersTable users={filteredUsers} role="business" onRefetch={refetch} />
            )}
        </DashboardLayout>
    );
}
