'use client';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children, role, title }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userSession = localStorage.getItem('jetfluenz_user');

        if (!userSession) {
            router.push('/login');
        } else {
            // Optional: Check if role matches what's expected? 
            // For now just basic auth guard is sufficient as per request.
            // We could parse JSON and check role, but Sidebar handles role-based rendering anyway.
            setIsLoading(false);
        }
    }, [router]);

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
