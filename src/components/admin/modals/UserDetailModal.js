'use client';

import { X, Phone, Globe, Instagram, Briefcase } from 'lucide-react';

export default function UserDetailModal({ user, onClose }) {
    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-[#343C6A] mb-1">
                            {user.role === 'influencer' ? user.name : user.companyName || 'Business User'}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${user.role === 'influencer' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                {user.role}
                            </span>
                            <span className="text-gray-400 text-sm">•</span>
                            <span className="text-gray-500 text-sm">{user.email}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Core Info */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Profile Information</h4>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-400 font-medium mb-1">User ID / Default Password</p>
                            <code className="text-sm font-mono text-[#2008b9] font-bold select-all break-all">
                                {user.id}
                            </code>
                            <p className="text-[10px] text-gray-400 mt-1">Share this with the user for their first login.</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">Status</p>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${user.status === 'approved' ? 'bg-blue-100 text-blue-700' : user.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {user.status || 'Pending'}
                            </span>
                        </div>

                        {user.role === 'business' && (
                            <>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1">Contact Person</p>
                                    <p className="font-medium text-[#343C6A] text-lg">{user.contactPerson || '-'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Industry</p>
                                        <p className="font-medium text-[#343C6A]">{user.industry || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Website</p>
                                        <a href={user.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block max-w-[150px]">{user.website || '-'}</a>
                                    </div>
                                </div>
                            </>
                        )}

                        {user.role === 'influencer' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Niche</p>
                                        <p className="font-medium text-[#343C6A] text-lg">{user.niche || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Age Group</p>
                                        <p className="font-medium text-[#343C6A] text-lg">{user.age || '-'}</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-50 space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-1">Campaign Preferences</p>
                                        <div className="flex gap-2">
                                            {user.campaignTypes ? (
                                                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm font-medium capitalize">
                                                    {user.campaignTypes === 'both' ? 'Paid & Gifted' : user.campaignTypes}
                                                </span>
                                            ) : <span className="text-gray-400 italic">Not set</span>}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-1">Bio / Description</p>
                            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                {user.description || user.bio || 'No description provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Contact & Socials */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Contact & Socials</h4>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">Phone</p>
                                <div className="flex items-center gap-2 text-gray-700 font-medium">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {user.phone || <span className="text-gray-400 italic font-normal">Not provided</span>}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 font-medium mb-1">
                                    {user.role === 'influencer' ? 'Instagram Profile' : 'Website'}
                                </p>
                                <div className="flex items-center gap-2 text-gray-700">
                                    {user.role === 'influencer' ? <Instagram className="w-4 h-4 text-pink-500" /> : <Globe className="w-4 h-4 text-blue-500" />}
                                    {user.instagram || user.website ? (
                                        <a href={user.instagram || user.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate hover:text-blue-800 font-medium">
                                            {user.instagram || user.website}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 italic">Not provided</span>
                                    )}
                                </div>
                            </div>

                            {user.role === 'influencer' && user.portfolio && (
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1">Portfolio / Media Kit</p>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        <a href={user.portfolio} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate hover:text-blue-800 font-medium">
                                            View Portfolio
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-2">Location Information</p>
                            <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-start gap-3">
                                {user.address || user.location || 'No location info provided.'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
