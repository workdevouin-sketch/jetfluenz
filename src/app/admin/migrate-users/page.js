'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function MigrateUsersPage() {
    const { userData, loading: authLoading } = useAuth();
    const router = useRouter();
    const [migrating, setMigrating] = useState(false);
    const [results, setResults] = useState([]);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState('');

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading && userData?.role !== 'admin') {
            router.push('/login');
        }
    }, [userData, authLoading, router]);

    const migrateUsers = async () => {
        setMigrating(true);
        setError('');
        setResults([]);
        setSummary(null);

        try {
            console.log('Fetching users from Firestore...');

            // Get all users from Firestore
            const usersSnapshot = await getDocs(collection(db, 'users'));

            if (usersSnapshot.empty) {
                setError('No users found in Firestore');
                setMigrating(false);
                return;
            }

            console.log(`Found ${usersSnapshot.size} users`);

            const migrationResults = [];
            let successCount = 0;
            let skipCount = 0;
            let errorCount = 0;

            for (const userDoc of usersSnapshot.docs) {
                const firestoreId = userDoc.id;
                const userData = userDoc.data();
                const email = userData.email;

                if (!email) {
                    migrationResults.push({
                        email: 'N/A',
                        firestoreId,
                        status: 'skipped',
                        message: 'No email found'
                    });
                    skipCount++;
                    continue;
                }

                // Skip if this is the current admin user
                if (email === auth.currentUser?.email) {
                    migrationResults.push({
                        email,
                        firestoreId,
                        status: 'skipped',
                        message: 'Current admin user - skipped'
                    });
                    skipCount++;
                    continue;
                }

                try {
                    console.log(`Processing: ${email}`);

                    // Try to create user in Firebase Auth
                    // Note: This will fail if user already exists
                    await createUserWithEmailAndPassword(auth, email, firestoreId);

                    // If we get here, user was created successfully
                    migrationResults.push({
                        email,
                        firestoreId,
                        status: 'success',
                        message: `Created - Password: ${firestoreId}`,
                        password: firestoreId
                    });
                    successCount++;

                    console.log(`✓ Created: ${email}`);

                } catch (error) {
                    if (error.code === 'auth/email-already-in-use') {
                        migrationResults.push({
                            email,
                            firestoreId,
                            status: 'exists',
                            message: 'Already exists in Firebase Auth'
                        });
                        skipCount++;
                    } else {
                        migrationResults.push({
                            email,
                            firestoreId,
                            status: 'error',
                            message: error.message
                        });
                        errorCount++;
                        console.error(`✗ Error for ${email}:`, error.message);
                    }
                }
            }

            setResults(migrationResults);
            setSummary({
                total: usersSnapshot.size,
                success: successCount,
                skipped: skipCount,
                errors: errorCount
            });

        } catch (error) {
            console.error('Migration error:', error);
            setError(error.message);
        } finally {
            setMigrating(false);
        }
    };

    const downloadResults = () => {
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'migration-results.json';
        link.click();
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
                        User Migration Tool
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Migrate Firestore users to Firebase Authentication
                    </p>

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
                        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                            <li>This will create Firebase Auth accounts for all Firestore users</li>
                            <li>Initial password will be the Firestore document ID</li>
                            <li>Users should change their password after first login</li>
                            <li>Existing Auth users will be skipped</li>
                            <li><strong>Note:</strong> Due to client SDK limitations, this may not work for all users. Use the Node.js script for production.</li>
                        </ul>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Migration Button */}
                    {!summary && (
                        <button
                            onClick={migrateUsers}
                            disabled={migrating}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {migrating ? 'Migrating...' : 'Start Migration'}
                        </button>
                    )}

                    {/* Summary */}
                    {summary && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Migration Summary</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-800">{summary.total}</div>
                                    <div className="text-sm text-gray-600">Total Users</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{summary.success}</div>
                                    <div className="text-sm text-gray-600">Created</div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{summary.skipped}</div>
                                    <div className="text-sm text-gray-600">Skipped</div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
                                    <div className="text-sm text-gray-600">Errors</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Table */}
                    {results.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Detailed Results</h2>
                                <button
                                    onClick={downloadResults}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
                                >
                                    Download JSON
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Firestore ID</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {results.map((result, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-800">{result.email}</td>
                                                <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">
                                                    {result.firestoreId}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${result.status === 'success' ? 'bg-green-100 text-green-700' :
                                                            result.status === 'exists' ? 'bg-blue-100 text-blue-700' :
                                                                result.status === 'skipped' ? 'bg-gray-100 text-gray-700' :
                                                                    'bg-red-100 text-red-700'
                                                        }`}>
                                                        {result.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {result.message}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Created Users List */}
                            {results.filter(r => r.status === 'success').length > 0 && (
                                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-green-800 mb-3">
                                        ✓ Newly Created Accounts ({results.filter(r => r.status === 'success').length})
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        {results.filter(r => r.status === 'success').map((result, index) => (
                                            <div key={index} className="bg-white p-3 rounded border border-green-200">
                                                <div className="font-medium text-gray-800">{result.email}</div>
                                                <div className="text-gray-600">
                                                    Password: <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">{result.password}</code>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-6 flex gap-4">
                                <button
                                    onClick={() => {
                                        setResults([]);
                                        setSummary(null);
                                    }}
                                    className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700"
                                >
                                    Run Again
                                </button>
                                <a
                                    href="/login"
                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 text-center"
                                >
                                    Go to Login
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
