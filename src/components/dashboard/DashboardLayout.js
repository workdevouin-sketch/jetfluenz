'use client';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children, role, title }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let sessionKey = 'jetfluenz_user'; // fallback
        if (role === 'admin') sessionKey = 'jetfluenz_admin_session';
        if (role === 'business') sessionKey = 'jetfluenz_business_session';
        if (role === 'influencer') sessionKey = 'jetfluenz_influencer_session';

        const userSession = localStorage.getItem(sessionKey);

        if (!userSession) {
            router.push('/login');
        } else {
            setIsLoading(false);
        }
    }, [router, role]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar role={role} />

            <main className="flex-1 md:ml-64 flex flex-col min-w-0">
                <Topbar title={title} />

                <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
