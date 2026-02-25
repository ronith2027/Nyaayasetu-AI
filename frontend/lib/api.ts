import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  post: async <T>(url: string, body: any): Promise<{ success: boolean, data: T | null, error: string | null }> => {
    try {
      const response = await apiClient.post(url, body);
      // Backend handlers already return { success, data, error } in most cases,
      // except chat which returns the data directly.
      // We need to check the structure.
      
      const resData = response.data;
      
      if (resData && typeof resData === 'object' && 'success' in resData) {
        return resData;
      }
      
      return { success: true, data: resData as T, error: null };
    } catch (err: any) {
      console.error(`API Error (${url}):`, err);
      return { 
        success: false, 
        data: null, 
        error: err.response?.data?.error || err.message || "An unknown error occurred" 
      };
    }
  },
  
  get: async <T>(url: string): Promise<{ success: boolean, data: T | null, error: string | null }> => {
    try {
      const response = await apiClient.get(url);
      const resData = response.data;
      
      if (resData && typeof resData === 'object' && 'success' in resData) {
        return resData;
      }
      
      return { success: true, data: resData as T, error: null };
    } catch (err: any) {
      console.error(`API Error (${url}):`, err);
      return { 
        success: false, 
        data: null, 
        error: err.response?.data?.error || err.message || "An unknown error occurred" 
      };
    }
  }
};
