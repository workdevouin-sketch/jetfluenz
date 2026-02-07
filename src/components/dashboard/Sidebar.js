'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Briefcase, DollarSign, Users, Settings, LogOut, TrendingUp, BookOpen } from 'lucide-react';

const Sidebar = ({ role = 'influencer' }) => {
    const pathname = usePathname();
    const basePath = `/dashboard/${role}`;

    let navItems = [];

    if (role === 'admin') {
        const adminPath = '/admin';
        navItems = [
            { name: 'Influencers', href: `/admin/influencers`, icon: Users },
            { name: 'Business', href: `/admin/business`, icon: Briefcase },
            { name: 'Campaigns', href: `/admin/campaigns`, icon: Briefcase },
            { name: 'Market Intelligence', href: `/admin/analyzer`, icon: LayoutGrid },

        ];
    } else {
        navItems = [
            { name: 'Dashboard', href: `${basePath}`, icon: LayoutGrid },
            { name: 'Campaigns', href: `${basePath}/campaigns`, icon: Briefcase },
            { name: 'Affiliate', href: `${basePath}/affiliate`, icon: TrendingUp },
            { name: 'Earnings', href: `${basePath}/earnings`, icon: DollarSign },
            { name: 'Settings', href: `${basePath}/settings`, icon: Settings },
            { name: 'JLearn', href: `${basePath}/jlearn`, icon: BookOpen },
        ];
    }

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 z-30">
            {/* Logo Area */}

            <div className="p-6 flex items-center justify-center">
                <Link href="/" className="flex items-center justify-center bg-[#2008b9] p-4 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform w-full">
                    <img src="/logo.png" alt="Jetfluenz" className="h-14 w-auto" />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.name !== 'Dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-colors relative ${isActive
                                ? 'text-[#2008b9]'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 bg-[#2008b9] rounded-r-md"></div>
                            )}
                            <item.icon className="w-6 h-6" />
                            <span className="font-medium text-base">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 mt-auto">
                <button
                    onClick={() => {
                        let sessionKey = 'jetfluenz_user';
                        if (role === 'admin') sessionKey = 'jetfluenz_admin_session';
                        if (role === 'business') sessionKey = 'jetfluenz_business_session';
                        if (role === 'influencer') sessionKey = 'jetfluenz_influencer_session';

                        localStorage.removeItem(sessionKey);
                        // Clear cached Instagram Stats
                        Object.keys(localStorage).forEach(key => {
                            if (key.startsWith('jetfluenz_stats_')) {
                                localStorage.removeItem(key);
                            }
                        });

                        // Also clear fallback just in case, or if adminAuthenticated is used
                        if (role === 'admin') localStorage.removeItem('adminAuthenticated');

                        window.location.href = '/login';
                    }}
                    className="flex items-center gap-4 px-6 py-4 text-gray-400 hover:text-red-500 hover:bg-red-50 w-full rounded-xl transition-colors"
                >
                    <LogOut className="w-6 h-6" />
                    <span className="font-medium text-base">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
