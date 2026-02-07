'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function FixMismatchPage() {
    const { userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [fixing, setFixing] = useState(false);
    const [results, setResults] = useState([]);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && userData?.role !== 'admin') {
            router.push('/login');
        }
    }, [userData, authLoading, router]);

    const fixMismatch = async () => {
        setFixing(true);
        setError('');
        setResults([]);
        setSummary(null);

        try {
            console.log('Scanning for UID mismatches...');

            // Get all users from Firestore
            const usersSnapshot = await getDocs(collection(db, 'users'));

            if (usersSnapshot.empty) {
                setError('No users found in Firestore');
                setFixing(false);
                return;
            }

            console.log(`Checking ${usersSnapshot.size} users`);

            const fixResults = [];
            let fixedCount = 0;
            let skipCount = 0;
            let errorCount = 0;

            // Get list of Auth users (we'll need to match by email)
            const authUsersMap = new Map();

            // Note: We can't easily list all auth users from client SDK
            // So we'll just try to match based on what we find

            for (const userDoc of usersSnapshot.docs) {
                const firestoreId = userDoc.id;
                const userData = userDoc.data();
                const email = userData.email;

                if (!email) {
                    fixResults.push({
                        email: 'N/A',
                        firestoreId,
                        status: 'skipped',
                        message: 'No email found'
                    });
                    skipCount++;
                    continue;
                }

                // Skip current admin
                if (email === auth.currentUser?.email) {
                    fixResults.push({
                        email,
                        firestoreId,
                        status: 'skipped',
                        message: 'Current admin - skipped'
                    });
                    skipCount++;
                    continue;
                }

                try {
                    // We can't easily get the Auth UID from client SDK
                    // So we'll provide instructions instead
                    fixResults.push({
                        email,
                        firestoreId,
                        status: 'info',
                        message: 'Manual fix required - see instructions below'
                    });

                } catch (error) {
                    fixResults.push({
                        email,
                        firestoreId,
                        status: 'error',
                        message: error.message
                    });
                    errorCount++;
                }
            }

            setResults(fixResults);
            setSummary({
                total: usersSnapshot.size,
                fixed: fixedCount,
                skipped: skipCount,
                errors: errorCount
            });

        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setFixing(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    if (userData?.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Fix UID Mismatch
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Resolve mismatches between Firebase Auth UIDs and Firestore document IDs
                    </p>

                    {/* Problem Explanation */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-red-800 mb-2">⚠️ Problem Detected:</h3>
                        <p className="text-sm text-red-700 mb-2">
                            The browser-based migration created Auth accounts with random UIDs instead of using the Firestore document IDs.
                        </p>
                        <p className="text-sm text-red-700">
                            <strong>Example:</strong><br />
                            Firestore ID: <code className="bg-red-100 px-1">6iOGoyEnrdlNQuXQtpRY</code><br />
                            Auth UID: <code className="bg-red-100 px-1">0TN5gECnUbOzN1yDmL49ec...</code> (different!)
                        </p>
                    </div>

                    {/* Solution Options */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-blue-800 mb-3">✓ Solution:</h3>
                        <p className="text-sm text-blue-700 mb-3">
                            You need to use the <strong>Node.js Admin SDK script</strong> which can set custom UIDs.
                        </p>

                        <div className="bg-white rounded p-4 mb-3">
                            <h4 className="font-semibold text-gray-800 mb-2">Step 1: Delete Current Auth Users</h4>
                            <p className="text-sm text-gray-600 mb-2">
                                Go to Firebase Console → Authentication → Users
                            </p>
                            <p className="text-sm text-gray-600">
                                Delete all the users that were just created (keep your admin account!)
                            </p>
                        </div>

                        <div className="bg-white rounded p-4 mb-3">
                            <h4 className="font-semibold text-gray-800 mb-2">Step 2: Download Service Account Key</h4>
                            <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                                <li>Go to Firebase Console → Project Settings → Service Accounts</li>
                                <li>Click "Generate New Private Key"</li>
                                <li>Save as <code className="bg-gray-100 px-1">serviceAccountKey.json</code> in project root</li>
                            </ol>
                        </div>

                        <div className="bg-white rounded p-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Step 3: Run Node.js Migration Script</h4>
                            <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
                                node src/scripts/migrateUsersToAuth.js
                            </pre>
                            <p className="text-sm text-gray-600 mt-2">
                                This script will create Auth accounts with UIDs matching Firestore document IDs.
                            </p>
                        </div>
                    </div>

                    {/* Alternative: Manual Mapping */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-yellow-800 mb-2">Alternative: Keep Current Auth UIDs</h3>
                        <p className="text-sm text-yellow-700 mb-2">
                            If you want to keep the current Auth accounts, you need to:
                        </p>
                        <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                            <li>Create a mapping table of Email → Auth UID → Firestore ID</li>
                            <li>Copy each Firestore document to a new document with the Auth UID</li>
                            <li>Delete the old Firestore documents</li>
                            <li>Update users to use their Auth UID as password (not ideal)</li>
                        </ol>
                        <p className="text-sm text-yellow-700 mt-2">
                            <strong>Not recommended</strong> - it's easier to recreate Auth accounts with correct UIDs.
                        </p>
                    </div>

                    {/* Current State */}
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-gray-800 mb-3">Current Mismatch Examples:</h3>
                        <div className="space-y-2 text-sm">
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="font-medium">Email: anagh.r.in@gmail.com</div>
                                <div className="text-gray-600">
                                    Firestore ID: <code className="bg-white px-1 border">6iOGoyEnrdlNQuXQtpRY</code>
                                </div>
                                <div className="text-gray-600">
                                    Auth UID: <code className="bg-white px-1 border">0TN5gECnUbOzN1yDmL49ec...</code>
                                </div>
                                <div className="text-red-600 mt-1">❌ Mismatch - user cannot log in properly</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-4">
                        <a
                            href="/admin"
                            className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 text-center"
                        >
                            Back to Admin
                        </a>
                        <a
                            href="https://console.firebase.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 text-center"
                        >
                            Open Firebase Console
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
