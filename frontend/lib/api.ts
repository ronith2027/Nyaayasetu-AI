// Central API base URL for frontend
// Uses NEXT_PUBLIC_API_URL when available, falls back to localhost:8000 (FastAPI backend)
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:8000';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export const api = {
  post: async <T>(url: string, body: any): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      
      // If the response already follows our ApiResponse structure
      if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
        return result as ApiResponse<T>;
      }
      
      // If the backend returns success: true but directly the data (some FastAPI responses)
      if (result && typeof result === 'object' && 'success' in result) {
         // This covers cases where backend returns {"success": True, "data": [...]} 
         // which is handled by the first if, or {"success": True, ...other_fields}
         if ('data' in result) return result as ApiResponse<T>;
         
         const { success, error, ...rest } = result;
         return { 
           success: !!success, 
           data: (Object.keys(rest).length > 0 ? rest : result) as T, 
           error: error || null 
         };
      }
      
      // Fallback for direct data (like /chat or /schemes returning List directly)
      return { success: true, data: result as T, error: null };
    } catch (err: any) {
      console.error(`API Error (${url}):`, err);
      return { success: false, data: null, error: err.message };
    }
  },
  
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${BASE_URL}${url}`);
      const result = await response.json();
      
      if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
        return result as ApiResponse<T>;
      }

      if (result && typeof result === 'object' && 'success' in result) {
         const { success, error, ...rest } = result;
         return { 
           success: !!success, 
           data: (Object.keys(rest).length > 0 ? rest : result) as T, 
           error: error || null 
         };
      }
      
      return { success: true, data: result as T, error: null };
    } catch (err: any) {
      console.error(`API Error (${url}):`, err);
      return { 
        success: false, 
        data: null, 
        error: err.message || "An unknown error occurred" 
      };
    }
  }
};
