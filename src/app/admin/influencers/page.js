'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import UsersTable from '@/components/admin/UsersTable';
import { useAdminData } from '@/hooks/useAdminData';
import { useSearchParams } from 'next/navigation';

export default function InfluencersPage() {
    const { users, loading, refetch } = useAdminData();
    const searchParams = useSearchParams();
    const query = searchParams.get('q')?.toLowerCase() || '';

    const filteredUsers = users.filter(user => {
        if (!query) return true;
        return (
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.instagram?.toLowerCase().includes(query) ||
            user.niche?.toLowerCase().includes(query)
        );
    });

    return (
        <DashboardLayout role="admin" title="Influencers">
            {loading ? (
                <div className="flex justify-center items-center h-64 text-gray-400">Loading...</div>
            ) : (
                <UsersTable users={filteredUsers} role="influencer" onRefetch={refetch} />
            )}
        </DashboardLayout>
    );
}
