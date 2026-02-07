# URGENT: Fix UID Mismatch Issue

## The Problem

The browser-based migration tool created Firebase Auth accounts with **random UIDs** instead of using the Firestore document IDs.

**Example:**
- ✅ Firestore Document ID: `6iOGoyEnrdlNQuXQtpRY`
- ❌ Firebase Auth UID: `0TN5gECnUbOzN1yDmL49ec...` (different!)

**Why this is a problem:**
- AuthContext looks for user data at `/users/{authUID}`
- But the data is at `/users/{firestoreID}`
- User logs in successfully but can't find their data
- Results in "unable to load user data" error

---

## The Solution

You need to **delete the mismatched Auth accounts** and **recreate them using the Node.js script** which properly sets custom UIDs.

---

## Step-by-Step Fix

### Step 1: Delete Mismatched Auth Users

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Users**
4. **Delete ALL users EXCEPT your admin account**
   - ⚠️ Make sure you keep your admin account!
   - Delete all the users that were created by the browser tool
   - They have UIDs that don't match Firestore IDs

### Step 2: Download Service Account Key

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click **Service Accounts** tab
3. Click **"Generate New Private Key"**
4. Save the file as `serviceAccountKey.json`
5. Move it to your project root directory:
   ```
   jetfluenz/
   ├── serviceAccountKey.json  ← Put it here
   ├── src/
   ├── package.json
   └── ...
   ```

### Step 3: Install Firebase Admin (if not already installed)

```bash
npm install firebase-admin
```

### Step 4: Run the Migration Script

```bash
node src/scripts/migrateUsersToAuth.js
```

**What it will do:**
1. Read all users from Firestore `users` collection
2. For each user:
   - Create Firebase Auth account
   - **Set UID = Firestore document ID** (this is the key!)
   - Set password = Firestore document ID
3. Save results to `migration-results.json`

**Example output:**
```
Processing: anagh.r.in@gmail.com (ID: 6iOGoyEnrdlNQuXQtpRY)
  → Creating Auth account...
  ✓ Created Auth account (UID: 6iOGoyEnrdlNQuXQtpRY)
  ✓ Initial password: 6iOGoyEnrdlNQuXQtpRY
```

### Step 5: Verify the Fix

1. Check `migration-results.json` to see all created accounts
2. Go to Firebase Console → Authentication → Users
3. Verify that Auth UIDs match Firestore document IDs
4. Test login with a user:
   - Email: (from Firestore)
   - Password: (Firestore document ID)

---

## Why the Browser Tool Failed

The browser tool uses `createUserWithEmailAndPassword()` from the **Client SDK**, which:
- ❌ Cannot set custom UIDs
- ❌ Always generates random UIDs
- ❌ Not suitable for this migration

The Node.js script uses `auth.createUser()` from the **Admin SDK**, which:
- ✅ Can set custom UIDs
- ✅ Matches Firestore document IDs
- ✅ Proper solution for migration

---

## After Migration

### Users can log in with:
- **Email:** Their email from Firestore
- **Password:** Their Firestore document ID

**Example:**
```
Email: business@example.com
Password: 5RGM1fn4OW2g7OdvINxO
```

### Security Recommendations:
1. ⚠️ **Send password reset emails** to all users
2. ⚠️ **Implement forced password change** on first login
3. ⚠️ **Document IDs are not secure passwords!**

---

## Verification Checklist

- [ ] Deleted all mismatched Auth users (kept admin)
- [ ] Downloaded serviceAccountKey.json
- [ ] Placed serviceAccountKey.json in project root
- [ ] Installed firebase-admin
- [ ] Ran migration script successfully
- [ ] Checked migration-results.json
- [ ] Verified UIDs match in Firebase Console
- [ ] Tested login with sample user
- [ ] User can access their dashboard

---

## Common Issues

### "serviceAccountKey.json not found"
**Fix:** Make sure the file is in the project root, not in src/ or any subfolder

### "Permission denied"
**Fix:** Check that the service account has "Firebase Admin" role in IAM settings

### "Email already in use"
**Fix:** Delete the existing Auth user first, then run the script again

### "User already exists"
**Fix:** Script will skip existing users and offer to update Firestore if UIDs don't match

---

## Need Help?

1. Check the console output from the migration script
2. Review `migration-results.json` for details
3. Verify Firebase Console shows correct UIDs
4. Test with diagnostic page: `http://localhost:3000/diagnostic`

---

## Quick Reference

**Delete Auth Users:**
Firebase Console → Authentication → Users → Delete

**Download Service Key:**
Firebase Console → Project Settings → Service Accounts → Generate New Private Key

**Run Migration:**
```bash
node src/scripts/migrateUsersToAuth.js
```

**Test Login:**
```
http://localhost:3000/login
Email: user@example.com
Password: {their-firestore-document-id}
```
