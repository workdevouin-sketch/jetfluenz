/**
 * Authentication Helper Functions
 * Provides utilities for Firebase Auth operations
 */

/**
 * Format Firebase Auth error messages for user-friendly display
 */
export function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/invalid-email': 'Invalid email address format.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/operation-not-allowed': 'This operation is not allowed.',
        'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
        'auth/account-exists-with-different-credential': 'An account already exists with this email.',
    };

    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

/**
 * Check if user has a specific role
 */
export function hasRole(userData, role) {
    return userData?.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(userData) {
    return hasRole(userData, 'admin');
}

/**
 * Check if user is business
 */
export function isBusiness(userData) {
    return hasRole(userData, 'business');
}

/**
 * Check if user is influencer
 */
export function isInfluencer(userData) {
    return hasRole(userData, 'influencer');
}

/**
 * Get dashboard route based on user role
 */
export function getDashboardRoute(role) {
    const routes = {
        admin: '/admin',
        business: '/dashboard/business',
        influencer: '/dashboard/influencer'
    };
    return routes[role] || '/';
}

/**
 * Generate a random secure password
 */
export function generateSecurePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
    }
    return password;
}
