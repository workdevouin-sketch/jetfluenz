'use client';

import { Search, Settings, Bell } from 'lucide-react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from '@/hooks/useDebounce';

const Topbar = ({ title = 'Dashboard' }) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <header className="h-24 bg-white md:bg-gray-50/50 flex items-center justify-between px-8 border-b md:border-none border-gray-100">
            {/* Page Title */}
            <h1 className="text-2xl font-bold text-[#343C6A]">{title}</h1>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                {/* Search Bar - Hidden on small mobile */}
                <div className="hidden md:flex items-center bg-gray-100 rounded-full px-5 py-3 w-80">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for something"
                        className="bg-transparent border-none outline-none ml-3 text-sm text-gray-600 w-full placeholder-gray-400"
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams.get('q')?.toString()}
                    />
                </div>

                {/* Action Icons */}
                <button className="w-12 h-12 rounded-full bg-gray-100/80 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500">
                    <Settings className="w-6 h-6" />
                </button>
                <button className="w-12 h-12 rounded-full bg-gray-100/80 flex items-center justify-center hover:bg-gray-200 transition-colors text-red-400">
                    <Bell className="w-6 h-6" />
                </button>

                {/* Profile Pic Placeholder */}
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                    <img src="https://ui-avatars.com/api/?name=User&background=random" alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>
        </header>
    );
};

export default Topbar;
