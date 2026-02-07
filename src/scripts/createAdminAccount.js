/**
 * Create Admin Account Script
 * 
 * This script creates an admin account in both Firebase Auth and Firestore
 * with matching UIDs.
 * 
 * Run with: node src/scripts/createAdminAccount.js
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
let serviceAccount;
try {
    serviceAccount = require('../../serviceAccountKey.json');
} catch (error) {
    console.error('\n❌ Error: serviceAccountKey.json not found in project root');
    console.error('📥 Please download it from Firebase Console > Project Settings > Service Accounts\n');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminAccount() {
    try {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║   JetFluenz Admin Account Creator     ║');
        console.log('╚════════════════════════════════════════╝\n');

        // Get admin details
        const email = await question('📧 Enter admin email: ');
        const password = await question('🔒 Enter admin password (min 6 characters): ');
        const name = await question('👤 Enter admin name: ');

        // Validate inputs
        if (!email || !email.includes('@')) {
            console.error('\n❌ Invalid email address');
            rl.close();
            return;
        }

        if (!password || password.length < 6) {
            console.error('\n❌ Password must be at least 6 characters');
            rl.close();
            return;
        }

        if (!name) {
            console.error('\n❌ Name is required');
            rl.close();
            return;
        }

        console.log('\n⏳ Creating admin account...\n');

        // Check if user already exists
        let userExists = false;
        let existingUid = null;

        try {
            const existingUser = await auth.getUserByEmail(email);
            userExists = true;
            existingUid = existingUser.uid;
            console.log(`ℹ️  User already exists in Firebase Auth (UID: ${existingUid})`);
        } catch (error) {
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
        }

        let authUser;
        let uid;

        if (userExists) {
            // Update existing user
            console.log('📝 Updating existing user...');

            await auth.updateUser(existingUid, {
                password: password,
                displayName: name,
                emailVerified: true
            });

            authUser = await auth.getUser(existingUid);
            uid = existingUid;

            console.log('✅ Updated Firebase Auth account');
        } else {
            // Create new user
            console.log('🆕 Creating new Firebase Auth account...');

            authUser = await auth.createUser({
                email: email,
                password: password,
                displayName: name,
                emailVerified: true
            });

            uid = authUser.uid;

            console.log(`✅ Created Firebase Auth account (UID: ${uid})`);
        }

        // Create/Update Firestore document
        console.log('📄 Creating/updating Firestore document...');

        const adminData = {
            email: email,
            name: name,
            role: 'admin',
            status: 'approved',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(uid).set(adminData, { merge: true });

        console.log('✅ Created/updated Firestore document');

        // Success summary
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║        ✅ Admin Account Created!       ║');
        console.log('╚════════════════════════════════════════╝\n');

        console.log('📋 Account Details:');
        console.log('─────────────────────────────────────────');
        console.log(`   Email:    ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Name:     ${name}`);
        console.log(`   Role:     admin`);
        console.log(`   UID:      ${uid}`);
        console.log('─────────────────────────────────────────\n');

        console.log('🎉 You can now log in at: http://localhost:3000/login\n');

        // Ask if they want to create another
        const createAnother = await question('Create another admin account? (yes/no): ');
        if (createAnother.toLowerCase() === 'yes') {
            console.log('\n');
            await createAdminAccount();
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);

        if (error.code === 'auth/email-already-exists') {
            console.error('💡 Tip: This email is already in use. Try a different email or update the existing user.');
        } else if (error.code === 'auth/invalid-email') {
            console.error('💡 Tip: Please provide a valid email address.');
        } else if (error.code === 'auth/weak-password') {
            console.error('💡 Tip: Password must be at least 6 characters long.');
        }
    } finally {
        rl.close();
        process.exit(0);
    }
}

// Run the script
createAdminAccount();
