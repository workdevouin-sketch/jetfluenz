'use client';

import { Suspense } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CampaignsTable from '@/components/admin/CampaignsTable';
import { useAdminData } from '@/hooks/useAdminData';
import { useSearchParams } from 'next/navigation';

function CampaignsContent() {
    const { campaigns, users, loading, refetch } = useAdminData();
    const searchParams = useSearchParams();
    const query = searchParams.get('q')?.toLowerCase() || '';

    const filteredCampaigns = campaigns.filter(campaign => {
        if (!query) return true;
        return (
            campaign.title?.toLowerCase().includes(query) ||
            campaign.businessName?.toLowerCase().includes(query) ||
            campaign.status?.toLowerCase().includes(query) ||
            campaign.assignedTo?.name?.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return <div className="flex justify-center items-center h-64 text-gray-400">Loading...</div>;
    }

    return <CampaignsTable campaigns={filteredCampaigns} users={users} onRefetch={refetch} />;
}

export default function CampaignsPage() {
    return (
        <DashboardLayout role="admin" title="Campaigns">
            <Suspense fallback={<div className="flex justify-center items-center h-64 text-gray-400">Loading search...</div>}>
                <CampaignsContent />
            </Suspense>
        </DashboardLayout>
    );
}
