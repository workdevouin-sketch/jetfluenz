import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Tries to fetch existing stats from Firestore first.
 * @param {string} userId 
 */
export async function getStatsFromDB(userId) {
    if (!userId) return null;
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.instagram_stats || null;
        }
        return null;
    } catch (e) {
        console.error("Error fetching stats from DB:", e);
        return null;
    }
}

/**
 * Fetches Instagram data from internal API routes and updates the user's Firestore document.
 * @param {string} userId - The Firestore User ID
 * @param {string} username - The Instagram handle
 */
export async function syncInstagramStats(userId, username) {
    if (!username) return null;

    try {
        console.log(`Syncing stats for ${username}...`);

        // 1. Fetch from internal APIs (Client-side fetch to our own Next.js routes)
        const [profileRes, metricsRes] = await Promise.all([
            fetch(`/api/meta/business-discovery?username=${username}`),
            fetch(`/api/meta/analytics?username=${username}`)
        ]);

        const profileData = await profileRes.json();
        const metricsData = await metricsRes.json();

        // Check for API errors (graceful fallback)
        if (profileData.error || metricsData.error) {
            console.error("Meta API Error during sync:", profileData.error || metricsData.error);
            // If failed, we don't overwrite existing db data with null, we just return null/false
            return { success: false, error: profileData.error || metricsData.error };
        }

        // 2. Structure the data
        const statsData = {
            profile: profileData.business_discovery,
            metrics: metricsData,
            last_fetched: new Date().toISOString() // Store as ISO string for easier client comparison
        };

        // 3. Update Firestore (Only if userId is provided)
        // We update the 'users' collection. 
        // Note: Ensure your Firestore Rules allow this update for the logged-in user.
        if (userId) {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                instagram_stats: statsData,
                last_stats_update: serverTimestamp()
            });
            console.log("Stats synced to Firestore");
        } else {
            console.log("Stats fetched (no DB save)");
        }

        return { success: true, data: statsData };

    } catch (error) {
        console.error("Sync failed:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Checks if the stats needs updating (older than 7 days)
 * @param {string} lastFetchedIsoString 
 * @returns {boolean}
 */
export function shouldUpdateStats(lastFetchedIsoString) {
    if (!lastFetchedIsoString) return true; // No data, update needed

    const lastFetch = new Date(lastFetchedIsoString);
    const now = new Date();
    const diffTime = Math.abs(now - lastFetch);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 7; // Update if 7 days or older
}
