'use client';

import { Suspense } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ValuationStats from '@/components/influencer/ValuationStats';
import { useSearchParams } from 'next/navigation';

function AnalyzerContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    return (
        <div className="max-w-[1400px] mx-auto">
            <ValuationStats key={query} predefinedUsername={query || null} />
        </div>
    );
}

export default function AnalyzerPage() {
    return (
        <DashboardLayout role="admin" title="Market Intelligence">
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#343C6A]">Market Intelligence & Valuation</h2>
                        <p className="text-gray-500 text-sm mt-1">Analyze influencer performance and calculate fair market value instantly.</p>
                    </div>

                    {/* Content Area */}
                    <Suspense fallback={<div className="flex justify-center py-10">Loading analyzer...</div>}>
                        <AnalyzerContent />
                    </Suspense>
                </div>
            </div>
        </DashboardLayout>
    );
}
