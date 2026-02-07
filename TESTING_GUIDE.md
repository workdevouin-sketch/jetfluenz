# 🧪 Firebase Authentication Testing Guide

## ✅ Implementation Complete!

Your JetFluenz application has been successfully upgraded with Firebase Authentication. Here's how to test everything.

---

## 📋 Pre-Testing Checklist

### 1. **Enable Firebase Authentication**

Before testing, you MUST enable Email/Password authentication in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **jetfluenz**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. **Enable** both toggles:
   - ✅ Email/Password
   - ✅ Email link (passwordless sign-in) - Optional
6. Click **Save**

### 2. **Update Firestore Security Rules**

Update your Firestore rules to work with Firebase Auth:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isAdmin();
    }
    
    // Influencers collection
    match /influencers/{influencerId} {
      allow read: if isSignedIn();
      allow update: if isOwner(influencerId) || isAdmin();
      allow create, delete: if isAdmin();
    }
    
    // Businesses collection
    match /businesses/{businessId} {
      allow read: if isSignedIn();
      allow update: if isOwner(businessId) || isAdmin();
      allow create, delete: if isAdmin();
    }
    
    // Campaigns collection
    match /campaigns/{campaignId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
  }
}
```

### 3. **Install Dependencies** (if needed)

```bash
npm install
```

### 4. **Start Development Server**

```bash
npm run dev
```

---

## 🧪 Testing Scenarios

### **Test 1: Create Admin Account (First Time Setup)**

Since we removed hardcoded admin credentials, you need to create an admin account in Firebase:

#### Option A: Via Firebase Console (Recommended)

1. Go to Firebase Console → **Authentication** → **Users**
2. Click **Add User**
3. Enter:
   - Email: `devou.in@gmail.com` (or your admin email)
   - Password: Create a secure password
4. Click **Add User**
5. Copy the **User UID**
6. Go to **Firestore Database** → **users** collection
7. Create a new document with ID = **User UID** you copied
8. Add fields:
   ```json
   {
     "email": "devou.in@gmail.com",
     "role": "admin",
     "status": "approved",
     "name": "Admin",
     "createdAt": <Firestore Timestamp>
   }
   ```

#### Option B: Via Code (Temporary Script)

Create a temporary file `scripts/createAdmin.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCKrg7YjXMG8xWxNdkCQqMOC9MtRbWvWnk",
  authDomain: "jetfluenz.firebaseapp.com",
  projectId: "jetfluenz",
  storageBucket: "jetfluenz.firebasestorage.app",
  messagingSenderId: "647329868473",
  appId: "1:647329868473:web:28a51ee04ab332bd25c968"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'devou.in@gmail.com',
      'YourSecurePassword123!' // Change this!
    );

    const userId = userCredential.user.uid;

    // Create Firestore document
    await setDoc(doc(db, 'users', userId), {
      email: 'devou.in@gmail.com',
      role: 'admin',
      status: 'approved',
      name: 'Admin',
      createdAt: serverTimestamp()
    });

    console.log('✅ Admin account created successfully!');
    console.log('User ID:', userId);
    console.log('Email: devou.in@gmail.com');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
```

Run it:
```bash
node scripts/createAdmin.js
```

---

### **Test 2: Admin Login**

1. Navigate to `http://localhost:3000/login`
2. Enter admin credentials:
   - Email: `devou.in@gmail.com`
   - Password: (the password you set)
3. Click **Login**

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Redirects to `/admin` dashboard
- ✅ No errors in console
- ✅ User data appears in dashboard

**Check Console:**
```javascript
// Should see AuthContext loading user data
```

---

### **Test 3: Create New User (Business/Influencer)**

1. Log in as admin
2. Go to **Influencers** or **Business** tab
3. Click **Add New User** (or similar button)
4. Fill in user details:
   - Email: `test@example.com`
   - Name: `Test User`
   - Role: `influencer` or `business`
