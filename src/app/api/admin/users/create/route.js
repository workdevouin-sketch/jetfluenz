import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * POST /api/admin/users/create
 * Body: { email, role, name?, companyName?, ...other fields }
 * 
 * Creates a real Firebase Auth user AND a linked Firestore document.
 * Password is set to the user's UID so they can reset it via the login page.
 */
export async function POST(request) {
    try {
        const userData = await request.json();

        if (!userData.email || !userData.role) {
            return NextResponse.json({ success: false, error: 'Email and role are required' }, { status: 400 });
        }

        // 1. Create the Firebase Auth user
        let userRecord;
        try {
            // Create with a temporary password; we'll update it to the UID immediately after
            const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
            userRecord = await adminAuth.createUser({
                email: userData.email,
                password: tempPassword,
                displayName: userData.name || userData.companyName || userData.email.split('@')[0],
            });
        } catch (authError) {
            if (authError.code === 'auth/email-already-exists') {
                return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 400 });
            }
            throw authError;
        }

        const uid = userRecord.uid;

        // 2. Set password to UID (consistent with self-signup flow)
        await adminAuth.updateUser(uid, { password: uid });

        // 3. Create Firestore document with the same UID
        const firestoreData = {
            ...userData,
            id: uid,
            firebaseUid: uid,
            status: userData.status || 'approved', // Admin-created users default to approved
            createdAt: FieldValue.serverTimestamp(),
            submittedAt: new Date().toISOString(),
        };

        await adminDb.collection('users').doc(uid).set(firestoreData);

        return NextResponse.json({
            success: true,
            id: uid,
            message: `User created. They can log in with their email and password: ${uid}`,
        });
    } catch (error) {
        console.error('Admin create user error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
