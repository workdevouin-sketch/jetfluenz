# Login Redirect Fix - Testing Guide

## Issue Fixed
The login page was redirecting to the homepage (`/`) instead of the appropriate dashboard. This was caused by a race condition where the redirect happened before the user's role data was fully loaded from Firestore.

## Changes Made

### 1. **src/app/login/page.js**

#### Change 1: Updated redirect useEffect (Lines 28-36)
**Before:**
```javascript
// Redirect if already authenticated
useEffect(() => {
    if (!authLoading && isAuthenticated) {
        router.push(getUserDashboard());
    }
}, [isAuthenticated, authLoading, router, getUserDashboard]);
```

**After:**
```javascript
// Redirect if already authenticated AND userData is loaded
useEffect(() => {
    if (!authLoading && isAuthenticated && userData?.role) {
        const dashboardRoute = getUserDashboard();
        if (dashboardRoute !== '/') {
            router.push(dashboardRoute);
        }
    }
}, [isAuthenticated, authLoading, userData, router, getUserDashboard]);
```

**Why:** Now waits for `userData?.role` to be loaded before redirecting, preventing premature redirects to `/`.

#### Change 2: Removed immediate post-login redirect (Lines 45-47)
**Before:**
```javascript
if (result.success) {
    // AuthContext will handle user data fetching
    // Redirect will happen via useEffect above
    router.push(getUserDashboard());
}
```

**After:**
```javascript
if (result.success) {
    // AuthContext will handle user data fetching
    // Redirect will happen via useEffect above once userData is loaded
    // Don't redirect immediately to avoid race condition
}
```

**Why:** Removed the immediate redirect to let the useEffect handle it after userData is loaded.

#### Change 3: Updated authenticated check (Line 71)
**Before:**
```javascript
if (isAuthenticated) {
    return null; // Will redirect via useEffect
}
```

**After:**
```javascript
if (isAuthenticated && userData?.role) {
    return null; // Will redirect via useEffect
}
```

**Why:** Prevents blank screen by only hiding login form when userData is fully loaded.

## How to Test

### Test 1: Fresh Login
1. Make sure you're logged out
2. Navigate to `http://localhost:3000/login`
3. Enter valid credentials
4. Click "Login"
5. **Expected:** Should redirect to the appropriate dashboard:
   - Admin → `/admin`
   - Business → `/dashboard/business`
   - Influencer → `/dashboard/influencer`
6. **Should NOT redirect to:** `/` (homepage)

### Test 2: Already Authenticated
1. Log in to your account
2. Navigate directly to `http://localhost:3000/login`
3. **Expected:** Should immediately redirect to your dashboard
4. **Should NOT:** Show login form or redirect to homepage

### Test 3: Invalid Credentials
1. Navigate to `http://localhost:3000/login`
2. Enter invalid credentials
3. Click "Login"
4. **Expected:** Should show error message and stay on login page
5. **Should NOT:** Redirect anywhere

### Test 4: User Without Role
1. Create a test user in Firebase Auth but don't add them to Firestore
2. Try to log in with that user
3. **Expected:** Should stay on login page (since no role exists)
4. **Should NOT:** Redirect to homepage

### Test 5: Session Expiration
1. Log in successfully
2. Wait for session to expire or manually sign out from another tab
3. Navigate to a protected route
4. **Expected:** Should redirect to `/login?expired=true`
5. Should show "Your session has expired" message

## Debugging Tips

If you still experience redirect issues:

1. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for errors related to Firebase or authentication
   - Check if `userData` is being loaded correctly

2. **Check Network Tab:**
   - Look for Firestore requests
   - Verify user document is being fetched
   - Check for any 404s or permission errors

3. **Add Debug Logging:**
   Add this to the login page useEffect:
   ```javascript
   useEffect(() => {
       console.log('Auth State:', {
           authLoading,
           isAuthenticated,
           userData,
           role: userData?.role,
           dashboardRoute: getUserDashboard()
       });
   }, [authLoading, isAuthenticated, userData]);
   ```

4. **Verify Firestore Data:**
   - Check Firebase Console
   - Ensure user document exists in `users` collection
   - Verify `role` field is set correctly

## Common Issues

### Issue: Still redirecting to homepage
**Cause:** User exists in Firebase Auth but not in Firestore
**Solution:** Ensure user document exists in Firestore with proper role

### Issue: Blank screen after login
**Cause:** userData is taking too long to load
**Solution:** Check Firestore rules and network connection

### Issue: Login button stays loading
**Cause:** Login success but no redirect happening
**Solution:** Check if userData has a valid role

## Next Steps

If the issue persists after these fixes:
1. Check the AuthContext implementation
2. Verify Firebase configuration
3. Check Firestore security rules
4. Ensure user documents have the correct structure