5. Click **Create Account**

**Expected Results:**
- ✅ Firebase Auth user created
- ✅ Firestore document created in `users` collection
- ✅ Password reset email sent to user
- ✅ Console shows: "Password reset email sent to: test@example.com"

**Check Firebase Console:**
- Go to **Authentication** → **Users**
- New user should appear with email `test@example.com`

---

### **Test 4: User Login (First Time)**

1. **Check Email** (use a real email or check Firebase Console for the password reset link)
2. Click the password reset link in email
3. Set a new password
4. Go to `http://localhost:3000/login`
5. Enter:
   - Email: `test@example.com`
   - Password: (the password you just set)
6. Click **Login**

**Expected Results:**
- ✅ Redirects to appropriate dashboard (`/dashboard/influencer` or `/dashboard/business`)
- ✅ User data loads correctly
- ✅ No errors in console

---

### **Test 5: Password Reset Flow**

1. Go to `http://localhost:3000/login`
2. Click **Forgot Password?**
3. Enter email: `test@example.com`
4. Click **Send Reset Link**

**Expected Results:**
- ✅ Success message: "Password reset email sent! Check your inbox."
- ✅ Email received with reset link
- ✅ Can reset password and log in again

---

### **Test 6: Session Persistence**

1. Log in as any user
2. **Refresh the page** (F5)

**Expected Results:**
- ✅ User stays logged in
- ✅ Dashboard loads without redirect to login
- ✅ User data persists

3. **Close browser completely**
4. **Reopen browser** and go to dashboard URL

**Expected Results:**
- ✅ User stays logged in (Firebase Auth persists sessions)

---

### **Test 7: Logout**

1. While logged in, click **Logout** in sidebar
2. Wait for logout to complete

**Expected Results:**
- ✅ "Logging out..." text appears briefly
- ✅ Redirects to `/login`
- ✅ Cannot access dashboard without logging in again
- ✅ localStorage cleared
- ✅ Firebase Auth session cleared

---

### **Test 8: Unauthorized Access**

1. **Log out** if logged in
2. Try to access:
   - `http://localhost:3000/dashboard/business`
   - `http://localhost:3000/dashboard/influencer`
   - `http://localhost:3000/admin`

**Expected Results:**
- ✅ Immediately redirects to `/login`
- ✅ Cannot view protected content

---

### **Test 9: Role-Based Authorization**

1. Log in as **influencer**
2. Try to access `http://localhost:3000/dashboard/business`

**Expected Results:**
- ✅ Redirects back to `/dashboard/influencer`
- ✅ Cannot access business dashboard

3. Try to access `http://localhost:3000/admin`

**Expected Results:**
- ✅ Redirects back to `/dashboard/influencer`
- ✅ Cannot access admin panel

---

### **Test 10: Account Status Checks**

#### Test Banned Account:

1. In Firestore, update a user's status to `"banned"`
2. Try to log in with that account

**Expected Results:**
- ✅ Redirects to `/login?error=banned`
- ✅ Cannot access dashboard

#### Test Pending Account:

1. In Firestore, update a user's status to `"waitlist"`
2. Try to log in with that account

**Expected Results:**
- ✅ Redirects to `/login?error=pending`
- ✅ Cannot access dashboard

---

### **Test 11: Error Handling**

#### Test Invalid Email:

1. Go to login page
2. Enter: `invalid-email`
3. Click Login

**Expected Results:**
- ✅ Browser validation prevents submission (HTML5 email validation)

#### Test Wrong Password:

1. Enter correct email but wrong password
2. Click Login

**Expected Results:**
- ✅ Error message: "Incorrect password."
- ✅ User-friendly error (not technical Firebase error)

#### Test Non-Existent Account:

1. Enter email that doesn't exist
2. Click Login

**Expected Results:**
- ✅ Error message: "No account found with this email."

---

