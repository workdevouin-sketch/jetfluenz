import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, serverTimestamp, orderBy, getDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { notifyAdmin, notifyBusiness, notifyInfluencer } from '@/actions/notifications';

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
        
        // Notify admin about the new campaign
        notifyAdmin(
            'New Campaign Created', 
            `A new campaign titled "${campaignData.title}" was created by Business ID: ${campaignData.businessId}.`
        );
        
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
                status: 'pending'
            })
        });

        try {
            const campSnap = await getDoc(campaignRef);
            if (campSnap.exists()) {
                const campData = campSnap.data();
                const businessSnap = await getDoc(doc(db, 'users', campData.businessId));
                if (businessSnap.exists()) {
                    const businessData = businessSnap.data();
                    notifyBusiness(
                        businessData.email,
                        businessData.name || 'Business Partner',
                        campData.title || 'A Campaign',
                        'New Applicant',
                        `<strong>${influencerData.name || 'An Influencer'}</strong> has applied for your campaign. Please review their profile in your dashboard.`
                    );
                }
            }
        } catch (e) {
            console.error('Notification failed:', e);
        }

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

        try {
            const campSnap = await getDoc(campaignRef);
            if (campSnap.exists()) {
                const campData = campSnap.data();
                const influencerSnap = await getDoc(doc(db, 'users', influencerId));
                if (influencerSnap.exists()) {
                    const influencerData = influencerSnap.data();
                    notifyInfluencer(
                        influencerData.email,
                        influencerName,
                        campData.title || 'A Campaign',
                        'Offered',
                        'You have been officially selected for this campaign! Please log in to accept or decline the offer.'
                    );
                }
            }
        } catch (e) {
            console.error('Notification failed:', e);
        }

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

        try {
            const campSnap = await getDoc(campaignRef);
            if (campSnap.exists()) {
                const campData = campSnap.data();
                const businessSnap = await getDoc(doc(db, 'users', campData.businessId));
                if (businessSnap.exists()) {
                    const businessData = businessSnap.data();
                    notifyBusiness(
                        businessData.email,
                        businessData.name || 'Business Partner',
                        campData.title || 'Your Campaign',
                        'Offer Accepted',
                        `Influencer <strong>${campData.assignedTo?.name || 'an influencer'}</strong> has accepted your campaign offer. You can now begin coordination.`
                    );
                }
            }
        } catch (e) {
            console.error('Notification failed:', e);
        }

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

        try {
            const campSnap = await getDoc(campaignRef);
            if (campSnap.exists()) {
                const campData = campSnap.data();
                const businessSnap = await getDoc(doc(db, 'users', campData.businessId));
                if (businessSnap.exists()) {
                    const businessData = businessSnap.data();
                    notifyBusiness(
                        businessData.email,
                        businessData.name || 'Business Partner',
                        campData.title || 'Your Campaign',
                        'Offer Declined',
                        `Influencer <strong>${campData.assignedTo?.name || 'an influencer'}</strong> has declined your campaign offer.`
                    );
                }
            }
        } catch (e) {
            console.error('Notification failed:', e);
        }

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

        try {
            const campSnap = await getDoc(doc(db, 'campaigns', campaignId));
            if (campSnap.exists()) {
                const campData = campSnap.data();
                
                // Notify Business
                const businessSnap = await getDoc(doc(db, 'users', campData.businessId));
                if (businessSnap.exists()) {
                    const businessData = businessSnap.data();
                    notifyBusiness(
                        businessData.email,
                        businessData.name || 'Business Partner',
                        campData.title || 'Your Campaign',
                        'Completed',
                        `Your campaign has been successfully marked as complete and payments have been initiated.`
                    );
                }
                
                // Notify Influencer
                if (campData.assignedTo?.id) {
                    const influencerSnap = await getDoc(doc(db, 'users', campData.assignedTo.id));
                    if (influencerSnap.exists()) {
                        const influencerData = influencerSnap.data();
                        notifyInfluencer(
                            influencerData.email,
                            influencerData.name || 'Influencer',
                            campData.title || 'Campaign',
                            'Completed',
                            'This campaign has been successfully marked as completed. Your payment is being processed.'
                        );
                    }
                }
            }
        } catch (e) {
            console.error('Notification failed:', e);
        }

        return { success: true };
    } catch (error) {
        console.error('Error completing campaign:', error);
        return { success: false, error: error.message };
    }
};
