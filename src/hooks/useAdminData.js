'use client';

import { useState, useEffect, useCallback } from 'react';
import { getWaitlistUsers, deleteWaitlistUser, addUserFromAdmin, updateWaitlistUser } from '@/lib/waitlist';
import { getAllCampaigns, updateCampaign, assignCampaign } from '@/lib/campaigns';

export function useAdminData() {
    const [users, setUsers] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        influencers: 0,
        businesses: 0,
        activeCampaigns: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Parallel fetch
            const [userRes, campRes] = await Promise.all([
                getWaitlistUsers(),
                getAllCampaigns()
            ]);

            let newUsers = [];
            let newCampaigns = [];

            if (userRes.success) {
                newUsers = userRes.users;
                setUsers(newUsers);
            }

            if (campRes.success) {
                newCampaigns = campRes.campaigns;
                setCampaigns(newCampaigns);
            }

            if (userRes.success && campRes.success) {
                setStats({
                    total: newUsers.length,
                    influencers: newUsers.filter(u => u.role === 'influencer').length,
                    businesses: newUsers.filter(u => u.role === 'business').length,
                    activeCampaigns: newCampaigns.filter(c => c.status === 'active').length
                });
            }

        } catch (err) {
            setError('An error occurred fetching data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        users,
        campaigns,
        stats,
        loading,
        error,
        refetch: fetchData,
        // Expose actions if needed, or keeping them separate is fine too. 
        // For convenience I'll just expose the raw data and let pages handle specific actions using the lib functions directly, 
        // but calling refetch after.
    };
}
