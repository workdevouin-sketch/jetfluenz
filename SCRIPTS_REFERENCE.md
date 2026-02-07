# Scripts Reference Guide

## Available Scripts

### 1. Create Admin Account
**File:** `src/scripts/createAdminAccount.js`  
**Purpose:** Create a new admin account with matching Firebase Auth and Firestore UIDs

**Usage:**
```bash
node src/scripts/createAdminAccount.js
```

**What it does:**
- ✅ Creates Firebase Auth account
- ✅ Creates Firestore document with matching UID
- ✅ Sets role to 'admin'
- ✅ Sets status to 'approved'
- ✅ Allows creating multiple admins

**When to use:**
- First time setup
- Creating additional admin accounts
- Resetting admin password

---

### 2. Migrate Users to Auth
**File:** `src/scripts/migrateUsersToAuth.js`  
**Purpose:** Migrate all Firestore users to Firebase Auth with matching UIDs

**Usage:**
```bash
node src/scripts/migrateUsersToAuth.js
```

**What it does:**
- ✅ Reads all users from Firestore `users` collection
- ✅ Creates Firebase Auth accounts with UIDs = Firestore document IDs
- ✅ Sets initial password = Firestore document ID
- ✅ Handles existing users (offers to update Firestore if UIDs don't match)
- ✅ Saves detailed results to `migration-results.json`

**When to use:**
- Migrating existing Firestore users to Firebase Auth
- After deleting mismatched Auth accounts
- Bulk user creation

---

## Prerequisites

Both scripts require:

1. **Service Account Key**
   - Download from Firebase Console
   - Project Settings → Service Accounts → Generate New Private Key
   - Save as `serviceAccountKey.json` in project root

2. **Firebase Admin SDK**
   ```bash
   npm install firebase-admin
   ```

---

## Quick Start Workflow

### First Time Setup

1. **Create Admin Account**
   ```bash
   node src/scripts/createAdminAccount.js
   ```
   - Enter your email, password, and name
   - This creates your first admin account

2. **Migrate Existing Users** (if you have users in Firestore)
   ```bash
   node src/scripts/migrateUsersToAuth.js
   ```
   - This creates Auth accounts for all Firestore users
   - Initial password = Firestore document ID

3. **Test Login**
   - Go to `http://localhost:3000/login`
   - Log in with your admin account
   - Navigate to `/admin/migrate-users` to see migration results

---

## Common Scenarios

### Scenario 1: Fresh Installation
```bash
# 1. Create admin account
node src/scripts/createAdminAccount.js

# 2. Log in and start using the app
```

### Scenario 2: Existing Firestore Users
```bash
# 1. Create admin account first
node src/scripts/createAdminAccount.js

# 2. Migrate all users
node src/scripts/migrateUsersToAuth.js

# 3. Notify users of their temporary passwords
```

### Scenario 3: Fix UID Mismatch
```bash
# 1. Delete mismatched Auth users in Firebase Console
# 2. Run migration script
node src/scripts/migrateUsersToAuth.js

# 3. Verify UIDs match in Firebase Console
```

### Scenario 4: Reset Admin Password
```bash
# Run the create admin script with existing admin email
node src/scripts/createAdminAccount.js

# It will update the existing admin's password
```

---

## Script Output Examples

### Create Admin Account
```
╔════════════════════════════════════════╗
║   JetFluenz Admin Account Creator     ║
╚════════════════════════════════════════╝

📧 Enter admin email: admin@jetfluenz.com
🔒 Enter admin password (min 6 characters): ********
👤 Enter admin name: Admin User

⏳ Creating admin account...

🆕 Creating new Firebase Auth account...
✅ Created Firebase Auth account (UID: abc123xyz...)
📄 Creating/updating Firestore document...
✅ Created/updated Firestore document

╔════════════════════════════════════════╗
║        ✅ Admin Account Created!       ║
╚════════════════════════════════════════╝

📋 Account Details:
─────────────────────────────────────────
   Email:    admin@jetfluenz.com
   Password: ********
   Name:     Admin User
   Role:     admin
   UID:      abc123xyz...
─────────────────────────────────────────

🎉 You can now log in at: http://localhost:3000/login
```

### Migrate Users
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

## Troubleshooting

### "serviceAccountKey.json not found"
**Solution:**
1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Generate New Private Key
4. Save as `serviceAccountKey.json` in project root (not in src/)

### "Module 'firebase-admin' not found"
**Solution:**
```bash
npm install firebase-admin
```

### "Permission denied"
**Solution:**
1. Check Firebase Console → IAM & Admin
2. Ensure service account has "Firebase Admin" role

### "Email already exists"
**Solution:**
- For admin script: It will update the existing user
- For migration: Script will skip and offer to update Firestore

---

## File Locations

```
jetfluenz/
├── serviceAccountKey.json          ← Place here
├── migration-results.json          ← Generated by migration script
├── src/
│   └── scripts/
│       ├── createAdminAccount.js   ← Create admin
│       └── migrateUsersToAuth.js   ← Migrate users
└── package.json
```

---

## Security Notes

⚠️ **Important:**
1. Never commit `serviceAccountKey.json` to git
2. Add it to `.gitignore`
3. Keep it secure - it has full admin access
4. Rotate keys periodically
5. Users should change their password after migration

---

## Next Steps After Running Scripts

### After Creating Admin:
1. ✅ Log in at `/login`
2. ✅ Access admin dashboard at `/admin`
3. ✅ Run user migration if needed

### After Migrating Users:
1. ✅ Check `migration-results.json`
2. ✅ Verify UIDs in Firebase Console
3. ✅ Test login with sample user
4. ✅ Send password reset emails to users
5. ✅ Implement forced password change

---

## Quick Commands Reference

```bash
# Create admin account
node src/scripts/createAdminAccount.js

# Migrate all users
node src/scripts/migrateUsersToAuth.js

# Install dependencies
npm install firebase-admin

# Start dev server
npm run dev
```
