'use client';

import { useState } from 'react';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import TicketList from '../../../components/tickets/TicketList';
import TicketDetail from '../../../components/tickets/TicketDetail';

export default function AdminSupportPage() {
    const [view, setView] = useState('list'); // list, detail
    const [selectedTicket, setSelectedTicket] = useState(null);

    return (
        <DashboardLayout role="admin" title="Support Tickets">
            <div className="h-[calc(100vh-140px)]">
                {view === 'list' && (
                    <div className="h-full flex flex-col gap-6">
                        <div>
                            <h2 className="text-2xl font-bold text-[#343C6A]">Support Tickets</h2>
                            <p className="text-gray-500">Manage all user tickets from here.</p>
                        </div>
                        <TicketList
                            type="admin"
                            onSelectTicket={(ticket) => {
                                setSelectedTicket(ticket);
                                setView('detail');
                            }}
                        />
                    </div>
                )}

                {view === 'detail' && selectedTicket && (
                    <TicketDetail
                        ticket={selectedTicket}
                        isAdmin={true}
                        onBack={() => {
                            setSelectedTicket(null);
                            setView('list');
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
