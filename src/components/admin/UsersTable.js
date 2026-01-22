'use client';

import { BarChart2, Eye, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AddUserModal from './modals/AddUserModal';
import UserDetailModal from './modals/UserDetailModal';
import { deleteWaitlistUser } from '@/lib/waitlist';
import InstagramStats from '@/components/influencer/InstagramStats';

export default function UsersTable({ users, role, onRefetch }) {
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [analyzingUser, setAnalyzingUser] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Filter local display
    // Parent should pass filtered users if strict, but if passed all, filter here
    const filteredUsers = users.filter(u => u.role === role);

    const handleDelete = async (id) => {
        if (!confirm('Delete user?')) return;
        await deleteWaitlistUser(id);
        onRefetch();
    };

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-6 flex justify-between items-center border-b border-gray-50">
                <h2 className="text-xl font-bold text-[#343C6A] capitalize">{role}s</h2>
                <button onClick={() => setShowAddModal(true)} className="bg-[#2008b9] text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors text-sm">
                    + Add User
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50">
                        <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            <th className="px-6 py-4">User / Contact</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Submitted</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-8 text-gray-500">No users found.</td></tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${user.role === 'influencer' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                                {user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#343C6A]">{user.role === 'influencer' ? user.name : user.companyName || user.email.split('@')[0]}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${user.role === 'influencer' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{user.role}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${user.status === 'approved' ? 'bg-blue-100 text-blue-700' : user.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{user.status || 'Pending'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.submittedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-gray-500">
                                            {user.role === 'influencer' && user.instagram && (
                                                <button
                                                    onClick={() => setAnalyzingUser(user)}
                                                    className="p-2 text-gray-400 hover:text-[#2008b9] bg-white border border-gray-100 hover:border-[#2008b9]/30 rounded-lg shadow-sm"
                                                    title="Analyse Profile"
                                                >
                                                    <BarChart2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button onClick={() => setViewingUser(user)} className="p-2 text-gray-400 hover:text-blue-600 bg-white border border-gray-100 hover:border-blue-200 rounded-lg shadow-sm"><Eye className="w-4 h-4" /></button>
                                            <button onClick={() => setEditingUser(user)} className="p-2 text-gray-400 hover:text-indigo-600 bg-white border border-gray-100 hover:border-indigo-200 rounded-lg shadow-sm"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-600 bg-white border border-gray-100 hover:border-red-200 rounded-lg shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {(showAddModal || editingUser) && (
                <AddUserModal
                    onClose={() => { setShowAddModal(false); setEditingUser(null); }}
                    onSuccess={onRefetch}
                    initialUser={editingUser}
                />
            )}

            {viewingUser && <UserDetailModal user={viewingUser} onClose={() => setViewingUser(null)} />}

            {analyzingUser && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative">
                        <button onClick={() => setAnalyzingUser(null)} className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600">
                            <span className="text-xl">×</span>
                        </button>
                        <h3 className="text-xl font-bold text-[#343C6A] mb-4">Quick Analysis: @{analyzingUser.instagram}</h3>
                        <div className="mt-4">
                            <InstagramStats
                                predefinedUsername={analyzingUser.instagram}
                                userId={analyzingUser.id}
                                initialStats={analyzingUser.instagram_stats}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
