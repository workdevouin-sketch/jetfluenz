'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getDashboardRoute } from '@/lib/auth/helpers';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Fetch user data from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData({
                            id: firebaseUser.uid,
                            email: firebaseUser.email,
                            ...data
                        });
                    } else {
                        // User exists in Auth but not in Firestore
                        setUserData({
                            id: firebaseUser.uid,
                            email: firebaseUser.email,
                            role: null
                        });
                    }
                    setUser(firebaseUser);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUserData(null);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    /**
     * Login with email and password
     */
    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.code };
        }
    };

    /**
     * Logout current user
     */
    const logout = async () => {
        try {
            await signOut(auth);
            // Clear any localStorage data
            localStorage.removeItem('jetfluenz_admin_session');
            localStorage.removeItem('jetfluenz_business_session');
            localStorage.removeItem('jetfluenz_influencer_session');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.code };
        }
    };

    /**
     * Send password reset email
     */
    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.code };
        }
    };

    /**
     * Create new user (admin only)
     */
    const createUser = async (email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Create user error:', error);
            return { success: false, error: error.code };
        }
    };

    /**
     * Get dashboard route for current user
     */
    const getUserDashboard = () => {
        if (!userData?.role) return '/';
        return getDashboardRoute(userData.role);
    };

    const value = {
        user,
        userData,
        loading,
        login,
        logout,
        resetPassword,
        createUser,
        getUserDashboard,
        // Convenience flags
        isAuthenticated: !!user,
        isAdmin: userData?.role === 'admin',
        isBusiness: userData?.role === 'business',
        isInfluencer: userData?.role === 'influencer'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
