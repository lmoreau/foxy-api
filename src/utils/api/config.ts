import { getDynamicsAccessToken } from '../../auth/authService';

export const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:7071/api';
export const DATAVERSE_URL = 'https://foxy.crm3.dynamics.com';

// Performance monitoring utilities
export const now = () => performance.now();
export const formatDuration = (start: number, end: number) => `${(end - start).toFixed(2)}ms`;

// Keep track of first request time to detect cold starts
export const requestTimeTracker = {
  firstRequestTime: null as number | null
};

export const getAuthHeaders = async () => {
  try {
    const token = await getDynamicsAccessToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    return {
      Authorization: bearerToken,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    throw error;
  }
};

export const getDataverseHeaders = async () => {
  try {
    const token = await getDynamicsAccessToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    
    return {
      Authorization: bearerToken,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Accept': 'application/json',
      'Prefer': 'return=representation'
    };
  } catch (error) {
    throw error;
  }
};
