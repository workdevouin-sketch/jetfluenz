import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

/**
 * DELETE /api/admin/users/delete
 * Body: { userId: string }
 * 
 * Deletes the user from both Firebase Auth AND Firestore.
 * This requires Firebase Admin SDK credentials.
 */
export async function POST(request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
        }

        const errors = [];

        // 1. Delete from Firebase Authentication
        try {
            await adminAuth.deleteUser(userId);
        } catch (authError) {
            // User may not exist in Auth (e.g. manually added to Firestore only)
            if (authError.code !== 'auth/user-not-found') {
                errors.push(`Auth deletion failed: ${authError.message}`);
            }
        }

        // 2. Delete from Firestore
        try {
            await adminDb.collection('users').doc(userId).delete();
        } catch (dbError) {
            errors.push(`Firestore deletion failed: ${dbError.message}`);
        }

        if (errors.length > 0) {
            return NextResponse.json({ success: false, errors }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'User deleted from Auth and Firestore.' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
