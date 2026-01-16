import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
export const addUserFromAdmin = async (userData) => {
  try {
    const newUserData = {
      email: userData.email,
      role: userData.role,
      status: userData.status || 'waitlist',
      createdAt: serverTimestamp(),
      submittedAt: new Date().toISOString()
    };

    // Add optional fields if provided (regardless of role for admin)
    if (userData.instagram) {
      newUserData.instagram = userData.instagram;
    }

    if (userData.phone) {
      newUserData.phone = userData.phone;
    }

    const docRef = await addDoc(collection(db, 'users'), newUserData);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding user from admin:', error);
    return { success: false, error: error.message };
  }
};
