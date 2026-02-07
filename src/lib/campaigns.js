import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, serverTimestamp, orderBy, getDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { db } from './firebase';

// Create a new campaign (Business)
export const createCampaign = async (campaignData) => {
    try {
        const data = {
            ...campaignData,
            status: campaignData.status || 'draft', // use provided status or default
            createdAt: serverTimestamp(),
            applicants: [],
            assignedTo: null
        };
        const docRef = await addDoc(collection(db, 'campaigns'), data);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating campaign:', error);
        return { success: false, error: error.message };
    }
};

// ... (existing code)

// Apply to campaign (Influencer)
export const applyToCampaign = async (campaignId, influencerData) => {
    try {
        const campaignRef = doc(db, 'campaigns', campaignId);
        await updateDoc(campaignRef, {
            applicants: arrayUnion({
                id: influencerData.id,
                name: influencerData.name || 'Influencer',
                email: influencerData.email,
                appliedAt: new Date().toISOString(),
                status: 'accepted'
            })
        });
        return { success: true };
    } catch (error) {
        console.error('Error applying to campaign:', error);
        return { success: false, error: error.message };
    }
};

// Get all campaigns (Admin)
export const getAllCampaigns = async () => {
    try {
        const q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const campaigns = [];
        querySnapshot.forEach((doc) => {
            campaigns.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, campaigns };
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return { success: false, error: error.message };
    }
};

// Get campaigns for a specific business
export const getBusinessCampaigns = async (businessId) => {
    try {
        const q = query(collection(db, 'campaigns'), where('businessId', '==', businessId));
        const querySnapshot = await getDocs(q);
        const campaigns = [];
        querySnapshot.forEach((doc) => {
            campaigns.push({ id: doc.id, ...doc.data() });
        });
        // Client-side sort if needed, or composite index
        campaigns.sort((a, b) => b.createdAt - a.createdAt);
        return { success: true, campaigns };
    } catch (error) {
        console.error('Error fetching business campaigns:', error);
        return { success: false, error: error.message };
    }
};

// Assign campaign to influencer (Admin)
export const assignCampaign = async (campaignId, influencerId, influencerName) => {
    try {
        const campaignRef = doc(db, 'campaigns', campaignId);

        // Update status to 'offered' so influencer can accept/reject
        await updateDoc(campaignRef, {
            assignedTo: { id: influencerId, name: influencerName },
            status: 'offered',
            assignedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error assigning campaign:', error);
        return { success: false, error: error.message };
    }
};

// Accept campaign (Influencer)
export const acceptCampaign = async (campaignId) => {
    try {
        const campaignRef = doc(db, 'campaigns', campaignId);
        await updateDoc(campaignRef, {
            status: 'accepted',
            acceptedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error accepting campaign:', error);
        return { success: false, error: error.message };
    }
};

// Reject campaign (Influencer)
export const rejectCampaign = async (campaignId) => {
    try {
        const campaignRef = doc(db, 'campaigns', campaignId);
        await updateDoc(campaignRef, {
            status: 'rejected',
            rejectedAt: serverTimestamp(),
            // Optional: Remove assignment so it can be reassigned? 
            // For now, keep history but status rejected.
        });
        return { success: true };
    } catch (error) {
        console.error('Error rejecting campaign:', error);
        return { success: false, error: error.message };
    }
};

// Get campaigns assigned to an influencer
export const getInfluencerCampaigns = async (influencerId) => {
    try {
        // Note: Firestore cannot query deep objects easily without specific structure. 
        // Easier to query by "assignedTo.id" if we index it, or just keep it simple.
        // Let's assume we can filter client side or use dot notation if allowed.
        // Standard safest way without complex indices for now:
        const q = query(collection(db, 'campaigns'), where('assignedTo.id', '==', influencerId));
        const querySnapshot = await getDocs(q);
        const campaigns = [];
        querySnapshot.forEach((doc) => {
            campaigns.push({ id: doc.id, ...doc.data() });
        });
        return { success: true, campaigns };
    } catch (error) {
        console.error('Error fetching influencer campaigns:', error);
        return { success: false, error: error.message };
    }
};

// Update campaign (Admin/Business)
export const updateCampaign = async (campaignId, data) => {
    try {
        const campaignRef = doc(db, 'campaigns', campaignId);
        await updateDoc(campaignRef, data);
        return { success: true };
    } catch (error) {
        console.error('Error updating campaign:', error);
        return { success: false, error: error.message };
    }
};

// Delete campaign
export const deleteCampaign = async (campaignId) => {
    try {
        const campaignRef = doc(db, 'campaigns', campaignId);
        await deleteDoc(campaignRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting campaign:', error);
        return { success: false, error: error.message };
    }
};

// Complete campaign and generate payment
export const completeCampaign = async (campaignId, paymentData) => {
    try {
        await runTransaction(db, async (transaction) => {
            const campaignRef = doc(db, 'campaigns', campaignId);
            const paymentRef = doc(collection(db, 'payments'));

            // 1. Update Campaign Status
            transaction.update(campaignRef, {
                status: 'completed',
                completedAt: serverTimestamp()
            });

            // 2. Create Payment Record
            transaction.set(paymentRef, {
                ...paymentData,
                status: 'Paid',
                createdAt: serverTimestamp(),
                campaignId: campaignId
            });
        });
        return { success: true };
    } catch (error) {
        console.error('Error completing campaign:', error);
        return { success: false, error: error.message };
    }
};
