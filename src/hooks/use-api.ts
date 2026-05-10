import { useState, useCallback } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(async (url: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Check if body is FormData
    const isFormData = options.body instanceof FormData;
    
    const headers: any = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      if (!response.ok) {
        const errorMessage = (typeof result === 'object' ? result?.message : result) || response.statusText || 'Something went wrong';
        throw new Error(errorMessage);
      }

      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { callApi, loading, error, setError };
};
