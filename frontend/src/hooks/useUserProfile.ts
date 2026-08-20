
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface UserProfile {
  _id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: 'user' | 'seller' | 'admin';
  kyc_status?: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface AuthUser {
  _id: string;
  email: string;
  role: string;
}

export const useUserProfile = (user: AuthUser | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/users/${user._id}`);
        setProfile(response.data.user);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setError(error?.response?.data?.message || error.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const response = await api.put(`/users/${user._id}`, updates);
      setProfile(response.data.user);
      return response.data.user;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error?.response?.data?.message || error.message || 'Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, updateProfile };
};
