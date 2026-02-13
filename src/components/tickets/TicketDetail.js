'use client';

import { useState, useRef, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, updateDoc, arrayUnion, serverTimestamp, onSnapshot, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Send, ArrowLeft, CheckCircle, XCircle, User, Shield, AlertCircle, Trash2 } from 'lucide-react';

export default function TicketDetail({ ticket: initialTicket, onBack, isAdmin = false }) {
    const { userData } = useAuth();
    const [ticket, setTicket] = useState(initialTicket);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Real-time listener for the ticket
    useEffect(() => {
        if (!initialTicket?.id) return;

        const unsubscribe = onSnapshot(doc(db, 'tickets', initialTicket.id), (doc) => {
            if (doc.exists()) {
                setTicket({ id: doc.id, ...doc.data() });
            } else {
                // Ticket deleted
                onBack(); // Return to list if ticket is gone
            }
        });

        return () => unsubscribe();
    }, [initialTicket.id, onBack]);

    useEffect(() => {
        scrollToBottom();
    }, [ticket.messages]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;

        setLoading(true);
        try {
            const messageData = {
                text: reply,
                senderId: userData.id,
                senderName: userData.name || userData.companyName || (isAdmin ? 'Support Team' : 'User'),
                senderRole: isAdmin ? 'admin' : userData.role,
                timestamp: new Date().toISOString()
            };

            const updates = {
                messages: arrayUnion(messageData),
                updatedAt: serverTimestamp()
            };

            // If admin replies, set status to in_progress if currently open
            if (isAdmin && ticket.status === 'open') {
                updates.status = 'in_progress';
            }

            // If user replies, maybe reopen if resolved? (Optional logic)

            await updateDoc(doc(db, 'tickets', ticket.id), updates);
            setReply('');
        } catch (error) {
            console.error("Error sending reply:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus) => {
        if (!isAdmin) return;
        try {
            await updateDoc(doc(db, 'tickets', ticket.id), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDelete = async () => {
        if (!isAdmin || !confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;

        try {
            await deleteDoc(doc(db, 'tickets', ticket.id));
            // Navigation handled by onSnapshot detecting deletion
        } catch (error) {
            console.error("Error deleting ticket:", error);
            alert("Failed to delete ticket");
        }
    };

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-[#343C6A]"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h3 className="font-bold text-[#343C6A] text-lg line-clamp-1">{ticket.subject}</h3>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400">ID: {ticket.id}</span>
                            <span className="text-gray-300">•</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                                {ticket.category}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className={`px-2 py-0.5 rounded-full font-medium ${ticket.status === 'resolved' ? 'bg-green-100 text-green-600' :
                                ticket.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                                    'bg-yellow-100 text-yellow-600'
                                }`}>
                                {ticket.status?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => updateStatus('resolved')}
                            disabled={ticket.status === 'resolved'}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${ticket.status === 'resolved'
                                    ? 'bg-green-50 text-green-300 cursor-default'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                        >
                            <CheckCircle className="w-3 h-3" /> Resolve
                        </button>

                        <button
                            onClick={() => updateStatus('closed')}
                            disabled={ticket.status === 'closed'}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${ticket.status === 'closed'
                                    ? 'bg-gray-100 text-gray-300 cursor-default'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <XCircle className="w-3 h-3" /> Close
                        </button>

                        <button
                            onClick={handleDelete}
                            className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 ml-2"
                        >
                            <Trash2 className="w-3 h-3" /> Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
                {/* Original Issue */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {ticket.userName?.[0] || 'U'}
                        </div>
                        <div>
                            <p className="font-bold text-[#343C6A] text-sm">{ticket.userName}</p>
                            <p className="text-xs text-gray-400">opened this ticket</p>
                        </div>
                    </div>
                    <p className="text-[#343C6A] whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                </div>

                {/* Message Thread */}
                {ticket.messages && ticket.messages.map((msg, idx) => {
                    const isMe = msg.senderId === userData.id;
                    const isStaff = msg.senderRole === 'admin';

                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                                <div className={`
                                    rounded-2xl p-4 shadow-sm
                                    ${isMe
                                        ? 'bg-[#2008b9] text-white rounded-br-none'
                                        : isStaff
                                            ? 'bg-gradient-to-br from-purple-50 to-white text-[#343C6A] border border-purple-100 rounded-bl-none'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                    }
                                `}>
                                    <div className="flex items-center gap-2 mb-2 opacity-90 text-xs">
                                        {isStaff && (
                                            <div className="flex items-center gap-1 bg-purple-100 px-2 py-0.5 rounded-full text-purple-600 font-bold">
                                                <Shield className="w-3 h-3" /> Support Team
                                            </div>
                                        )}
                                        {!isStaff && <span className="font-bold">{msg.senderName}</span>}
                                    </div>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                                </div>
                                <span className="text-[10px] text-gray-300 mt-1 px-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            {ticket.status !== 'closed' ? (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <form onSubmit={handleReply} className="flex gap-4">
                        <input
                            type="text"
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#2008b9] focus:ring-0 outline-none transition-all text-[#343C6A]"
                        />
                        <button
                            type="submit"
                            disabled={loading || !reply.trim()}
                            className="bg-[#2008b9] text-white p-3 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            ) : (
                <div className="p-6 bg-gray-50 text-center border-t border-gray-100">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-600 text-sm font-bold">
                        <AlertCircle className="w-4 h-4" />
                        This ticket is closed
                    </div>
                </div>
            )}
        </div>
    );
}
