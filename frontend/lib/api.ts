// Real API wrapper for NyayaSetu
const BASE_URL = 'http://localhost:8000';

export const api = {
  post: async <T>(url: string, body: any): Promise<{ success: boolean, data: T | null, error: string | null }> => {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      
      // Handle different response structures from the backend
      if (url === '/complaint') {
          return result;
      }
      
      return { success: true, data: result as T, error: null };
    } catch (err: any) {
      console.error(`API Error (${url}):`, err);
      return { success: false, data: null, error: err.message };
    }
  }
};
