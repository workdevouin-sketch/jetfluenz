'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function TicketList({ onSelectTicket, type = 'user' }) {
    const { userData } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, open, closed

    useEffect(() => {
        if (!userData) return;

        let q;
        try {
            if (type === 'admin') {
                q = query(collection(db, 'tickets'));
            } else {
                q = query(
                    collection(db, 'tickets'),
                    where('userId', '==', userData.id)
                );
            }

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const ticketData = [];
                snapshot.forEach((doc) => {
                    ticketData.push({ id: doc.id, ...doc.data() });
                });

                // Client-side sort to avoid index requirements
                ticketData.sort((a, b) => {
                    const dateA = a.updatedAt?.seconds || 0;
                    const dateB = b.updatedAt?.seconds || 0;
                    return dateB - dateA;
                });

                setTickets(ticketData);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching tickets:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err) {
            console.error("Query error:", err);
            setLoading(false);
        }
    }, [userData, type]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-yellow-100 text-yellow-600';
            case 'in_progress': return 'bg-blue-100 text-blue-600';
            case 'resolved': return 'bg-green-100 text-green-600';
            case 'closed': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        if (filter === 'all') return true;
        if (filter === 'open') return ['open', 'in_progress'].includes(ticket.status);
        if (filter === 'closed') return ['resolved', 'closed'].includes(ticket.status);
        return true;
    });

    if (loading) {
        return <div className="text-center py-10 text-gray-400">Loading tickets...</div>;
    }

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-[#343C6A]">
                    {type === 'admin' ? 'All Support Tickets' : 'My Tickets'}
                </h3>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-[#2008b9] text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('open')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'open' ? 'bg-[#2008b9] text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                        Open
                    </button>
                    <button
                        onClick={() => setFilter('closed')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'closed' ? 'bg-[#2008b9] text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                        Closed
                    </button>
                </div>
            </div>

            {filteredTickets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-10">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p>No tickets found</p>
                </div>
            ) : (
                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {filteredTickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => onSelectTicket(ticket)}
                            className="p-4 rounded-xl border border-gray-100 hover:border-[#2008b9]/30 hover:shadow-md transition-all cursor-pointer bg-gray-50/50 group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-[#343C6A] group-hover:text-[#2008b9] transition-colors line-clamp-1">{ticket.subject}</h4>
                                <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${getStatusColor(ticket.status)}`}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                            </div>

                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ticket.description}</p>

                            <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                                <div className="flex items-center gap-4">
                                    <span className="capitalize px-2 py-0.5 bg-white rounded border border-gray-200">
                                        {ticket.category}
                                    </span>
                                    {type === 'admin' && (
                                        <span className="font-medium text-[#343C6A]">{ticket.userName}</span>
                                    )}
                                </div>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {ticket.updatedAt?.seconds ? new Date(ticket.updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
