'use client';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children, role, title }) {
    const router = useRouter();
    const { user, userData, loading, isAuthenticated } = useAuth();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!loading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        // Check role authorization
        if (!loading && isAuthenticated && userData) {
            // If role is specified, check if user has the required role
            if (role && userData.role !== role) {
                // Redirect to appropriate dashboard based on user's actual role
                if (userData.role === 'admin') {
                    router.push('/admin');
                } else if (userData.role === 'business') {
                    router.push('/dashboard/business');
                } else if (userData.role === 'influencer') {
                    router.push('/dashboard/influencer');
                } else {
                    router.push('/login');
                }
            }

            // Check if account is banned
            if (userData.status === 'banned') {
                router.push('/login?error=banned');
            }

            // Check if account is not approved
            if (userData.status !== 'approved' && userData.role !== 'admin') {
                router.push('/login?error=pending');
            }
        }
    }, [user, userData, loading, isAuthenticated, role, router]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#2008b9] mx-auto mb-4" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated || !userData) {
        return null;
    }

    // Don't render if role mismatch
    if (role && userData.role !== role) {
        return null;
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
