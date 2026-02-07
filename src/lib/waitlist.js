import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, doc, updateDoc, deleteDoc, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';

// Add user to waitlist and create Auth account
export const addToWaitlist = async (email, role, instagramUrl = '', phoneNumber = '') => {
  try {
    const userData = {
      email,
      role,
      status: 'waitlist',
      instagram: (instagramUrl && role === 'influencer') ? instagramUrl : '',
      phone: (phoneNumber && role === 'business') ? phoneNumber : '',
    };

    return await handleSignupFlow(userData);
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Unified Signup Flow
 * 1. Creates Firebase Auth user FIRST
 * 2. Uses the resulting UID for the Firestore document
 * 3. Sets the UID as the temporary password
 * 4. Stores everything in 'users' collection (no separate collections)
 */
export const handleSignupFlow = async (userData) => {
  try {
    const { createUserWithEmailAndPassword, updatePassword, signOut } = await import('firebase/auth');
    const { auth } = await import('./firebase');

    // 1. Create Firebase Authentication user with a placeholder password
    // We'll update it to the UID immediately after
    const placeholderPwd = Math.random().toString(36).slice(-10) + 'A1!';
    let userCredential;

    try {
      userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        placeholderPwd
      );
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email already exists.' };
      }
      throw authError;
    }

    const firebaseUser = userCredential.user;
    const uid = firebaseUser.uid;

    // 2. Update password to be the UID (as requested)
    await updatePassword(firebaseUser, uid);

    // 3. Create Firestore document in 'users' collection using the UID
    const finalUserData = {
      ...userData,
      id: uid,
      firebaseUid: uid,
      status: 'waitlist',
      createdAt: serverTimestamp(),
      submittedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', uid), finalUserData);

    // 4. Sign out the newly created user (staying signed in might be confusing)
    await signOut(auth);

    return {
      success: true,
      id: uid,
      message: 'Account created and added to waitlist.'
    };
  } catch (error) {
    console.error('Signup flow error:', error);
    return { success: false, error: error.message };
  }
};

// Get all waitlist users (for admin)
export const getWaitlistUsers = async () => {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, users };
  } catch (error) {
    console.error('Error getting waitlist users:', error);
    return { success: false, error: error.message };
  }
};

// Update user in waitlist
export const updateWaitlistUser = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData = {
      ...userData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(userRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
};

// Full delete: Deletes Firestore document
// Note: Auth deletion for OTHER users requires Admin SDK/Cloud Functions
export const deleteUserAccount = async (userId) => {
  try {
    // 1. Delete Firestore document
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);

    // If deleting the CURRENTLY logged in user, we could do auth.currentUser.delete()
    // but usually this is an admin action.

    return { success: true, message: 'User deleted from Firestore. Auth account must be deleted via Firebase Console or Admin SDK.' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
};

// Add user directly from admin panel
// Add user directly from admin panel
export const addUserFromAdmin = async (userData) => {
  try {
    // Construct base data with timestamps and defaults
    const newUserData = {
      ...userData, // Spread all form fields (name, niche, companyName, etc.)
      status: userData.status || 'waitlist',
      createdAt: serverTimestamp(),
      submittedAt: new Date().toISOString()
    };

    // Clean up undefined/empty fields if necessary, or just rely on spread.
    // Ensure critical fields are present
    if (!newUserData.email) throw new Error('Email is required');
    if (!newUserData.role) throw new Error('Role is required');

    const docRef = await addDoc(collection(db, 'users'), newUserData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding user from admin:', error);
    return { success: false, error: error.message };
  }
};

// NOTE: This function is now deprecated and functionality merged into handleSignupFlow
// to match the "Auth First" requirement.
export const createAccountForUser = async (userId, userData) => {
  console.warn('createAccountForUser is deprecated. Use handleSignupFlow.');
  return { success: false, error: 'Deprecated function' };
};
