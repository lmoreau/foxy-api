import { useState, useEffect } from 'react';
import { getGraphAccessToken } from '../auth/authService';

const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:7071/api';

interface UserDetails {
    displayName: string;
    mail: string;
    jobTitle: string;
    photo: string | null;
    loading: boolean;
    error: Error | null;
}

export const useUserDetails = (email: string | undefined) => {
    const [userDetails, setUserDetails] = useState<UserDetails>({
        displayName: '',
        mail: '',
        jobTitle: '',
        photo: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!email) {
                setUserDetails(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                console.log('[UserDetails] Fetching details for email:', email);
                const token = await getGraphAccessToken();
                console.log('[UserDetails] Got token:', token.substring(0, 20) + '...');

                const response = await fetch(`${API_BASE_URL}/getUserDetails?email=${encodeURIComponent(email)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                console.log('[UserDetails] Response status:', response.status);
                const responseText = await response.text();
                console.log('[UserDetails] Response text:', responseText);

                if (!response.ok) {
                    throw new Error(`Failed to fetch user details: ${response.status} ${response.statusText}\n${responseText}`);
                }

                const data = JSON.parse(responseText);
                console.log('[UserDetails] Parsed data:', data);

                setUserDetails({
                    displayName: data.displayName,
                    mail: data.mail,
                    jobTitle: data.jobTitle,
                    photo: data.photo,
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('[UserDetails] Error:', error);
                setUserDetails(prev => ({
                    ...prev,
                    loading: false,
                    error: error instanceof Error ? error : new Error('Unknown error occurred')
                }));
            }
        };

        fetchUserDetails();
    }, [email]);

    return userDetails;
};