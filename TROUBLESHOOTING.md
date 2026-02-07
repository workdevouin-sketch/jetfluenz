# Login Redirect Issue - Troubleshooting Guide

## Problem Summary
Login is successful but the page shows: **"Login successful but unable to load user data. Please refresh the page."**

This means:
- ✓ Firebase Authentication is working
- ✗ User data from Firestore is not loading or missing the `role` field

## Root Cause
The user exists in Firebase Auth but either:
1. No corresponding document exists in Firestore `users` collection, OR
2. The Firestore document exists but is missing the `role` field

## Quick Fix (Recommended)

### Option 1: Use the Diagnostic Page
1. Navigate to: `http://localhost:3000/diagnostic`
2. You'll see your authentication status and user data
3. If there's an issue, click the **"Fix User Data"** button
4. Refresh the page
5. Try logging in again at `/login`

### Option 2: Manual Fix in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Navigate to the `users` collection
5. Find the document with your user's UID (you can get this from the diagnostic page)
6. If the document doesn't exist, create it with these fields:
   ```json
   {
     "email": "your-email@example.com",
     "name": "Your Name",
     "role": "admin",  // or "business" or "influencer"
     "status": "approved",
     "createdAt": <current timestamp>,
     "updatedAt": <current timestamp>
   }
   ```
7. If the document exists but is missing `role`, add it:
   ```json
   {
     "role": "admin"  // or "business" or "influencer"
   }
   ```

## Code Changes Made

### 1. Fixed Race Condition
**File:** `src/app/login/page.js`

- Added `useRef` to track timeout
- Clear timeout when redirect happens successfully
- Only redirect when `userData.role` is loaded
- Added console logging for debugging

### 2. Created Diagnostic Tool
**File:** `src/app/diagnostic/page.js`

- Shows authentication status
- Displays Firebase Auth user data
- Displays Firestore user data
- Identifies the exact problem
- Provides one-click fix button

### 3. Created Admin Script
**File:** `src/scripts/createAdmin.js`

- Interactive CLI tool to create/update users
- Handles both Firebase Auth and Firestore
- Ensures proper role assignment

## Testing Steps

### Step 1: Check Current State
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to `http://localhost:3000/login`
4. Enter credentials and click Login
5. Watch the console logs:
   ```
   Login redirect check: { 
     authLoading: false, 
     isAuthenticated: true, 
     hasRole: false,  // ← This should be true
     role: null,      // ← This should be 'admin', 'business', or 'influencer'
     dashboardRoute: 'N/A'
   }
   ```

### Step 2: Use Diagnostic Page
1. Navigate to `http://localhost:3000/diagnostic`
2. Review all the information shown
3. If there's a problem, use the "Fix User Data" button
4. Refresh the page

### Step 3: Test Login Again
1. Go to `http://localhost:3000/login`
2. Enter your credentials
3. Click Login
4. You should now be redirected to your dashboard

## Expected Console Output (Working)

When login works correctly, you should see:
```
Login redirect check: { 
  authLoading: false, 
  isAuthenticated: true, 
  hasRole: true,
  role: 'admin',
  dashboardRoute: '/admin'
}
Redirecting to: /admin
```

## Expected Console Output (Not Working)

If userData is missing or has no role:
```
Login redirect check: { 
  authLoading: false, 
  isAuthenticated: true, 
  hasRole: false,
  role: null,
  dashboardRoute: 'N/A'
}
```

## Common Issues

### Issue 1: "Login successful but unable to load user data"
**Cause:** Firestore document missing or no role field  
**Fix:** Use diagnostic page or manually add role in Firebase Console

### Issue 2: Infinite loading
**Cause:** userData never loads  
**Fix:** Check Firestore security rules, ensure user document exists

### Issue 3: Redirects to homepage (/)
**Cause:** `getUserDashboard()` returns '/' when no role  
**Fix:** Add role field to user document

### Issue 4: "User not found" error
**Cause:** User doesn't exist in Firebase Auth  
**Fix:** Create user using Firebase Console or admin script

## Firestore Security Rules

Make sure your Firestore rules allow reading user documents:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can read their own document
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Only admins can write
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Files Modified

1. ✅ `src/app/login/page.js` - Fixed redirect logic
2. ✅ `src/app/diagnostic/page.js` - Created diagnostic tool
3. ✅ `src/scripts/createAdmin.js` - Created user setup script
4. ✅ `LOGIN_REDIRECT_FIX.md` - Original fix documentation
5. ✅ `TROUBLESHOOTING.md` - This file

## Next Steps

1. Visit `/diagnostic` to see what's wrong
2. Use the fix button or manually update Firestore
3. Test login again
4. If still having issues, check browser console and share the logs

## Need More Help?

If you're still experiencing issues:
1. Check the browser console for errors
2. Verify Firebase configuration in `.env.local`
3. Check Firestore security rules
4. Ensure Firebase project is properly set up
5. Share the console logs from the diagnostic page
