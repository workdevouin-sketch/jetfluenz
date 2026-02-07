/**
 * Script to create/update a user in Firestore with proper role
 * Run with: node src/scripts/createAdmin.js
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
const serviceAccount = require('../../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createOrUpdateUser() {
    try {
        console.log('\n=== JetFluenz User Setup ===\n');

        const email = await question('Enter user email: ');
        const role = await question('Enter role (admin/business/influencer): ');
        const name = await question('Enter user name: ');

        if (!['admin', 'business', 'influencer'].includes(role)) {
            console.error('Invalid role! Must be admin, business, or influencer');
            rl.close();
            return;
        }

        // Check if user exists in Firebase Auth
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            console.log(`\n✓ Found user in Firebase Auth: ${userRecord.uid}`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log('\n✗ User not found in Firebase Auth');
                const createAuth = await question('Create user in Firebase Auth? (yes/no): ');

                if (createAuth.toLowerCase() === 'yes') {
                    const password = await question('Enter password (min 6 characters): ');
                    userRecord = await admin.auth().createUser({
                        email: email,
                        password: password,
                        emailVerified: true
                    });
                    console.log(`✓ Created user in Firebase Auth: ${userRecord.uid}`);
                } else {
                    console.log('Cancelled.');
                    rl.close();
                    return;
                }
            } else {
                throw error;
            }
        }

        // Create/Update Firestore document
        const userData = {
            email: email,
            name: name,
            role: role,
            status: 'approved',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Add role-specific fields
        if (role === 'business') {
            userData.companyName = name;
        }

        await db.collection('users').doc(userRecord.uid).set(userData, { merge: true });

        console.log('\n✓ User document created/updated in Firestore');
        console.log('\nUser Details:');
        console.log(`  UID: ${userRecord.uid}`);
        console.log(`  Email: ${email}`);
        console.log(`  Name: ${name}`);
        console.log(`  Role: ${role}`);
        console.log(`  Status: approved`);
        console.log('\n✓ User can now log in successfully!\n');

    } catch (error) {
        console.error('\n✗ Error:', error.message);
    } finally {
        rl.close();
        process.exit(0);
    }
}

createOrUpdateUser();
