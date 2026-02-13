'use client';

import { useState } from 'react';
import DashboardLayout from '../../../../components/dashboard/DashboardLayout';
import TicketList from '../../../../components/tickets/TicketList';
import TicketDetail from '../../../../components/tickets/TicketDetail';
import CreateTicket from '../../../../components/tickets/CreateTicket';
import { Plus } from 'lucide-react';

export default function BusinessSupportPage() {
    const [view, setView] = useState('list'); // list, detail, create
    const [selectedTicket, setSelectedTicket] = useState(null);

    return (
        <DashboardLayout role="business" title="Support">
            <div className="h-[calc(100vh-140px)]">
                {view === 'list' && (
                    <div className="h-full flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-[#343C6A]">Help & Support</h2>
                                <p className="text-gray-500">Track your tickets or create a new one.</p>
                            </div>
                            <button
                                onClick={() => setView('create')}
                                className="bg-[#2008b9] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-800 transition-all flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> New Ticket
                            </button>
                        </div>
                        <TicketList
                            onSelectTicket={(ticket) => {
                                setSelectedTicket(ticket);
                                setView('detail');
                            }}
                        />
                    </div>
                )}

                {view === 'create' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="mb-6">
                            <button
                                onClick={() => setView('list')}
                                className="text-gray-400 hover:text-[#343C6A] font-medium"
                            >
                                ← Back to Tickets
                            </button>
                        </div>
                        <CreateTicket
                            onSuccess={() => setView('list')}
                        />
                    </div>
                )}

                {view === 'detail' && selectedTicket && (
                    <TicketDetail
                        ticket={selectedTicket}
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
