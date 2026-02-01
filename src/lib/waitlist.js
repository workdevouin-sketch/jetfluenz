import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, doc, updateDoc, deleteDoc, setDoc, where } from 'firebase/firestore';
import { db } from './firebase';

// Add user to waitlist
export const addToWaitlist = async (email, role, instagramUrl = '', phoneNumber = '') => {
  try {
    const userData = {
      email: email,
      role: role, // 'influencer' or 'business'
      status: 'waitlist',
      createdAt: serverTimestamp(),
      submittedAt: new Date().toISOString()
    };

    // Only add Instagram ID if provided and user is an influencer
    // Note: Validation is mostly handled on frontend, but we store what's passed.
    if (instagramUrl && role === 'influencer') {
      userData.instagram = instagramUrl;
    }

    // Only add phone number if provided and user is a business
    if (phoneNumber && role === 'business') {
      userData.phone = phoneNumber;
    }

    const docRef = await addDoc(collection(db, 'users'), userData);

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
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

// Delete user from waitlist
export const deleteWaitlistUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    return { success: true };
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

// Create Account (Approve & Initialize)
// NOTE: This function should ideally be called from a server-side API route
// For now, it's client-side but will create Firebase Auth users

export const createAccountForUser = async (userId, userData) => {
  try {
    // Import Firebase Auth functions (dynamic import to avoid client-side issues)
    const { createUserWithEmailAndPassword, sendPasswordResetEmail } = await import('firebase/auth');
    const { auth } = await import('./firebase');
    const { generateSecurePassword } = await import('./auth/helpers');

    // 1. Generate a secure random password
    const temporaryPassword = generateSecurePassword(16);

    // 2. Create Firebase Authentication user
    let firebaseUser;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        temporaryPassword
      );
      firebaseUser = userCredential.user;

      // If userId from Firestore doesn't match Firebase UID, we need to handle this
      // For now, we'll use the Firebase UID as the primary ID
      console.log('Created Firebase Auth user:', firebaseUser.uid);
    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        // User already exists in Firebase Auth, that's okay
        console.log('User already exists in Firebase Auth');
      } else {
        throw authError;
      }
    }

    // 3. Update Firestore user document with approved status
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
      firebaseUid: firebaseUser?.uid || userId, // Store Firebase UID
    });

    // 4. Send password reset email for user to set their own password
    try {
      await sendPasswordResetEmail(auth, userData.email);
      console.log('Password reset email sent to:', userData.email);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // Don't fail the entire operation if email fails
    }

    // 5. Initialize Role-Specific Dashboard Data
    // Base object with common fields
    const baseData = {
      id: userId,
      email: userData.email,
      role: userData.role,
      status: 'approved',
      createdAt: serverTimestamp(),
      phone: userData.phone || '',
      instagram: userData.instagram || '',
      website: userData.website || '',
      location: userData.location || '',
      // Default Stats
      notifications: [],
      messages: []
    };

    if (userData.role === 'influencer') {
      const influencerData = {
        ...baseData,
        name: userData.name || 'New Influencer',
        niche: userData.niche || '',
        followers: userData.followers || 0,
        engagement: userData.engagement || '',
        portfolio: userData.portfolio || '',
        // Dashboard specific
        balance: 0,
        earnings: [],
        campaigns: [],
      };
      await setDoc(doc(db, 'influencers', userId), influencerData);
    } else {
      const businessData = {
        ...baseData,
        name: userData.companyName || userData.name || 'New Business', // Dashboard display name
        companyName: userData.companyName || '',
        contactPerson: userData.contactPerson || '',
        industry: userData.industry || '',
        // Dashboard specific
        totalSpend: 0,
        invoices: [],
        employees: [],
      };
      await setDoc(doc(db, 'businesses', userId), businessData);
    }

    return {
      success: true,
      message: 'Account created successfully. Password reset email sent to user.',
      temporaryPassword // Return for admin reference (don't store this!)
    };
  } catch (error) {
    console.error('Error creating account:', error);
    return { success: false, error: error.message };
  }
};
