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

    // Only add Instagram URL if provided and user is an influencer
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

export const createAccountForUser = async (userId, userData) => {
  try {
    // 1. Update User Status to Approved
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
      password: userId, // Default password is the User ID
    });

    // 2. Initialize Role-Specific Dashboard Data
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

    return { success: true };
  } catch (error) {
    console.error('Error creating account:', error);
    return { success: false, error: error.message };
  }
};
