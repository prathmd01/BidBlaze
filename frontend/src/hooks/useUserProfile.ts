
import { useState, useEffect } from 'react';

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
        
        const response = await fetch(`/api/users/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setProfile(data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch profile');
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

      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfile(data.user);
      return data.user;
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, updateProfile };
};
