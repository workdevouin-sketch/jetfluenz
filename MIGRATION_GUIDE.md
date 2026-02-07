# User Migration Guide - Firestore to Firebase Auth

## Problem
You have users in Firestore `users` collection, but they don't exist in Firebase Authentication. Users cannot log in because there are no Auth accounts.

## Solution
Migrate all Firestore users to Firebase Auth using their Firestore document ID as the initial password.

---

## Option 1: Node.js Script (Recommended for bulk migration)

### Prerequisites
1. **Download Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to **Project Settings** (gear icon) → **Service Accounts**
   - Click **"Generate New Private Key"**
   - Save the file as `serviceAccountKey.json` in your project root

2. **Install firebase-admin** (if not already installed):
   ```bash
   npm install firebase-admin
   ```

### Run Migration
```bash
node src/scripts/migrateUsersToAuth.js
```

### What It Does
1. Reads all users from Firestore `users` collection
2. For each user:
   - Checks if they already exist in Firebase Auth
   - If not, creates an Auth account with:
     - **Email:** From Firestore document
     - **Password:** The Firestore document ID (e.g., "5RGM1fn4OW2g7OdvINxO")
     - **UID:** Same as Firestore document ID
3. Saves detailed results to `migration-results.json`

### After Migration
Users can log in with:
- **Email:** Their email from Firestore
- **Password:** Their Firestore document ID

**Example:**
- Email: `business@example.com`
- Password: `5RGM1fn4OW2g7OdvINxO`

---

## Option 2: Browser-Based Migration (For admin use)

### Setup
1. Navigate to: `http://localhost:3000/admin/migrate-users`
2. Log in as admin
3. Click "Start Migration"
4. Review results

This uses Firebase Client SDK (no service account needed).

---

## Option 3: Manual Migration (For testing/single users)

### Using Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Users**
4. Click **"Add User"**
5. For each Firestore user:
   - **Email:** Copy from Firestore document
   - **Password:** Use the Firestore document ID
   - Click **"Add User"**
6. Note the generated UID
7. Update Firestore document if UID is different

---

## Important Notes

### Security Considerations
⚠️ **Using document IDs as passwords is temporary!**

1. Document IDs are somewhat predictable
2. Users should change their password after first login
3. Consider implementing:
   - Force password change on first login
   - Password reset email on account creation
   - Minimum password requirements

### Recommended: Force Password Change

Add this to your login flow:

```javascript
// In AuthContext or login page
if (userData.authMigrated && !userData.passwordChanged) {
    // Redirect to password change page
    router.push('/change-password?required=true');
}
```

### Password Reset Flow

Send password reset emails to all migrated users:

```javascript
// After migration
for (const user of migratedUsers) {
    await sendPasswordResetEmail(auth, user.email);
}
```

---

## Verification Steps

### 1. Check Migration Results
```bash
cat migration-results.json
```

### 2. Test Login
1. Go to `http://localhost:3000/login`
2. Enter a user's email
3. Enter their Firestore document ID as password
4. Should redirect to appropriate dashboard

### 3. Check Firebase Console
1. Go to **Authentication** → **Users**
2. Verify all users are listed
3. Check that UIDs match Firestore document IDs

---

## Troubleshooting

### Error: "Email already exists"
**Cause:** User already exists in Firebase Auth  
**Solution:** Script will skip and report existing users

### Error: "serviceAccountKey.json not found"
**Cause:** Service account key not downloaded  
**Solution:** Follow prerequisites step 1

### Error: "Insufficient permissions"
**Cause:** Service account doesn't have required permissions  
**Solution:** 
1. Go to Firebase Console → IAM & Admin
2. Ensure service account has "Firebase Admin" role

### Users can't log in after migration
**Cause:** UID mismatch between Auth and Firestore  
**Solution:** 
1. Check `migration-results.json`
2. Verify UIDs match
3. Re-run migration if needed

---

## Migration Checklist

- [ ] Download service account key
- [ ] Install firebase-admin
- [ ] Backup Firestore data
- [ ] Run migration script
- [ ] Review migration-results.json
- [ ] Test login with sample users
- [ ] Verify all users in Firebase Console
- [ ] Send password reset emails (optional)
- [ ] Implement force password change (recommended)
- [ ] Update documentation for users

---

## Example Migration Output

```
=== Firebase Auth Migration Tool ===

Found 25 users in Firestore.

Processing: business@example.com (ID: 5RGM1fn4OW2g7OdvINxO)
  → Creating Auth account...
  ✓ Created Auth account (UID: 5RGM1fn4OW2g7OdvINxO)
  ✓ Initial password: 5RGM1fn4OW2g7OdvINxO

Processing: influencer@example.com (ID: 7XYZ2abc3DEF4ghiJKLM)
  → Creating Auth account...
  ✓ Created Auth account (UID: 7XYZ2abc3DEF4ghiJKLM)
  ✓ Initial password: 7XYZ2abc3DEF4ghiJKLM

=== Migration Summary ===

Total users processed: 25
✓ Successfully created: 25
ℹ Already existed: 0
✗ Errors: 0

✓ Detailed results saved to: migration-results.json
```

---

## Next Steps After Migration

1. **Test the login flow**
2. **Notify users** of their temporary passwords
3. **Implement password change requirement**
4. **Consider sending password reset emails**
5. **Update user documentation**
6. **Monitor for any login issues**

---

## Support

If you encounter issues:
1. Check `migration-results.json` for details
2. Review Firebase Console → Authentication
3. Check Firestore → users collection
4. Verify service account permissions
5. Check script console output for errors
