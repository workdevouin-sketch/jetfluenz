'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DiagnosticPage() {
    const { user, userData, loading, isAuthenticated } = useAuth();
    const [fixing, setFixing] = useState(false);
    const [message, setMessage] = useState('');

    const fixUserData = async () => {
        if (!user) {
            setMessage('No user logged in');
            return;
        }

        setFixing(true);
        setMessage('');

        try {
            // Create/update user document with admin role
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                name: user.email.split('@')[0],
                role: 'admin', // Change this to 'business' or 'influencer' as needed
                status: 'approved',
                createdAt: new Date(),
                updatedAt: new Date()
            }, { merge: true });

            setMessage('✓ User data fixed! Please refresh the page.');
        } catch (error) {
            setMessage('✗ Error: ' + error.message);
        } finally {
            setFixing(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Login Diagnostic</h1>

                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
                        <p className="text-sm">
                            <span className="font-medium">Authenticated:</span>{' '}
                            <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                                {isAuthenticated ? '✓ Yes' : '✗ No'}
                            </span>
                        </p>
                    </div>

                    <div className="border-b pb-4">
                        <h2 className="text-xl font-semibold mb-2">Firebase Auth User</h2>
                        {user ? (
                            <div className="text-sm space-y-1">
                                <p><span className="font-medium">UID:</span> {user.uid}</p>
                                <p><span className="font-medium">Email:</span> {user.email}</p>
                                <p><span className="font-medium">Email Verified:</span> {user.emailVerified ? 'Yes' : 'No'}</p>
                            </div>
                        ) : (
                            <p className="text-red-600">No user data</p>
                        )}
                    </div>

                    <div className="border-b pb-4">
                        <h2 className="text-xl font-semibold mb-2">Firestore User Data</h2>
                        {userData ? (
                            <div className="text-sm space-y-1">
                                <p><span className="font-medium">Name:</span> {userData.name || 'N/A'}</p>
                                <p><span className="font-medium">Email:</span> {userData.email || 'N/A'}</p>
                                <p>
                                    <span className="font-medium">Role:</span>{' '}
                                    <span className={userData.role ? 'text-green-600' : 'text-red-600'}>
                                        {userData.role || '✗ MISSING (This is the problem!)'}
                                    </span>
                                </p>
                                <p><span className="font-medium">Status:</span> {userData.status || 'N/A'}</p>
                            </div>
                        ) : (
                            <p className="text-red-600">✗ No Firestore data found (This is the problem!)</p>
                        )}
                    </div>

                    <div className="border-b pb-4">
                        <h2 className="text-xl font-semibold mb-2">Issue Diagnosis</h2>
                        {!isAuthenticated && (
                            <p className="text-red-600">⚠ You are not logged in. Please log in first.</p>
                        )}
                        {isAuthenticated && !userData && (
                            <p className="text-red-600">⚠ User exists in Firebase Auth but not in Firestore database.</p>
                        )}
                        {isAuthenticated && userData && !userData.role && (
                            <p className="text-red-600">⚠ User document exists but missing 'role' field.</p>
                        )}
                        {isAuthenticated && userData?.role && (
                            <p className="text-green-600">✓ Everything looks good! You should be able to log in.</p>
                        )}
                    </div>

                    {isAuthenticated && (!userData || !userData.role) && (
                        <div className="pt-4">
                            <button
                                onClick={fixUserData}
                                disabled={fixing}
                                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                            >
                                {fixing ? 'Fixing...' : 'Fix User Data (Set as Admin)'}
                            </button>
                            {message && (
                                <p className={`mt-4 text-sm ${message.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                                    {message}
                                </p>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                This will create/update your Firestore user document with admin role.
                                Change the role in the code if you need business or influencer access.
                            </p>
                        </div>
                    )}

                    <div className="pt-4">
                        <a
                            href="/login"
                            className="block text-center text-blue-600 hover:underline"
                        >
                            ← Back to Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
