'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Calculator from '@/components/admin/Calculator';

export default function CalculatorPage() {
    return (
        <DashboardLayout role="admin" title="Pricing Calculator">
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <Calculator />
            </div>
        </DashboardLayout>
    );
}