## 🐛 Common Issues & Solutions

### Issue 1: "Firebase: Error (auth/operation-not-allowed)"

**Solution:** Enable Email/Password authentication in Firebase Console (see Pre-Testing Checklist #1)

---

### Issue 2: "Firebase: Error (auth/unauthorized-domain)"

**Solution:** 
1. Go to Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add `localhost` if not already there

---

### Issue 3: "Permission denied" when creating users

**Solution:** Update Firestore security rules (see Pre-Testing Checklist #2)

---

### Issue 4: Password reset emails not sending

**Solution:**
1. Check Firebase Console → **Authentication** → **Templates**
2. Verify email template is configured
3. Check spam folder
4. For development, check Firebase Console → **Authentication** → **Users** → Click user → **Send password reset email**

---

### Issue 5: "useAuth must be used within AuthProvider"

**Solution:** Make sure `AuthProvider` is wrapping your app in `layout.js` (already done in implementation)

---

### Issue 6: User data not loading

**Solution:**
1. Check Firestore document exists with same ID as Firebase Auth UID
2. Check Firestore security rules allow read access
3. Check browser console for errors

---

## 📊 Verification Checklist

After testing, verify:

- [ ] ✅ Admin can log in with Firebase Auth
- [ ] ✅ Admin can create new users
- [ ] ✅ New users receive password reset emails
- [ ] ✅ Users can set their own passwords
- [ ] ✅ Users can log in with email/password
- [ ] ✅ Sessions persist across page refreshes
- [ ] ✅ Logout works correctly
- [ ] ✅ Unauthorized users cannot access protected routes
- [ ] ✅ Role-based authorization works (influencer can't access business dashboard)
- [ ] ✅ Banned/pending accounts are blocked
- [ ] ✅ Password reset flow works
- [ ] ✅ Error messages are user-friendly
- [ ] ✅ No hardcoded credentials in code
- [ ] ✅ No localStorage sessions (using Firebase Auth tokens)

---

## 🔒 Security Improvements Achieved

| Security Feature | Before | After |
|------------------|--------|-------|
| **Admin Credentials** | Hardcoded in client code | Firebase Auth with secure password |
| **Password Storage** | Plain text (userId) | Firebase bcrypt hashing |
| **Session Management** | localStorage (insecure) | Firebase Auth tokens (httpOnly) |
| **Password Reset** | Not available | Email-based secure reset |
| **Account Creation** | Manual password = userId | Auto-generated secure password |
| **Role Management** | Client-side only | Firestore + Firebase Auth |
| **Session Expiration** | Never | Firebase default (1 hour, auto-refresh) |
| **CSRF Protection** | None | Firebase SDK built-in |

---

## 📝 Next Steps (Optional Enhancements)

1. **Email Verification**
   - Require users to verify email before accessing dashboard
   - Add `sendEmailVerification()` after account creation

2. **Two-Factor Authentication (2FA)**
   - Enable phone authentication in Firebase
   - Add 2FA for admin accounts

3. **Custom Claims**
   - Use Firebase Admin SDK to set custom claims for roles
   - More secure than Firestore-based role checking

4. **Rate Limiting**
   - Add Firebase App Check to prevent abuse
   - Implement rate limiting on login attempts

5. **Audit Logging**
   - Log all authentication events to Firestore
   - Track login attempts, password resets, etc.

---

## 🎉 Testing Complete!

Once all tests pass, your authentication system is production-ready with enterprise-grade security!

**Remember:**
- Never commit `.env.local` to Git
- Use different credentials for production
- Enable Firebase App Check for production
- Monitor authentication logs in Firebase Console

---

## 📞 Support

If you encounter any issues during testing:

1. Check browser console for errors
2. Check Firebase Console → **Authentication** → **Users**
3. Check Firestore data structure
4. Verify environment variables are set correctly
5. Clear browser cache and localStorage

**Happy Testing! 🚀**
