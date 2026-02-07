# Quick Start: User Migration

## Problem
- Users exist in Firestore `users` collection
- No corresponding Firebase Auth accounts
- Users cannot log in

## Solution
Create Firebase Auth accounts for all Firestore users using their document ID as the initial password.

---

## Quick Start (Easiest Method)

### 1. Log in as Admin
First, you need to create an admin account manually:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"**
4. Create admin account:
   - Email: your-admin@email.com
   - Password: (choose a secure password)
5. Copy the generated UID
6. Go to **Firestore Database** → `users` collection
7. Create/update a document with that UID:
   ```json
   {
     "email": "your-admin@email.com",
     "name": "Admin",
     "role": "admin",
     "status": "approved"
   }
   ```

### 2. Run Browser-Based Migration

1. Log in at `http://localhost:3000/login` with your admin account
2. Navigate to `http://localhost:3000/admin/migrate-users`
3. Click **"Start Migration"**
4. Review the results
5. Download the JSON file with credentials

### 3. Share Credentials

Send each user their login credentials:
- **Email:** (their email from Firestore)
- **Password:** (their Firestore document ID)

Example:
```
Email: business@example.com
Password: 5RGM1fn4OW2g7OdvINxO
```

---

## Alternative: Node.js Script (For Production)

### Prerequisites
1. Download service account key from Firebase Console
2. Save as `serviceAccountKey.json` in project root
3. Install dependencies: `npm install firebase-admin`

### Run
```bash
node src/scripts/migrateUsersToAuth.js
```

This is more reliable for large numbers of users.

---

## After Migration

### Users Can Log In
- Email: Their email from Firestore
- Password: Their Firestore document ID

### Security Recommendations
1. ⚠️ **Users should change their password immediately**
2. Consider implementing forced password change on first login
3. Send password reset emails to all users

---

## Files Created

1. ✅ `src/scripts/migrateUsersToAuth.js` - Node.js migration script
2. ✅ `src/app/admin/migrate-users/page.js` - Browser-based migration tool
3. ✅ `MIGRATION_GUIDE.md` - Detailed migration guide
4. ✅ `QUICK_START_MIGRATION.md` - This file

---

## Troubleshooting

### "No admin account"
→ Create admin account manually in Firebase Console first

### "Email already in use"
→ User already exists in Auth, they can log in

### "Permission denied"
→ Check Firestore security rules allow reading users collection

---

## Next Steps

1. Create admin account in Firebase Console
2. Run migration tool
3. Test login with a sample user
4. Notify all users of their credentials
5. Implement password change requirement
