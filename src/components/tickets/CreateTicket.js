'use client';

import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Send } from 'lucide-react';

const CATEGORIES = [
    'General Inquiry',
    'Technical Support',
    'Billing & Payments',
    'Account Issues',
    'Feature Request',
    'Other'
];

const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' }
];

export default function CreateTicket({ onSuccess }) {
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        category: CATEGORIES[0],
        priority: 'medium',
        description: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userData || !formData.subject || !formData.description) return;

        setLoading(true);
        try {
            await addDoc(collection(db, 'tickets'), {
                ...formData,
                status: 'open',
                userId: userData.id,
                userEmail: userData.email,
                userName: userData.name || userData.companyName || 'User',
                userRole: userData.role,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                messages: [] // Initial empty message array for thread
            });

            // Reset form
            setFormData({
                subject: '',
                category: CATEGORIES[0],
                priority: 'medium',
                description: ''
            });

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error creating ticket:", error);
            alert("Failed to create ticket. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-[#343C6A] mb-6">Create New Ticket</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subject */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#343C6A]">Subject</label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Brief summary of the issue"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 focus:border-[#2008b9] focus:ring-0 outline-none transition-all text-[#343C6A]"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#343C6A]">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 focus:border-[#2008b9] focus:ring-0 outline-none transition-all text-[#343C6A]"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#343C6A]">Priority</label>
                        <div className="flex gap-4">
                            {PRIORITIES.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p.value })}
                                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 ${formData.priority === p.value
                                            ? `border-[#2008b9] ${p.color}`
                                            : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#343C6A]">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Please describe your issue in detail..."
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-gray-100 focus:border-[#2008b9] focus:ring-0 outline-none transition-all text-[#343C6A] resize-none"
                        required
                    />
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#2008b9] text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Submit Ticket
                    </button>
                </div>
            </form>
        </div>
    );
}
