/**
 * Migration Script: Firestore Users to Firebase Auth
 * 
 * This script:
 * 1. Reads all users from Firestore 'users' collection
 * 2. Creates Firebase Auth accounts for each user
 * 3. Uses the Firestore document ID as the initial password
 * 4. Links the Auth UID back to the Firestore document
 * 
 * Run with: node src/scripts/migrateUsersToAuth.js
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
let serviceAccount;
try {
    serviceAccount = require('../../serviceAccountKey.json');
} catch (error) {
    console.error('Error: serviceAccountKey.json not found in project root');
    console.error('Please download it from Firebase Console > Project Settings > Service Accounts');
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

async function migrateUsers() {
    try {
        console.log('\n=== Firebase Auth Migration Tool ===\n');
        console.log('This will create Firebase Auth accounts for all users in Firestore.');
        console.log('Initial password will be the Firestore document ID.\n');

        const confirm = await question('Do you want to proceed? (yes/no): ');

        if (confirm.toLowerCase() !== 'yes') {
            console.log('Migration cancelled.');
            rl.close();
            return;
        }

        console.log('\nFetching users from Firestore...\n');

        // Get all users from Firestore
        const usersSnapshot = await db.collection('users').get();

        if (usersSnapshot.empty) {
            console.log('No users found in Firestore.');
            rl.close();
            return;
        }

        console.log(`Found ${usersSnapshot.size} users in Firestore.\n`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        const results = [];

        for (const userDoc of usersSnapshot.docs) {
            const firestoreId = userDoc.id;
            const userData = userDoc.data();
            const email = userData.email;

            if (!email) {
                console.log(`⚠ Skipping ${firestoreId}: No email found`);
                skipCount++;
                continue;
            }

            console.log(`Processing: ${email} (ID: ${firestoreId})`);

            try {
                // Check if user already exists in Auth
                let authUser;
                try {
                    authUser = await auth.getUserByEmail(email);
                    console.log(`  ℹ User already exists in Auth (UID: ${authUser.uid})`);

                    // Update Firestore document with the Auth UID if different
                    if (authUser.uid !== firestoreId) {
                        console.log(`  ⚠ Auth UID (${authUser.uid}) differs from Firestore ID (${firestoreId})`);
                        console.log(`  → Updating Firestore document to use Auth UID...`);

                        // Copy document to new UID
                        await db.collection('users').doc(authUser.uid).set(userData);

                        // Optionally delete old document
                        const deleteOld = await question(`  → Delete old document (${firestoreId})? (yes/no): `);
                        if (deleteOld.toLowerCase() === 'yes') {
                            await db.collection('users').doc(firestoreId).delete();
                            console.log(`  ✓ Old document deleted`);
                        }
                    }

                    skipCount++;
                    results.push({
                        email,
                        status: 'exists',
                        authUid: authUser.uid,
                        firestoreId
                    });

                } catch (error) {
                    if (error.code === 'auth/user-not-found') {
                        // User doesn't exist in Auth, create it
                        console.log(`  → Creating Auth account...`);

                        authUser = await auth.createUser({
                            uid: firestoreId, // Use Firestore ID as Auth UID
                            email: email,
                            password: firestoreId, // Use Firestore ID as initial password
                            emailVerified: false,
                            displayName: userData.name || email.split('@')[0]
                        });

                        console.log(`  ✓ Created Auth account (UID: ${authUser.uid})`);
                        console.log(`  ✓ Initial password: ${firestoreId}`);

                        // Update Firestore document to ensure it has the correct structure
                        await db.collection('users').doc(firestoreId).update({
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                            authMigrated: true,
                            authMigratedAt: admin.firestore.FieldValue.serverTimestamp()
                        });

                        successCount++;
                        results.push({
                            email,
                            status: 'created',
                            authUid: authUser.uid,
                            firestoreId,
                            initialPassword: firestoreId
                        });

                    } else {
                        throw error;
                    }
                }

            } catch (error) {
                console.log(`  ✗ Error: ${error.message}`);
                errorCount++;
                results.push({
                    email,
                    status: 'error',
                    error: error.message,
                    firestoreId
                });
            }

            console.log(''); // Empty line for readability
        }

        // Summary
        console.log('\n=== Migration Summary ===\n');
        console.log(`Total users processed: ${usersSnapshot.size}`);
        console.log(`✓ Successfully created: ${successCount}`);
        console.log(`ℹ Already existed: ${skipCount}`);
        console.log(`✗ Errors: ${errorCount}`);

        // Detailed results
        console.log('\n=== Detailed Results ===\n');

        if (successCount > 0) {
            console.log('Newly Created Accounts:');
            results.filter(r => r.status === 'created').forEach(r => {
                console.log(`  Email: ${r.email}`);
                console.log(`  Password: ${r.initialPassword}`);
                console.log(`  Auth UID: ${r.authUid}`);
                console.log('');
            });
        }

        if (errorCount > 0) {
            console.log('Errors:');
            results.filter(r => r.status === 'error').forEach(r => {
                console.log(`  Email: ${r.email}`);
                console.log(`  Error: ${r.error}`);
                console.log('');
            });
        }

        // Save results to file
        const fs = require('fs');
        const resultsFile = 'migration-results.json';
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        console.log(`\n✓ Detailed results saved to: ${resultsFile}\n`);

        console.log('=== Important Notes ===');
        console.log('1. Users can now log in with their email and Firestore document ID as password');
        console.log('2. Advise users to change their password after first login');
        console.log('3. You may want to implement a "force password change" flow');
        console.log('4. Check migration-results.json for complete details\n');

    } catch (error) {
        console.error('\n✗ Migration Error:', error.message);
        console.error(error);
    } finally {
        rl.close();
        process.exit(0);
    }
}

// Run migration
migrateUsers();
